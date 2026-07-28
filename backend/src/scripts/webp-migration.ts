import {
  INVITE_IMAGE_SLOTS,
  type InviteImageField,
} from "../sites/site-image-slots";
import type { InviteImageSlot } from "../sites/media-utils";
import { convertImageToWebp, WEBP_MIME_TYPE } from "../sites/sites-media";
import {
  inviteImageKeyPrefix,
  isS3ObjectRef,
  parseS3ObjectRef,
  type S3StorageService,
} from "../storage/s3-storage.service";

export type MigrationTarget = {
  field: InviteImageField;
  ref: string;
  slot: InviteImageSlot;
};

export type MigrationSkip = {
  field: InviteImageField;
  // `inline` — картинка так и осталась data-URL в Mongo и в S3 не попадала,
  // `foreign` — ref ведёт мимо invite-images/, трогать его миграция не должна.
  reason: "already-webp" | "empty" | "external" | "foreign" | "inline";
};

export function planInviteImageMigration(invite: Record<string, unknown>) {
  const skipped: MigrationSkip[] = [];
  const targets: MigrationTarget[] = [];

  for (const { field, slot } of INVITE_IMAGE_SLOTS) {
    const value = invite[field];

    if (typeof value !== "string" || !value) {
      skipped.push({ field, reason: "empty" });
      continue;
    }

    if (value.startsWith("data:")) {
      skipped.push({ field, reason: "inline" });
      continue;
    }

    if (!isS3ObjectRef(value)) {
      skipped.push({ field, reason: "external" });
      continue;
    }

    const parsed = parseS3ObjectRef(value);

    if (!parsed || !parsed.key.startsWith(inviteImageKeyPrefix)) {
      skipped.push({ field, reason: "foreign" });
      continue;
    }

    if (parsed.key.toLowerCase().endsWith(".webp")) {
      skipped.push({ field, reason: "already-webp" });
      continue;
    }

    targets.push({ field, ref: value, slot });
  }

  return { skipped, targets };
}

export async function migrateInviteImage(
  s3Storage: S3StorageService,
  target: MigrationTarget,
) {
  const original = await s3Storage.getInviteS3Object(target.ref);
  const webp = await convertImageToWebp(original.buffer);
  const ref = await s3Storage.uploadInviteImageObject({
    buffer: webp,
    contentType: WEBP_MIME_TYPE,
    slot: target.slot,
  });

  return { afterBytes: webp.length, beforeBytes: original.buffer.length, ref };
}

export type MigrationSite = {
  id: string;
  invite?: Record<string, unknown>;
};

export type MigrationOptions = {
  apply: boolean;
  deleteOriginals: boolean;
  log: (message: string) => void;
  logError: (message: string) => void;
  s3Storage: S3StorageService;
  sites: AsyncIterable<MigrationSite>;
  updateSite: (id: string, updates: Record<string, string>) => Promise<void>;
};

function formatKb(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

export async function runInviteImageMigration(options: MigrationOptions) {
  const orphanRefs: string[] = [];
  let afterBytes = 0;
  let beforeBytes = 0;
  let convertedCount = 0;
  let failedCount = 0;
  let siteCount = 0;
  let touchedSiteCount = 0;

  for await (const site of options.sites) {
    siteCount += 1;

    const { targets } = planInviteImageMigration(site.invite ?? {});

    if (targets.length === 0) {
      continue;
    }

    touchedSiteCount += 1;

    const updates: Record<string, string> = {};
    const replacedRefs: string[] = [];

    for (const target of targets) {
      if (!options.apply) {
        options.log(`[dry-run] ${site.id} ${target.field}: ${target.ref}`);
        continue;
      }

      try {
        const result = await migrateInviteImage(options.s3Storage, target);

        updates[`invite.${target.field}`] = result.ref;
        replacedRefs.push(target.ref);
        afterBytes += result.afterBytes;
        beforeBytes += result.beforeBytes;
        convertedCount += 1;

        options.log(
          `${site.id} ${target.field}: ${formatKb(result.beforeBytes)} -> ${formatKb(
            result.afterBytes,
          )}`,
        );
      } catch (error) {
        failedCount += 1;
        options.logError(
          `${site.id} ${target.field}: ОШИБКА — ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      continue;
    }

    // Порядок важен: сначала ref в Mongo, только потом удаление исходника.
    // Если апдейт упадёт, сайт останется на рабочей старой картинке.
    await options.updateSite(site.id, updates);

    if (!options.deleteOriginals) {
      orphanRefs.push(...replacedRefs);
      continue;
    }

    for (const ref of replacedRefs) {
      try {
        await options.s3Storage.deleteInviteImageObject(ref);
      } catch (error) {
        orphanRefs.push(ref);
        options.logError(
          `${site.id}: не удалось удалить ${ref} — ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  return {
    afterBytes,
    beforeBytes,
    convertedCount,
    failedCount,
    orphanRefs,
    siteCount,
    touchedSiteCount,
  };
}
