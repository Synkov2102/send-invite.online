/**
 * Переводит уже загруженные в S3 картинки приглашений в webp.
 *
 * По умолчанию — dry-run: показывает, что будет сделано, и ничего не пишет.
 *   node dist/scripts/migrate-invite-images-to-webp.js
 *   node dist/scripts/migrate-invite-images-to-webp.js --apply
 *   node dist/scripts/migrate-invite-images-to-webp.js --apply --delete-originals
 *
 * Env берётся из окружения процесса (в docker-контейнере он уже настроен).
 * Локально: node --env-file=../.env.backend.local dist/scripts/...
 */
import { MongoDbService } from "../database/mongodb.service";
import { S3StorageService } from "../storage/s3-storage.service";
import { runInviteImageMigration, type MigrationSite } from "./webp-migration";

function formatKb(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const deleteOriginals = process.argv.includes("--delete-originals");

  if (deleteOriginals && !apply) {
    throw new Error("--delete-originals требует --apply.");
  }

  const mongoDb = new MongoDbService();
  const s3Storage = new S3StorageService();

  console.log(apply ? "Режим: APPLY (данные будут изменены)" : "Режим: dry-run");

  const db = await mongoDb.getDb();
  const collection = db.collection<MigrationSite>("sites");

  try {
    const summary = await runInviteImageMigration({
      apply,
      deleteOriginals,
      log: (message) => console.log(message),
      logError: (message) => console.error(message),
      s3Storage,
      sites: collection.find({}, { projection: { id: 1, invite: 1 } }),
      updateSite: async (id, updates) => {
        await collection.updateOne({ id }, { $set: updates });
      },
    });

    console.log(
      `\nСайтов просмотрено: ${summary.siteCount}, ` +
        `с картинками на конвертацию: ${summary.touchedSiteCount}`,
    );

    if (!apply) {
      console.log("Ничего не изменено. Повторите с --apply.");
      return;
    }

    console.log(
      `Сконвертировано: ${summary.convertedCount}, ошибок: ${summary.failedCount}, ` +
        `${formatKb(summary.beforeBytes)} -> ${formatKb(summary.afterBytes)}`,
    );

    if (summary.orphanRefs.length > 0) {
      console.log(
        `\nСтарые объекты остались в S3 (${summary.orphanRefs.length}). ` +
          "В Mongo на них больше никто не ссылается, повторный запуск их не найдёт — " +
          "сохраните список, если планируете чистить бакет вручную:",
      );
      for (const ref of summary.orphanRefs) {
        console.log(`  ${ref}`);
      }
    }

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
