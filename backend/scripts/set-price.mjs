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

import { hasFlag, loadBackendEnv, readArg, requireFromBackend } from "./lib/cli.mjs";

const { MongoClient } = requireFromBackend("mongodb");

loadBackendEnv();

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
