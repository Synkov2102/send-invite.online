/**
 * Create a promo code in MongoDB.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node backend/scripts/create-promo-code.mjs --code=WEDDING10 --type=percent --value=10
 *   node backend/scripts/create-promo-code.mjs --code=MINUS500 --type=fixed --value=500 --max-uses=100
 *   node backend/scripts/create-promo-code.mjs --code=FREE100 --type=percent --value=100 --max-uses=1
 *
 * Options:
 *   --code=CODE              required, A-Z0-9_- (2..32)
 *   --type=percent|fixed     required
 *   --value=NUMBER           required (percent 1..100, fixed rubles)
 *   --max-uses=N             optional global limit (omit = unlimited)
 *   --max-uses-per-user=N    optional, default 1
 *   --expires-at=ISO         optional
 *   --starts-at=ISO          optional
 *   --note="internal note"   optional
 */

import { randomUUID } from "node:crypto";
import { loadBackendEnv, readArg, requireFromBackend } from "./lib/cli.mjs";

const { MongoClient } = requireFromBackend("mongodb");

loadBackendEnv();

function parseOptionalInt(raw) {
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid integer: ${raw}`);
  }
  return value;
}

async function main() {
  const codeRaw = readArg("code");
  const type = readArg("type");
  const valueRaw = readArg("value");

  if (!codeRaw || !type || valueRaw === undefined) {
    throw new Error("Required: --code --type --value");
  }

  const code = codeRaw.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) {
    throw new Error("Invalid code format. Use A-Z, 0-9, _ or - (2..32 chars).");
  }

  if (type !== "percent" && type !== "fixed") {
    throw new Error("--type must be percent or fixed");
  }

  const value = Number(valueRaw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("--value must be a positive number");
  }
  if (type === "percent" && value > 100) {
    throw new Error("percent value cannot exceed 100");
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.backend.local");
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const document = {
    _id: id,
    id,
    code,
    type,
    value,
    maxUses: parseOptionalInt(readArg("max-uses")),
    maxUsesPerUser: parseOptionalInt(readArg("max-uses-per-user")) ?? 1,
    usedCount: 0,
    startsAt: readArg("starts-at") ?? null,
    expiresAt: readArg("expires-at") ?? null,
    isActive: true,
    note: readArg("note") ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "invite");
  const collection = db.collection("promo_codes");
  await collection.createIndex({ code: 1 }, { unique: true });
  await collection.createIndex({ id: 1 }, { unique: true });

  try {
    await collection.insertOne(document);
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error(`Promo code already exists: ${code}`);
    }
    throw error;
  } finally {
    await client.close();
  }

  console.log(JSON.stringify(document, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
