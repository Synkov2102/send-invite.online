import sharp from "sharp";
import type { S3StorageService } from "../storage/s3-storage.service";
import {
  migrateInviteImage,
  planInviteImageMigration,
  runInviteImageMigration,
  type MigrationSite,
} from "./webp-migration";

const bucket = "invite-bucket";
const ref = (key: string) => `s3://${bucket}/${key}`;

const makeInvite = (overrides: Record<string, unknown> = {}) => ({
  coverImageUrl: ref("invite-images/cover/2025/aaa.jpg"),
  portraitImageUrl: ref("invite-images/portrait/2025/bbb.png"),
  venueImageUrl: ref("invite-images/venue/2025/ccc.webp"),
  ...overrides,
});

describe("planInviteImageMigration", () => {
  it("picks only non-webp objects under invite-images/", () => {
    const { targets } = planInviteImageMigration(makeInvite());

    expect(targets).toEqual([
      { field: "coverImageUrl", ref: ref("invite-images/cover/2025/aaa.jpg"), slot: "cover" },
      {
        field: "portraitImageUrl",
        ref: ref("invite-images/portrait/2025/bbb.png"),
        slot: "portrait",
      },
    ]);
  });

  it("treats a .WEBP key as already migrated", () => {
    const { skipped, targets } = planInviteImageMigration(
      makeInvite({ coverImageUrl: ref("invite-images/cover/2025/aaa.WEBP") }),
    );

    expect(targets.map((target) => target.field)).not.toContain("coverImageUrl");
    expect(skipped).toContainEqual({ field: "coverImageUrl", reason: "already-webp" });
  });

  it("leaves inline, external, empty and foreign-prefix values alone", () => {
    const { skipped, targets } = planInviteImageMigration({
      coverImageUrl: "data:image/png;base64,AAAA",
      portraitImageUrl: "https://cdn.example.com/photo.jpg",
      venueImageUrl: "",
    });

    expect(targets).toEqual([]);
    expect(skipped).toEqual([
      { field: "coverImageUrl", reason: "inline" },
      { field: "portraitImageUrl", reason: "external" },
      { field: "venueImageUrl", reason: "empty" },
    ]);

    const foreign = planInviteImageMigration({
      coverImageUrl: ref("invite-music/2025/track.mp3"),
      portraitImageUrl: "",
      venueImageUrl: "",
    });

    expect(foreign.targets).toEqual([]);
    expect(foreign.skipped).toContainEqual({ field: "coverImageUrl", reason: "foreign" });
  });

  it("ignores a site whose invite has no image fields at all", () => {
    const { skipped, targets } = planInviteImageMigration({});

    expect(targets).toEqual([]);
    expect(skipped).toHaveLength(3);
  });
});

describe("migrateInviteImage", () => {
  it("downloads, converts and uploads under a new webp ref", async () => {
    const png = await sharp({
      create: { background: "#ff4f72", channels: 3, height: 60, width: 120 },
    })
      .png()
      .toBuffer();

    const uploadInviteImageObject = jest
      .fn()
      .mockResolvedValue(ref("invite-images/cover/2026/new.webp"));
    const s3Storage = {
      getInviteS3Object: jest.fn().mockResolvedValue({ buffer: png, contentType: "image/png" }),
      uploadInviteImageObject,
    } as unknown as S3StorageService;

    const result = await migrateInviteImage(s3Storage, {
      field: "coverImageUrl",
      ref: ref("invite-images/cover/2025/aaa.png"),
      slot: "cover",
    });

    expect(result.ref).toBe(ref("invite-images/cover/2026/new.webp"));
    expect(result.beforeBytes).toBe(png.length);
    expect(result.afterBytes).toBeLessThan(png.length);

    const uploaded = uploadInviteImageObject.mock.calls[0][0];
    expect(uploaded.contentType).toBe("image/webp");
    expect(uploaded.slot).toBe("cover");
    expect((await sharp(uploaded.buffer).metadata()).format).toBe("webp");
  });
});

describe("runInviteImageMigration", () => {
  const asyncIterable = (sites: MigrationSite[]) => ({
    async *[Symbol.asyncIterator]() {
      yield* sites;
    },
  });

  let png: Buffer;

  beforeAll(async () => {
    png = await sharp({
      create: { background: "#ff4f72", channels: 3, height: 200, width: 200 },
    })
      .png()
      .toBuffer();
  });

  const makeS3Mock = (overrides: Record<string, jest.Mock> = {}) =>
    ({
      deleteInviteImageObject: jest.fn().mockResolvedValue(undefined),
      getInviteS3Object: jest.fn().mockImplementation(() => Promise.resolve({ buffer: png })),
      uploadInviteImageObject: jest.fn().mockResolvedValue(ref("invite-images/cover/2026/x.webp")),
      ...overrides,
    }) as unknown as S3StorageService & Record<string, jest.Mock>;

  const baseOptions = (sites: MigrationSite[], s3Storage: S3StorageService) => ({
    log: jest.fn(),
    logError: jest.fn(),
    s3Storage,
    sites: asyncIterable(sites),
    updateSite: jest.fn().mockResolvedValue(undefined),
  });

  const sitesFixture = (): MigrationSite[] => [
    { id: "site-1", invite: makeInvite() },
    { id: "site-2", invite: { coverImageUrl: ref("invite-images/cover/2025/done.webp") } },
  ];

  it("writes nothing in dry-run mode", async () => {
    const s3Storage = makeS3Mock();
    const options = baseOptions(sitesFixture(), s3Storage);

    const summary = await runInviteImageMigration({
      ...options,
      apply: false,
      deleteOriginals: false,
    });

    expect(options.updateSite).not.toHaveBeenCalled();
    expect(s3Storage.uploadInviteImageObject).not.toHaveBeenCalled();
    expect(summary.siteCount).toBe(2);
    expect(summary.touchedSiteCount).toBe(1);
    expect(summary.convertedCount).toBe(0);
  });

  it("updates mongo with dot-notation refs and reports orphans when not deleting", async () => {
    const s3Storage = makeS3Mock();
    const options = baseOptions(sitesFixture(), s3Storage);

    const summary = await runInviteImageMigration({
      ...options,
      apply: true,
      deleteOriginals: false,
    });

    expect(options.updateSite).toHaveBeenCalledTimes(1);
    expect(options.updateSite).toHaveBeenCalledWith("site-1", {
      "invite.coverImageUrl": ref("invite-images/cover/2026/x.webp"),
      "invite.portraitImageUrl": ref("invite-images/cover/2026/x.webp"),
    });
    expect(s3Storage.deleteInviteImageObject).not.toHaveBeenCalled();
    expect(summary.convertedCount).toBe(2);
    expect(summary.orphanRefs).toEqual([
      ref("invite-images/cover/2025/aaa.jpg"),
      ref("invite-images/portrait/2025/bbb.png"),
    ]);
  });

  it("deletes originals only after the mongo update landed", async () => {
    const order: string[] = [];
    const s3Storage = makeS3Mock({
      deleteInviteImageObject: jest.fn().mockImplementation(() => {
        order.push("delete");
        return Promise.resolve();
      }),
    });
    const options = {
      ...baseOptions(sitesFixture(), s3Storage),
      updateSite: jest.fn().mockImplementation(() => {
        order.push("update");
        return Promise.resolve();
      }),
    };

    const summary = await runInviteImageMigration({
      ...options,
      apply: true,
      deleteOriginals: true,
    });

    expect(order).toEqual(["update", "delete", "delete"]);
    expect(summary.orphanRefs).toEqual([]);
  });

  it("keeps the original ref when conversion fails", async () => {
    const s3Storage = makeS3Mock({
      getInviteS3Object: jest
        .fn()
        .mockRejectedValueOnce(new Error("network"))
        .mockImplementation(() => Promise.resolve({ buffer: png })),
    });
    const options = baseOptions(sitesFixture(), s3Storage);

    const summary = await runInviteImageMigration({
      ...options,
      apply: true,
      deleteOriginals: true,
    });

    expect(summary.failedCount).toBe(1);
    expect(summary.convertedCount).toBe(1);
    // Упавший слот не попал ни в апдейт, ни в удаление.
    expect(options.updateSite).toHaveBeenCalledWith("site-1", {
      "invite.portraitImageUrl": ref("invite-images/cover/2026/x.webp"),
    });
    expect(s3Storage.deleteInviteImageObject).toHaveBeenCalledTimes(1);
    expect(s3Storage.deleteInviteImageObject).toHaveBeenCalledWith(
      ref("invite-images/portrait/2025/bbb.png"),
    );
  });
});
