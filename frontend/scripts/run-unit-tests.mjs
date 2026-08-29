import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(frontendDir, "src");

function collectTestFiles(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(entryPath));
    } else if (entry.name.endsWith(".test.ts")) {
      files.push(entryPath);
    }
  }

  return files;
}

const testFiles = collectTestFiles(srcDir);

if (testFiles.length === 0) {
  console.log("No *.test.ts files found under src/.");
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...testFiles],
  { cwd: frontendDir, stdio: "inherit" },
);

process.exit(result.status ?? 1);
