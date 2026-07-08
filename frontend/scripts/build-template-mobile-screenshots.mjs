import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, "..");
const captureScript = path.join(__dirname, "capture-template-screenshots.mjs");
const capturePort = process.env.TEMPLATE_CAPTURE_PORT ?? "3999";
const baseUrl = (process.env.TEMPLATE_CAPTURE_URL ?? `http://localhost:${capturePort}`).replace(/\/$/, "");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: frontendDir,
      env: process.env,
      shell: true,
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });
}

async function isServerReady(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return response.status < 500;
  } catch {
    return false;
  }
}

let server = null;
let startedServer = false;

if (!(await isServerReady(baseUrl))) {
  await runCommand("npm", ["run", "build"]);
  server = spawn("npm", ["run", "start", "--", "-p", capturePort], {
    cwd: frontendDir,
    env: process.env,
    shell: true,
    stdio: "inherit",
  });
  startedServer = true;

  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (await isServerReady(baseUrl)) {
      break;
    }

    await wait(1000);
  }

  if (!(await isServerReady(baseUrl))) {
    server.kill();
    throw new Error(`Frontend is not reachable at ${baseUrl}`);
  }
}

await mkdir(path.join(frontendDir, "public/images/templates"), { recursive: true });

const capture = spawn("node", [captureScript], {
  cwd: frontendDir,
  env: { ...process.env, TEMPLATE_CAPTURE_URL: baseUrl },
  stdio: "inherit",
});

const exitCode = await new Promise((resolve) => {
  capture.on("exit", resolve);
});

if (startedServer && server) {
  server.kill();
}

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}
