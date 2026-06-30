import { BadRequestException } from "@nestjs/common";
import { isS3ObjectRef, parseS3ObjectRef } from "../storage/s3-storage.service";

const INVITE_IMAGE_KEY_PREFIX = "invite-images/";
const INVITE_MUSIC_KEY_PREFIX = "invite-music/";

function getConfiguredBucket() {
  return process.env.S3_BUCKET ?? null;
}

function isPrivateIp(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return true;
  }

  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);

  if (!match) {
    return false;
  }

  const [, a, b] = match.map(Number);

  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0 ||
    a === 169 ||
    a === 100
  );
}

export function isAllowedExternalMediaUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return false;
    }

    if (parsed.username || parsed.password) {
      return false;
    }

    return !isPrivateIp(parsed.hostname);
  } catch {
    return false;
  }
}

export function isAllowedStoredS3Ref(url: string) {
  const bucket = getConfiguredBucket();
  const parsed = parseS3ObjectRef(url);

  if (!bucket || !parsed || parsed.bucket !== bucket) {
    return false;
  }

  return (
    parsed.key.startsWith(INVITE_IMAGE_KEY_PREFIX) ||
    parsed.key.startsWith(INVITE_MUSIC_KEY_PREFIX)
  );
}

export function assertAllowedStoredMediaUrl(url: string, fieldLabel: string) {
  if (!url) {
    return;
  }

  if (url.startsWith("data:")) {
    return;
  }

  if (isS3ObjectRef(url)) {
    if (!isAllowedStoredS3Ref(url)) {
      throw new BadRequestException({
        error: `Недопустимая ссылка для ${fieldLabel}.`,
      });
    }

    return;
  }

  if (!isAllowedExternalMediaUrl(url)) {
    throw new BadRequestException({
      error: `Недопустимая ссылка для ${fieldLabel}. Разрешены только HTTPS-URL.`,
    });
  }
}

export function assertAllowedMediaRedirect(url: string) {
  if (!isAllowedExternalMediaUrl(url)) {
    throw new BadRequestException("Invalid media URL");
  }
}

export const MAX_MEDIA_FILE_BYTES = 10 * 1024 * 1024;

export function assertMediaFileSize(buffer: Buffer, fieldLabel: string) {
  if (buffer.length > MAX_MEDIA_FILE_BYTES) {
    throw new BadRequestException({
      error: `Файл для ${fieldLabel} слишком большой (максимум 10 МБ).`,
    });
  }
}
