/**
 * Shared plumbing for the backend CLI scripts (set-price, create-promo-code, publish-article).
 *
 * These run straight from the repo with plain node, outside the Nest app, so they cannot use
 * ConfigModule or the DI container — hence the hand-rolled env loading and argv parsing.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Resolves runtime deps (mongodb, @invite/shared) against the backend workspace. */
export const requireFromBackend = createRequire(
  pathToFileURL(path.join(repoRoot, "backend/package.json")),
);

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

/** Local env wins; production is the fallback. Already-set variables are never overwritten. */
export function loadBackendEnv() {
  loadEnvFile(path.join(repoRoot, ".env.backend.local"));
  loadEnvFile(path.join(repoRoot, ".env.backend.production"));
}

export function readArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

export function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}
