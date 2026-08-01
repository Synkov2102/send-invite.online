/**
 * Set (or clear) the site-wide invite price in MongoDB.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node backend/scripts/set-price.mjs --current=2990 --original=4000
 *   node backend/scripts/set-price.mjs --current=4000
 *   node backend/scripts/set-price.mjs --reset
 *
 * Options:
 *   --current=NUMBER   required unless --reset. New effective price (rubles), charged at checkout.
 *   --original=NUMBER   optional. When set (and higher than --current), shown struck-through
 *                        on the homepage as the "old" price. Omit to clear the sale display.
 *   --reset             removes the override entirely — falls back to the built-in price.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const require = createRequire(
  pathToFileURL(path.join(repoRoot, "backend/package.json")),
);
const { MongoClient } = require("mongodb");

function loadEnvFile(filePath) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional
  }
}

loadEnvFile(path.join(repoRoot, ".env.backend.local"));
loadEnvFile(path.join(repoRoot, ".env.backend.production"));

function readArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}

function parsePositiveRub(raw, label) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`--${label} must be a positive number`);
  }
  return value;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.backend.local");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "invite");
  const collection = db.collection("site_pricing");

  try {
    if (hasFlag("reset")) {
      await collection.deleteOne({ _id: "current" });
      console.log("Price override removed. Falling back to the built-in price.");
      return;
    }

    const currentRaw = readArg("current");
    const originalRaw = readArg("original");

    if (currentRaw === undefined) {
      throw new Error("Required: --current (or use --reset)");
    }

    const currentPriceRub = parsePositiveRub(currentRaw, "current");
    const originalPriceRub =
      originalRaw === undefined ? null : parsePositiveRub(originalRaw, "original");

    if (originalPriceRub !== null && originalPriceRub <= currentPriceRub) {
      throw new Error("--original must be greater than --current, otherwise omit it");
    }

    const now = new Date().toISOString();
    const document = { currentPriceRub, originalPriceRub, updatedAt: now };

    await collection.updateOne(
      { _id: "current" },
      { $set: document, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );

    console.log(JSON.stringify({ _id: "current", ...document }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
