import { INVITE_IMAGE_SLOTS } from "../sites/site-image-slots";
import { isS3ObjectRef, type S3StorageService } from "../storage/s3-storage.service";

export const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;

export type CleanupSite = {
  id: string;
  invite?: Record<string, unknown>;
};

export type CleanupObject = {
  lastModified: Date;
  ref: string;
  size: number;
};

export type CleanupOptions = {
  apply: boolean;
  log: (message: string) => void;
  logError: (message: string) => void;
  now: Date;
  objects: AsyncIterable<CleanupObject>;
  s3Storage: Pick<S3StorageService, "deleteInviteMediaObject">;
  sites: AsyncIterable<CleanupSite>;
};

export const SHARED_BUCKET_WARNING =
  "ВНИМАНИЕ: сирота — файл, на который не ссылается ни один сайт в ЭТОЙ базе Mongo. " +
  "Если бакет общий с другим окружением (dev и прод), его файлы будут удалены и " +
  "сайты того окружения сломаются. Не запускайте --apply на общем бакете.";

// Скрипт не видит другие базы, поэтому общий бакет распознать не может.
// --apply требует явно назвать бакет: случайный запуск с локальным env по
// бакету прода упадёт здесь, а не удалит файлы.
export function getCleanupMode(argv: string[], bucket: string | undefined) {
  const apply = argv.includes("--apply");
  const confirmBucket = argv
    .find((arg) => arg.startsWith("--confirm-bucket="))
    ?.slice("--confirm-bucket=".length);

  if (!apply) {
    return { apply };
  }

  if (!bucket) {
    throw new Error("S3_BUCKET не задан.");
  }

  if (confirmBucket !== bucket) {
    throw new Error(
      `--apply требует --confirm-bucket=${bucket}` +
        (confirmBucket ? ` (передан «${confirmBucket}»)` : "") +
        `.\n${SHARED_BUCKET_WARNING}`,
    );
  }

  return { apply };
}

export async function collectReferencedMediaRefs(sites: AsyncIterable<CleanupSite>) {
  const refs = new Set<string>();
  let siteCount = 0;

  for await (const site of sites) {
    siteCount += 1;

    const invite = site.invite ?? {};
    const values = [...INVITE_IMAGE_SLOTS.map(({ field }) => invite[field]), invite.musicUrl];

    for (const value of values) {
      if (typeof value === "string" && isS3ObjectRef(value)) {
        refs.add(value);
      }
    }
  }

  return { refs, siteCount };
}

export async function runS3MediaCleanup(options: CleanupOptions) {
  // Ссылки собираем до обхода бакета: файл, загруженный после снимка, моложе
  // ORPHAN_MIN_AGE_MS и не тронется. Старый файл без ссылок снова сослаться на
  // себя не может — сохранение сайта принимает только его текущие ref.
  const { refs, siteCount } = await collectReferencedMediaRefs(options.sites);
  const minLastModified = options.now.getTime() - ORPHAN_MIN_AGE_MS;
  const orphans: CleanupObject[] = [];
  let freshCount = 0;
  let objectCount = 0;
  let referencedCount = 0;

  for await (const object of options.objects) {
    objectCount += 1;

    if (refs.has(object.ref)) {
      referencedCount += 1;
    } else if (object.lastModified.getTime() > minLastModified) {
      freshCount += 1;
    } else {
      orphans.push(object);
    }
  }

  // Пустой снимок при непустом бакете — почти наверняка не та база или пустой
  // MONGODB_DB, а не реальная ситуация. Удалять в таком случае весь бакет нельзя.
  if (refs.size === 0 && objectCount > 0) {
    throw new Error(
      `В Mongo нет ни одной S3-ссылки (сайтов: ${siteCount}), а в бакете ${objectCount} файлов. ` +
        "Проверьте подключение к базе.",
    );
  }

  let deletedCount = 0;
  let failedCount = 0;
  let orphanBytes = 0;

  for (const orphan of orphans) {
    orphanBytes += orphan.size;

    if (!options.apply) {
      options.log(`[dry-run] ${orphan.ref} (${orphan.lastModified.toISOString()})`);
      continue;
    }

    try {
      await options.s3Storage.deleteInviteMediaObject(orphan.ref);
      deletedCount += 1;
      options.log(`удалён ${orphan.ref}`);
    } catch (error) {
      failedCount += 1;
      options.logError(
        `${orphan.ref}: ОШИБКА — ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    deletedCount,
    failedCount,
    freshCount,
    objectCount,
    orphanBytes,
    orphanCount: orphans.length,
    referencedCount,
    siteCount,
  };
}
