/**
 * Create a promo code in MongoDB.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node backend/scripts/create-promo-code.mjs --code=WEDDING10 --type=percent --value=10
 *   node backend/scripts/create-promo-code.mjs --code=MINUS500 --type=fixed --value=500 --max-uses=100
 *   node backend/scripts/create-promo-code.mjs --code=FREE100 --type=percent --value=100 --max-uses=1
 *   node backend/scripts/create-promo-code.mjs --code=BLOGGER10 --type=percent --value=10 --partner=ivan.petrov
 *
 * Partner binding for an existing code (partner sees stats in /dashboard/partner):
 *   node backend/scripts/create-promo-code.mjs --attach=WEDDING10 --partner=ivan@yandex.ru
 *   node backend/scripts/create-promo-code.mjs --detach=WEDDING10
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
 *   --partner=LOGIN|EMAIL    optional, Yandex login or email of a user who already signed in
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

function normalizeCode(raw) {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(code)) {
    throw new Error("Invalid code format. Use A-Z, 0-9, _ or - (2..32 chars).");
  }
  return code;
}

async function findPartnerUserId(db, raw) {
  const value = raw.trim();
  const users = await db
    .collection("users")
    .find({ $or: [{ login: value }, { email: value.toLowerCase() }, { email: value }] })
    .project({ _id: 0, email: 1, id: 1, login: 1 })
    .toArray();

  if (users.length === 0) {
    throw new Error(`User not found: ${value}. Ask the partner to sign in on the site first.`);
  }
  if (users.length > 1) {
    throw new Error(`Several users match ${value}:
${JSON.stringify(users, null, 2)}`);
  }
  return users[0].id;
}

async function withDb(callback) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env.backend.local");
  }

  const client = new MongoClient(uri);
  await client.connect();
  try {
    return await callback(client.db(process.env.MONGODB_DB ?? "invite"));
  } finally {
    await client.close();
  }
}

async function setPartner(codeRaw, partnerRaw) {
  const code = normalizeCode(codeRaw);

  await withDb(async (db) => {
    const updatedAt = new Date().toISOString();
    // Поле удаляем, а не пишем null: индекс partnerUserId — sparse.
    const update = partnerRaw
      ? { $set: { partnerUserId: await findPartnerUserId(db, partnerRaw), updatedAt } }
      : { $set: { updatedAt }, $unset: { partnerUserId: "" } };
    const updated = await db
      .collection("promo_codes")
      .findOneAndUpdate({ code }, update, { returnDocument: "after" });

    if (!updated) {
      throw new Error(`Promo code not found: ${code}`);
    }
    console.log(JSON.stringify(updated, null, 2));
  });
}

async function main() {
  const attach = readArg("attach");
  const detach = readArg("detach");

  if (attach) {
    const partner = readArg("partner");
    if (!partner) {
      throw new Error("--attach requires --partner");
    }
    return setPartner(attach, partner);
  }

  if (detach) {
    return setPartner(detach, null);
  }

  const codeRaw = readArg("code");
  const type = readArg("type");
  const valueRaw = readArg("value");

  if (!codeRaw || !type || valueRaw === undefined) {
    throw new Error("Required: --code --type --value");
  }

  const code = normalizeCode(codeRaw);

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

  const now = new Date().toISOString();
  const id = randomUUID();
  const partnerRaw = readArg("partner");

  await withDb(async (db) => {
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
      ...(partnerRaw ? { partnerUserId: await findPartnerUserId(db, partnerRaw) } : {}),
      createdAt: now,
      updatedAt: now,
    };

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
    }

    console.log(JSON.stringify(document, null, 2));
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
