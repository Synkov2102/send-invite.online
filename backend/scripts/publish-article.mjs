/**
 * Publish a SEO article into MongoDB.
 *
 * MongoDB is the only store: the markdown file is just an authoring convenience and can live
 * anywhere on disk — nothing is kept in the repository. Images referenced from the markdown are
 * uploaded to S3 and replaced by `s3://` references, exactly like invite media. The markdown
 * itself is saved alongside the parsed blocks, so an article can be pulled back out with --dump,
 * edited and re-published without the original file.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node backend/scripts/publish-article.mjs --file=~/articles/my-article.md
 *   node backend/scripts/publish-article.mjs --file=~/articles/my-article.md --dry-run
 *   node backend/scripts/publish-article.mjs --list
 *   node backend/scripts/publish-article.mjs --dump=my-article > my-article.md
 *   node backend/scripts/publish-article.mjs --unpublish=my-article
 *
 * Options:
 *   --file=PATH        markdown to publish; images resolve relative to it
 *   --dry-run          parse and validate only — no S3 upload, no MongoDB write
 *   --list             slug, status and updatedAt of every stored article
 *   --dump=SLUG        print the markdown an article was published from
 *   --unpublish=SLUG   flip a stored article to draft (hides it from the site)
 *
 * Requires a built shared package: npm run build --workspace @invite/shared
 */

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { hasFlag, loadBackendEnv, readArg, requireFromBackend } from "./lib/cli.mjs";
import { createS3Client, getS3Config, putObject } from "./lib/s3.mjs";

const { MongoClient } = requireFromBackend("mongodb");
const { parseArticleDocument } = requireFromBackend("@invite/shared");

loadBackendEnv();

const imageContentTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const IMAGE_IN_BODY = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const COVER_IN_FRONTMATTER = /^(cover:\s*)(\S+)\s*$/m;

function randomImageId(extension) {
  return `${randomUUID()}${extension}`;
}

/** Every image the markdown points at: the frontmatter cover plus each inline picture. */
function collectImageRefs(source) {
  const cover = COVER_IN_FRONTMATTER.exec(source);
  const body = [...source.matchAll(IMAGE_IN_BODY)].map((match) => match[1]);

  return [...new Set([...(cover ? [cover[2]] : []), ...body])];
}

/**
 * Reads and checks every local image before anything is uploaded — a broken reference must not
 * leave half the pictures orphaned in the bucket. Values that are already references are skipped,
 * so re-publishing a --dump uploads nothing.
 */
function readLocalImages(source, markdownDir) {
  const pending = [];
  const errors = [];

  for (const value of collectImageRefs(source)) {
    if (value.startsWith("s3://") || value.startsWith("/api/blog-images/")) {
      continue;
    }

    if (/^https?:\/\//.test(value)) {
      errors.push(`${value}: внешние ссылки на картинки не поддерживаются, положите файл рядом`);
      continue;
    }

    const filePath = path.resolve(markdownDir, value);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = imageContentTypes[extension];

    if (!contentType) {
      errors.push(`${value}: неподдерживаемый формат (нужен webp, jpg, png или gif)`);
      continue;
    }

    try {
      pending.push({ buffer: readFileSync(filePath), contentType, extension, value });
    } catch {
      errors.push(`${value}: файл не найден (${filePath})`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Картинки:\n  ${errors.join("\n  ")}`);
  }

  return pending;
}

/** Uploads the checked images and rewrites the markdown to the `s3://` references. */
async function uploadImages(source, markdownDir, uploader) {
  let result = source;

  for (const image of readLocalImages(source, markdownDir)) {
    const ref = await uploader({
      buffer: image.buffer,
      contentType: image.contentType,
      imageId: randomImageId(image.extension),
    });

    console.error(`uploaded ${image.value} → ${ref}`);
    result = result.split(`(${image.value}`).join(`(${ref}`);
    result = result.replace(
      new RegExp(`^(cover:\\s*)${image.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"),
      `$1${ref}`,
    );
  }

  return result;
}

async function withCollection(handler) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.backend.local");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB ?? "invite");
    return await handler(db.collection("articles"));
  } finally {
    await client.close();
  }
}

async function publish(filePath, dryRun) {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  const original = readFileSync(absolute, "utf8");

  let uploader;

  if (dryRun) {
    // Keeps validation honest without touching S3: the shape is what the schema checks.
    uploader = ({ imageId }) => `s3://dry-run/blog-images/${imageId}`;
  } else {
    const config = getS3Config();
    const client = createS3Client(config);
    uploader = ({ buffer, contentType, imageId }) =>
      putObject(client, config, {
        body: buffer,
        contentType,
        key: `blog-images/${imageId}`,
      });
  }

  const source = await uploadImages(original, path.dirname(absolute), uploader);
  const parsed = parseArticleDocument(source);

  if (!parsed.ok) {
    throw new Error(`${path.basename(absolute)}: ${parsed.error}`);
  }

  const article = parsed.article;

  if (dryRun) {
    console.log(
      `ok ${article.slug} · ${article.status} · разделов: ${article.sections.length} · ` +
        `FAQ: ${article.faq.length} · ~${article.readingMinutes} мин — база и S3 не тронуты`,
    );
    return;
  }

  await withCollection(async (collection) => {
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.updateOne(
      { slug: article.slug },
      { $set: { ...article, source }, $setOnInsert: { _id: article.slug } },
      { upsert: true },
    );
  });

  console.log(`published /blog/${article.slug} (${article.status})`);
}

async function main() {
  if (hasFlag("list")) {
    const documents = await withCollection((collection) =>
      collection
        .find({}, { projection: { _id: 0, publishedAt: 1, slug: 1, status: 1, updatedAt: 1 } })
        .sort({ publishedAt: -1 })
        .toArray(),
    );

    if (documents.length === 0) {
      console.log("В базе пока нет статей.");
      return;
    }

    for (const document of documents) {
      console.log(
        `${document.status.padEnd(9)} ${document.slug.padEnd(40)} updated ${document.updatedAt}`,
      );
    }
    return;
  }

  const dumpSlug = readArg("dump");

  if (dumpSlug) {
    const document = await withCollection((collection) =>
      collection.findOne({ slug: dumpSlug }, { projection: { _id: 0, source: 1 } }),
    );

    if (!document) {
      throw new Error(`Статья "${dumpSlug}" не найдена.`);
    }

    if (!document.source) {
      throw new Error(
        `У статьи "${dumpSlug}" не сохранён исходник — она была записана в базу напрямую.`,
      );
    }

    process.stdout.write(document.source);
    return;
  }

  const unpublishSlug = readArg("unpublish");

  if (unpublishSlug) {
    const result = await withCollection((collection) =>
      collection.updateOne(
        { slug: unpublishSlug },
        { $set: { status: "draft", updatedAt: new Date().toISOString() } },
      ),
    );

    console.log(
      result.matchedCount > 0
        ? `Статья "${unpublishSlug}" переведена в черновики и скрыта с сайта.`
        : `Статья "${unpublishSlug}" не найдена.`,
    );
    return;
  }

  const filePath = readArg("file");

  if (!filePath) {
    throw new Error("Нужен один из: --file=PATH, --list, --dump=SLUG, --unpublish=SLUG");
  }

  await publish(filePath, hasFlag("dry-run"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
