/**
 * Publish SEO articles from content/articles/*.md into MongoDB.
 *
 * The markdown files in git are the source of truth; MongoDB holds the parsed,
 * schema-validated snapshot that /api/articles serves. Run after editing an article —
 * the frontend picks it up on the next ISR revalidation, no redeploy needed.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node backend/scripts/publish-article.mjs --all
 *   node backend/scripts/publish-article.mjs --file=content/articles/my-article.md
 *   node backend/scripts/publish-article.mjs --all --dry-run
 *   node backend/scripts/publish-article.mjs --list
 *   node backend/scripts/publish-article.mjs --unpublish=my-article
 *
 * Options:
 *   --all              publish every file in content/articles/
 *   --file=PATH        publish a single file (repo-relative or absolute)
 *   --dry-run          parse and validate only, never touch MongoDB
 *   --list             print slug, status and updatedAt of everything stored
 *   --unpublish=SLUG   flip a stored article back to draft (hides it from the site)
 *
 * Requires a built shared package: npm run build --workspace @invite/shared
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  hasFlag,
  loadBackendEnv,
  readArg,
  repoRoot,
  requireFromBackend,
} from "./lib/cli.mjs";

const { MongoClient } = requireFromBackend("mongodb");
const { parseArticleDocument } = requireFromBackend("@invite/shared");

const articlesDir = path.join(repoRoot, "content/articles");

loadBackendEnv();

function collectFiles() {
  const file = readArg("file");

  if (file) {
    return [path.isAbsolute(file) ? file : path.join(repoRoot, file)];
  }

  if (!hasFlag("all")) {
    throw new Error("Required: --all, --file=PATH, --list or --unpublish=SLUG");
  }

  return readdirSync(articlesDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(articlesDir, name));
}

/** Parse every file first — a broken article must not leave a half-published set behind. */
function parseAll(files) {
  const articles = [];
  const errors = [];

  for (const file of files) {
    const relative = path.relative(repoRoot, file).replace(/\\/g, "/");
    const result = parseArticleDocument(readFileSync(file, "utf8"));

    if (!result.ok) {
      errors.push(`${relative}: ${result.error}`);
      continue;
    }

    const expectedSlug = path.basename(file, ".md");

    if (result.article.slug !== expectedSlug) {
      errors.push(
        `${relative}: slug "${result.article.slug}" must match the file name "${expectedSlug}"`,
      );
      continue;
    }

    articles.push({ article: result.article, relative });
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n  ${errors.join("\n  ")}`);
  }

  return articles;
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
    await handler(db.collection("articles"));
  } finally {
    await client.close();
  }
}

async function main() {
  if (hasFlag("list")) {
    await withCollection(async (collection) => {
      const documents = await collection
        .find({}, { projection: { _id: 0, publishedAt: 1, slug: 1, status: 1, updatedAt: 1 } })
        .sort({ publishedAt: -1 })
        .toArray();

      if (documents.length === 0) {
        console.log("No articles stored yet.");
        return;
      }

      for (const document of documents) {
        console.log(
          `${document.status.padEnd(9)} ${document.slug.padEnd(40)} updated ${document.updatedAt}`,
        );
      }
    });
    return;
  }

  const unpublish = readArg("unpublish");

  if (unpublish) {
    await withCollection(async (collection) => {
      const result = await collection.updateOne(
        { slug: unpublish },
        { $set: { status: "draft", updatedAt: new Date().toISOString() } },
      );

      console.log(
        result.matchedCount > 0
          ? `Article "${unpublish}" is now a draft and hidden from the site.`
          : `Article "${unpublish}" not found.`,
      );
    });
    return;
  }

  const parsed = parseAll(collectFiles());

  if (hasFlag("dry-run")) {
    for (const { article, relative } of parsed) {
      console.log(
        `ok ${relative} → ${article.slug} (${article.status}, ${article.sections.length} sections, ` +
          `${article.faq.length} FAQ, ~${article.readingMinutes} min)`,
      );
    }
    return;
  }

  await withCollection(async (collection) => {
    await collection.createIndex({ slug: 1 }, { unique: true });

    for (const { article, relative } of parsed) {
      await collection.updateOne(
        { slug: article.slug },
        { $set: article, $setOnInsert: { _id: article.slug } },
        { upsert: true },
      );

      console.log(`published ${relative} → /blog/${article.slug} (${article.status})`);
    }
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
