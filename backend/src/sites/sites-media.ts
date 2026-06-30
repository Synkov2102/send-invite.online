import { BadRequestException, NotFoundException } from "@nestjs/common";
import { isS3ObjectRef, S3StorageService } from "../storage/s3-storage.service";
import { assertAllowedMediaRedirect } from "./media-url";
import type { InviteImageSlot } from "./media-utils";
import { parseDataUrl } from "./media-utils";

const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export type ServedMedia =
  | {
      buffer: Buffer;
      cacheControl: string;
      contentType: string;
      kind: "buffer";
    }
  | {
      kind: "redirect";
      url: string;
    };

export class InviteMusicUploadError extends Error {
  constructor() {
    super("Invite music upload failed.");
  }
}

export class InviteImageUploadError extends Error {
  constructor() {
    super("Invite image upload failed.");
  }
}

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
]);

export function getPublicMusicUrl(siteId: string, musicUrl: string) {
  if (!musicUrl) {
    return "";
  }

  if (musicUrl.startsWith("data:") || isS3ObjectRef(musicUrl)) {
    return `/api/sites/${siteId}/music`;
  }

  return musicUrl;
}

export function getPublicImageUrl(siteId: string, imageUrl: string, slot: InviteImageSlot) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("data:") || isS3ObjectRef(imageUrl)) {
    return `/api/sites/${siteId}/images/${slot}`;
  }

  return imageUrl;
}

export async function resolveStoredMedia(
  url: string,
  s3Storage: S3StorageService,
  notFoundMessage: string,
): Promise<ServedMedia> {
  if (url.startsWith("data:")) {
    const parsed = parseDataUrl(url);

    if (!parsed) {
      throw new BadRequestException("Invalid media data");
    }

    return {
      buffer: parsed.buffer,
      cacheControl: IMMUTABLE_CACHE_CONTROL,
      contentType: parsed.mime,
      kind: "buffer",
    };
  }

  if (isS3ObjectRef(url)) {
    try {
      const object = await s3Storage.getInviteS3Object(url);

      return {
        ...object,
        kind: "buffer",
      };
    } catch {
      throw new NotFoundException(notFoundMessage);
    }
  }

  try {
    assertAllowedMediaRedirect(url);
  } catch {
    throw new NotFoundException(notFoundMessage);
  }

  return { kind: "redirect", url };
}

export function getCreateSiteErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "S3 storage is not configured.") {
    return "Хранилище S3 не настроено. Заполните S3_BUCKET, S3_ACCESS_KEY_ID и S3_SECRET_ACCESS_KEY.";
  }

  if (error instanceof InviteMusicUploadError) {
    return "Не удалось загрузить музыку в S3. Проверьте бакет, ключи доступа и права на запись.";
  }

  if (error instanceof InviteImageUploadError) {
    return "Не удалось загрузить фото в S3. Используйте JPG, PNG, WEBP или GIF и проверьте права бакета.";
  }

  return "Не удалось создать сайт.";
}

export function isS3NotConfiguredError(error: unknown) {
  return error instanceof Error && error.message === "S3 storage is not configured.";
}
