import {
  collectReferencedMediaRefs,
  getCleanupMode,
  ORPHAN_MIN_AGE_MS,
  runS3MediaCleanup,
  type CleanupObject,
  type CleanupSite,
} from "./s3-media-cleanup";

const bucket = "invite-bucket";
const ref = (key: string) => `s3://${bucket}/${key}`;
const NOW = new Date("2026-10-20T12:00:00.000Z");
const OLD = new Date(NOW.getTime() - ORPHAN_MIN_AGE_MS - 1);
const FRESH = new Date(NOW.getTime() - ORPHAN_MIN_AGE_MS + 60_000);

const USED_COVER = ref("invite-images/cover/2026/used.webp");
const USED_MUSIC = ref("invite-music/2026/used.mp3");
const ORPHAN_IMAGE = ref("invite-images/portrait/2026/orphan.webp");
const ORPHAN_MUSIC = ref("invite-music/2026/orphan.mp3");
const FRESH_IMAGE = ref("invite-images/cover/2026/fresh.webp");

async function* iterate<T>(items: T[]) {
  yield* items;
}

const makeSite = (invite: Record<string, unknown> = {}): CleanupSite => ({
  id: "site-1",
  invite: {
    coverImageUrl: USED_COVER,
    musicUrl: USED_MUSIC,
    portraitImageUrl: "",
    venueImageUrl: "https://cdn.example.com/venue.jpg",
    ...invite,
  },
});

const makeObject = (objectRef: string, lastModified = OLD, size = 2048): CleanupObject => ({
  lastModified,
  ref: objectRef,
  size,
});

function makeOptions(overrides: {
  apply?: boolean;
  objects?: CleanupObject[];
  sites?: CleanupSite[];
  deleteInviteMediaObject?: jest.Mock;
}) {
  const s3Storage = {
    deleteInviteMediaObject:
      overrides.deleteInviteMediaObject ?? jest.fn().mockResolvedValue(undefined),
  };

  return {
    options: {
      apply: overrides.apply ?? false,
      log: jest.fn(),
      logError: jest.fn(),
      now: NOW,
      objects: iterate(
        overrides.objects ?? [
          makeObject(USED_COVER),
          makeObject(USED_MUSIC),
          makeObject(ORPHAN_IMAGE),
          makeObject(ORPHAN_MUSIC),
          makeObject(FRESH_IMAGE, FRESH),
        ],
      ),
      s3Storage,
      sites: iterate(overrides.sites ?? [makeSite()]),
    },
    s3Storage,
  };
}

describe("collectReferencedMediaRefs", () => {
  it("collects only s3 refs from image fields and music", async () => {
    const { refs, siteCount } = await collectReferencedMediaRefs(
      iterate([
        makeSite({ portraitImageUrl: "data:image/png;base64,AAAA" }),
        { id: "site-2", invite: { coverImageUrl: ORPHAN_IMAGE, musicUrl: 42 } },
        { id: "site-3" },
      ]),
    );

    expect(siteCount).toBe(3);
    expect([...refs].sort()).toEqual([ORPHAN_IMAGE, USED_COVER, USED_MUSIC].sort());
  });
});

describe("runS3MediaCleanup", () => {
  it("dry-run reports orphans without deleting", async () => {
    const { options, s3Storage } = makeOptions({});

    const summary = await runS3MediaCleanup(options);

    expect(s3Storage.deleteInviteMediaObject).not.toHaveBeenCalled();
    expect(summary).toEqual({
      deletedCount: 0,
      failedCount: 0,
      freshCount: 1,
      objectCount: 5,
      orphanBytes: 4096,
      orphanCount: 2,
      referencedCount: 2,
      siteCount: 1,
    });
    expect(options.log).toHaveBeenCalledWith(expect.stringContaining(ORPHAN_IMAGE));
  });

  it("apply deletes only old unreferenced images and music", async () => {
    const { options, s3Storage } = makeOptions({ apply: true });

    const summary = await runS3MediaCleanup(options);

    expect(s3Storage.deleteInviteMediaObject.mock.calls.map(([value]) => value)).toEqual([
      ORPHAN_IMAGE,
      ORPHAN_MUSIC,
    ]);
    expect(summary.deletedCount).toBe(2);
  });

  it("keeps an unreferenced file younger than 24 hours", async () => {
    const { options, s3Storage } = makeOptions({
      apply: true,
      objects: [makeObject(USED_COVER), makeObject(FRESH_IMAGE, FRESH)],
    });

    await runS3MediaCleanup(options);

    expect(s3Storage.deleteInviteMediaObject).not.toHaveBeenCalled();
  });

  it("continues and counts failures when a delete fails", async () => {
    const deleteInviteMediaObject = jest
      .fn()
      .mockRejectedValueOnce(new Error("s3 down"))
      .mockResolvedValue(undefined);
    const { options } = makeOptions({ apply: true, deleteInviteMediaObject });

    const summary = await runS3MediaCleanup(options);

    expect(deleteInviteMediaObject).toHaveBeenCalledTimes(2);
    expect(summary).toMatchObject({ deletedCount: 1, failedCount: 1 });
    expect(options.logError).toHaveBeenCalledWith(expect.stringContaining("s3 down"));
  });

  it("refuses to run when Mongo has no refs but the bucket has files", async () => {
    const { options, s3Storage } = makeOptions({ apply: true, sites: [] });

    await expect(runS3MediaCleanup(options)).rejects.toThrow("Проверьте подключение к базе");
    expect(s3Storage.deleteInviteMediaObject).not.toHaveBeenCalled();
  });
});

describe("getCleanupMode", () => {
  const argv = ["node", "cleanup-orphan-s3-media.js"];

  it("defaults to dry-run without any confirmation", () => {
    expect(getCleanupMode(argv, undefined)).toEqual({ apply: false });
  });

  it("refuses --apply without --confirm-bucket", () => {
    expect(() => getCleanupMode([...argv, "--apply"], bucket)).toThrow(
      `--confirm-bucket=${bucket}`,
    );
  });

  it("refuses --apply when the confirmed bucket differs", () => {
    expect(() =>
      getCleanupMode([...argv, "--apply", "--confirm-bucket=other-bucket"], bucket),
    ).toThrow("other-bucket");
  });

  it("refuses --apply when S3_BUCKET is not set", () => {
    expect(() =>
      getCleanupMode([...argv, "--apply", `--confirm-bucket=${bucket}`], undefined),
    ).toThrow("S3_BUCKET");
  });

  it("allows --apply with the matching bucket", () => {
    expect(getCleanupMode([...argv, "--apply", `--confirm-bucket=${bucket}`], bucket)).toEqual({
      apply: true,
    });
  });
});
