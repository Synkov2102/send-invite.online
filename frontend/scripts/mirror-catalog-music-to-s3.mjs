/**
 * Mirror Pixabay catalog tracks into S3 and rewrite audioUrl in music-tracks.ts.
 *
 * Usage (from repo root, with .env.backend.local configured):
 *   node frontend/scripts/mirror-catalog-music-to-s3.mjs
 *
 * Optional:
 *   --dry-run          download only, do not upload / rewrite
 *   --skip-download    reuse files already in frontend/.cache/catalog-music/
 *   --public-base=URL  optional direct public object base; default uses /api/catalog-music/{id}
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(
  pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../backend/package.json")),
);
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const tracksFile = path.join(repoRoot, "frontend/src/editor/music-tracks.ts");
const cacheDir = path.join(repoRoot, "frontend/.cache/catalog-music");
const keyPrefix = "catalog-music/";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipDownload = args.has("--skip-download");
const publicBaseArg = [...args].find((arg) => arg.startsWith("--public-base="));

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

function getS3Config() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT || "https://storage.yandexcloud.net";
  const region = process.env.S3_REGION || process.env.AWS_REGION || "ru-central1";
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

  if (!accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "S3 is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY in .env.backend.local",
    );
  }

  return { accessKeyId, secretAccessKey, bucket, endpoint, region, forcePathStyle };
}

function trackPublicUrl(trackId, config) {
  if (publicBaseArg) {
    const base = publicBaseArg.slice("--public-base=".length).replace(/\/$/, "");
    return `${base}/${keyPrefix}${trackId}.mp3`;
  }
  if (process.env.S3_PUBLIC_BASE_URL) {
    return `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${keyPrefix}${trackId}.mp3`;
  }
  // Served by Nest from private/public bucket via first-party API.
  void config;
  return `/api/catalog-music/${trackId}`;
}

function parseTracks(source) {
  const tracks = [];
  const blockRe =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?audioUrl:\s*"([^"]+)"[\s\S]*?sourceUrl:\s*"([^"]+)"/g;
  for (const match of source.matchAll(blockRe)) {
    tracks.push({
      id: match[1],
      audioUrl: match[2],
      sourceUrl: match[3],
    });
  }
  if (tracks.length === 0) {
    throw new Error(`No tracks parsed from ${tracksFile}`);
  }
  return tracks;
}

function looksLikeMp3(buffer) {
  if (buffer.length < 4) return false;
  // ID3 tag or MPEG frame sync
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;
  return false;
}

async function downloadTrack(track, destPath) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(track.audioUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; send-invite-music-mirror/1.0; +https://send-invite.online)",
        accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 10_000 || !looksLikeMp3(buffer)) {
      throw new Error(
        `Unexpected payload (${buffer.length} bytes, mp3=${looksLikeMp3(buffer)})`,
      );
    }

    await writeFile(destPath, buffer);
    return buffer;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("timeout 25s (cdn.pixabay.com unreachable?)");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function uploadTrack(client, config, key, buffer) {
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=31536000, immutable",
      ACL: undefined,
    }),
  );
}

async function main() {
  const source = await readFile(tracksFile, "utf8");
  const tracks = parseTracks(source);
  await mkdir(cacheDir, { recursive: true });

  const config = dryRun
    ? null
    : getS3Config();
  const client = config
    ? new S3Client({
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle,
        region: config.region,
      })
    : null;
  console.log(`Tracks: ${tracks.length}`);
  console.log(`Cache:  ${cacheDir}`);
  if (config) {
    console.log(`Bucket host: ${new URL(config.endpoint).host}`);
    console.log(`URL mode: ${publicBaseArg || process.env.S3_PUBLIC_BASE_URL ? "public S3" : "/api/catalog-music/{id}"}`);
  } else {
    console.log("Mode: dry-run (download only)");
  }

  const urlById = new Map();
  const failures = [];

  for (const track of tracks) {
    const destPath = path.join(cacheDir, `${track.id}.mp3`);
    const key = `${keyPrefix}${track.id}.mp3`;
    process.stdout.write(`• ${track.id} ... `);

    try {
      let buffer;
      if (skipDownload) {
        buffer = await readFile(destPath);
        if (buffer.length < 10_000 || !looksLikeMp3(buffer)) {
          throw new Error("Cached file is invalid");
        }
      } else {
        try {
          buffer = await downloadTrack(track, destPath);
        } catch (firstError) {
          // one retry
          buffer = await downloadTrack(track, destPath).catch(() => {
            throw firstError;
          });
        }
      }

      const publicUrl = trackPublicUrl(track.id, config);
      if (!dryRun) {
        await uploadTrack(client, config, key, buffer);
      }

      urlById.set(track.id, publicUrl);
      const sha = createHash("sha1").update(buffer).digest("hex").slice(0, 8);
      console.log(`ok (${(buffer.length / 1024).toFixed(0)} KB, ${sha})`);
    } catch (error) {
      failures.push({ id: track.id, url: track.audioUrl, error: String(error.message || error) });
      console.log(`FAIL ${error.message || error}`);
    }
  }

  if (failures.length) {
    console.error(`\nFailed: ${failures.length}/${tracks.length}`);
    for (const failure of failures) {
      console.error(`  - ${failure.id}: ${failure.error}`);
    }
    if (failures.length === tracks.length) {
      process.exitCode = 1;
      return;
    }
  }

  if (dryRun) {
    console.log("\nDry-run complete. Re-run without --dry-run to upload and rewrite URLs.");
    return;
  }

  let nextSource = source;
  for (const track of tracks) {
    const nextUrl = urlById.get(track.id);
    if (!nextUrl) continue;
    // Replace only this track's audioUrl occurrence.
    const pattern = new RegExp(
      `(id:\\s*"${track.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?audioUrl:\\s*")[^"]+(")`,
    );
    if (!pattern.test(nextSource)) {
      throw new Error(`Could not rewrite audioUrl for ${track.id}`);
    }
    nextSource = nextSource.replace(pattern, `$1${nextUrl}$2`);
  }

  await writeFile(tracksFile, nextSource);
  console.log(`\nUpdated ${tracksFile}`);
  console.log(`Uploaded ${urlById.size}/${tracks.length} tracks to ${keyPrefix}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
