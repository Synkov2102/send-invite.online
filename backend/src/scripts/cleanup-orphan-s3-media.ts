/**
 * Удаляет из S3 загрузки сайтов (invite-images/, invite-music/), на которые
 * не ссылается ни один сайт и которые старше 24 часов.
 *
 * По умолчанию — dry-run: показывает, что будет удалено, и ничего не трогает.
 *   node dist/scripts/cleanup-orphan-s3-media.js
 *   node dist/scripts/cleanup-orphan-s3-media.js --apply --confirm-bucket=<S3_BUCKET>
 *
 * Сирота определяется по ОДНОЙ базе Mongo. Бакет, общий для нескольких окружений,
 * чистить этим скриптом нельзя — удалятся файлы сайтов другого окружения.
 *
 * Env берётся из окружения процесса (в docker-контейнере он уже настроен).
 * Локально: node --env-file=../.env.backend.local dist/scripts/...
 */
import { MongoDbService } from "../database/mongodb.service";
import {
  inviteImageKeyPrefix,
  inviteMusicKeyPrefix,
  S3StorageService,
} from "../storage/s3-storage.service";
import {
  getCleanupMode,
  runS3MediaCleanup,
  SHARED_BUCKET_WARNING,
  type CleanupSite,
} from "./s3-media-cleanup";

function formatKb(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function main() {
  const { apply } = getCleanupMode(process.argv, process.env.S3_BUCKET);
  const mongoDb = new MongoDbService();
  const s3Storage = new S3StorageService();

  console.log(apply ? "Режим: APPLY (файлы будут удалены)" : "Режим: dry-run");
  console.log(`Бакет: ${process.env.S3_BUCKET ?? "-"}, база: ${process.env.MONGODB_DB ?? "-"}`);
  console.warn(`${SHARED_BUCKET_WARNING}\n`);

  const db = await mongoDb.getDb();
  const collection = db.collection<CleanupSite>("sites");

  async function* listInviteMedia() {
    yield* s3Storage.listInviteMediaObjects(inviteImageKeyPrefix);
    yield* s3Storage.listInviteMediaObjects(inviteMusicKeyPrefix);
  }

  try {
    const summary = await runS3MediaCleanup({
      apply,
      log: (message) => console.log(message),
      logError: (message) => console.error(message),
      now: new Date(),
      objects: listInviteMedia(),
      s3Storage,
      sites: collection.find({}, { projection: { id: 1, invite: 1 } }),
    });

    console.log(
      `\nСайтов: ${summary.siteCount}, файлов в S3: ${summary.objectCount}, ` +
        `используются: ${summary.referencedCount}, моложе 24 ч: ${summary.freshCount}, ` +
        `сирот: ${summary.orphanCount} (${formatKb(summary.orphanBytes)})`,
    );

    if (!apply) {
      console.log("Ничего не удалено. Повторите с --apply.");
      return;
    }

    console.log(`Удалено: ${summary.deletedCount}, ошибок: ${summary.failedCount}`);

    if (summary.failedCount > 0) {
      process.exitCode = 1;
    }
  } finally {
    await mongoDb.onModuleDestroy();
    s3Storage.onModuleDestroy();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
