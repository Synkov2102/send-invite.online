import { ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { PublishedInviteSite } from "@invite/shared";
import { S3StorageService } from "../storage/s3-storage.service";
import { InviteResponseStore } from "./invite-response.store";
import { InviteSiteStore } from "./invite-site.store";
import { InviteTemplateStore } from "./invite-template.store";
import { getPublicImageUrl, getPublicMusicUrl } from "./sites-media";
import { SitesService } from "./sites.service";

// Полная Zod-валидация invite тут не цель — проверяем обработку медиа.
jest.mock("@invite/shared", () => ({
  ...jest.requireActual("@invite/shared"),
  parseCreateInviteSitePayload: (body: unknown) => ({ ok: true, payload: body }),
}));

const BUCKET = "invite-bucket";
const ref = (key: string) => `s3://${BUCKET}/${key}`;
const OLD_COVER = ref("invite-images/cover/2026/old-cover.webp");
const PORTRAIT = ref("invite-images/portrait/2026/portrait.webp");
const OLD_MUSIC = ref("invite-music/2026/old.mp3");
const NEW_COVER = ref("invite-images/cover/2026/new-cover.webp");

function makeSite(invite: Partial<PublishedInviteSite["invite"]> = {}) {
  return {
    createdAt: "2026-10-01T00:00:00.000Z",
    id: "site-1",
    invite: {
      coverImageUrl: OLD_COVER,
      musicEnabled: true,
      musicUrl: OLD_MUSIC,
      portraitImageUrl: PORTRAIT,
      venueImageUrl: "",
      ...invite,
    },
    ownerId: "owner-1",
    palette: {},
    templateId: "template-1",
    updatedAt: "2026-10-01T00:00:00.000Z",
  } as unknown as PublishedInviteSite & { ownerId: string };
}

const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// Так редактор отправляет сайт обратно: неизменённые файлы — публичными URL.
function makeBody(invite: Record<string, unknown>) {
  const site = makeSite();

  return {
    invite: {
      ...site.invite,
      coverImageUrl: getPublicImageUrl(site.id, OLD_COVER, "cover"),
      musicUrl: getPublicMusicUrl(site.id, OLD_MUSIC),
      portraitImageUrl: getPublicImageUrl(site.id, PORTRAIT, "portrait"),
      ...invite,
    },
    palette: site.palette,
    templateId: site.templateId,
  };
}

describe("SitesService.updateSite media cleanup", () => {
  const originalBucket = process.env.S3_BUCKET;
  let service: SitesService;
  let inviteSites: { getInviteSite: jest.Mock; updateInviteSite: jest.Mock };
  let s3Storage: {
    deleteInviteMediaObject: jest.Mock;
    uploadInviteImageObject: jest.Mock;
    uploadInviteMusicObject: jest.Mock;
  };

  beforeEach(async () => {
    process.env.S3_BUCKET = BUCKET;

    inviteSites = {
      getInviteSite: jest.fn().mockResolvedValue(makeSite()),
      updateInviteSite: jest.fn().mockImplementation((id, _ownerId, payload) => ({
        ...makeSite(),
        ...payload,
        id,
      })),
    };
    s3Storage = {
      deleteInviteMediaObject: jest.fn().mockResolvedValue(undefined),
      uploadInviteImageObject: jest.fn().mockResolvedValue(NEW_COVER),
      uploadInviteMusicObject: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SitesService,
        { provide: InviteResponseStore, useValue: {} },
        { provide: InviteSiteStore, useValue: inviteSites },
        {
          provide: InviteTemplateStore,
          useValue: { findInviteTemplate: jest.fn().mockResolvedValue({ id: "template-1" }) },
        },
        { provide: S3StorageService, useValue: s3Storage },
      ],
    }).compile();

    service = moduleRef.get(SitesService);
  });

  afterEach(() => {
    if (originalBucket === undefined) {
      delete process.env.S3_BUCKET;
    } else {
      process.env.S3_BUCKET = originalBucket;
    }
  });

  it("deletes nothing when media is unchanged", async () => {
    await service.updateSite("owner-1", "site-1", makeBody({}));

    const [, , saved, expectedUpdatedAt] = inviteSites.updateInviteSite.mock.calls[0];
    expect(expectedUpdatedAt).toBe(makeSite().updatedAt);
    expect(saved.invite.coverImageUrl).toBe(OLD_COVER);
    expect(saved.invite.musicUrl).toBe(OLD_MUSIC);
    expect(s3Storage.deleteInviteMediaObject).not.toHaveBeenCalled();
  });

  it("deletes the old photo after a new one is saved", async () => {
    await service.updateSite("owner-1", "site-1", makeBody({ coverImageUrl: PNG_DATA_URL }));

    expect(inviteSites.updateInviteSite.mock.calls[0][2].invite.coverImageUrl).toBe(NEW_COVER);
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledTimes(1);
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledWith(OLD_COVER);
    expect(inviteSites.updateInviteSite.mock.invocationCallOrder[0]).toBeLessThan(
      s3Storage.deleteInviteMediaObject.mock.invocationCallOrder[0],
    );
  });

  it("deletes removed photo and replaced music", async () => {
    await service.updateSite(
      "owner-1",
      "site-1",
      makeBody({ musicUrl: "/api/catalog-music/track-1", portraitImageUrl: "" }),
    );

    expect(s3Storage.deleteInviteMediaObject.mock.calls.map(([value]) => value).sort()).toEqual(
      [OLD_MUSIC, PORTRAIT].sort(),
    );
  });

  it("keeps old media when saving the site fails", async () => {
    inviteSites.updateInviteSite.mockRejectedValue(new Error("mongo down"));

    await expect(
      service.updateSite("owner-1", "site-1", makeBody({ portraitImageUrl: "" })),
    ).rejects.toThrow("mongo down");
    expect(s3Storage.deleteInviteMediaObject).not.toHaveBeenCalled();
  });

  it("still succeeds when S3 delete fails", async () => {
    s3Storage.deleteInviteMediaObject.mockRejectedValue(new Error("s3 down"));
    jest.spyOn(service["logger"], "warn").mockImplementation(() => undefined);

    await expect(
      service.updateSite("owner-1", "site-1", makeBody({ portraitImageUrl: "" })),
    ).resolves.toEqual({ id: "site-1", url: "/invite/sites/site-1" });
  });

  it("returns 409 on a concurrent save and deletes only the fresh upload", async () => {
    inviteSites.updateInviteSite.mockResolvedValue(null);

    await expect(
      service.updateSite("owner-1", "site-1", makeBody({ coverImageUrl: PNG_DATA_URL })),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledTimes(1);
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledWith(NEW_COVER);
  });

  it("deletes the fresh upload when the write throws", async () => {
    inviteSites.updateInviteSite.mockRejectedValue(new Error("mongo down"));

    await expect(
      service.updateSite("owner-1", "site-1", makeBody({ coverImageUrl: PNG_DATA_URL })),
    ).rejects.toThrow("mongo down");
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledTimes(1);
    expect(s3Storage.deleteInviteMediaObject).toHaveBeenCalledWith(NEW_COVER);
  });
});
