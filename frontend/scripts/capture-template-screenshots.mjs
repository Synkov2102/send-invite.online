import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "../public/images/templates");
const baseUrl = (process.env.TEMPLATE_CAPTURE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const templateIds = [
  "alpine-rings",
  "lagoon-wave",
  "silk-monogram",
  "clarity-editorial",
  "minimal-paper",
  "electric-vows",
  "editorial-vow",
];

const waitMsByTemplate = {
  "alpine-rings": 4500,
  "lagoon-wave": 3500,
  "silk-monogram": 2500,
  "clarity-editorial": 2500,
  "minimal-paper": 2500,
  "electric-vows": 2500,
  "editorial-vow": 2500,
};

const preparePageByTemplate = {};

await mkdir(templatesDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  deviceScaleFactor: 2,
  viewport: { width: 390, height: 844 },
});

for (const templateId of templateIds) {
  const url = `${baseUrl}/templates/capture/${templateId}`;

  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForSelector(
    `[data-template-capture="${templateId}"] [data-template-capture-screen]`,
    {
      timeout: 30_000,
    },
  );
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.waitForTimeout(waitMsByTemplate[templateId] ?? 3000);
  await preparePageByTemplate[templateId]?.(page);

  const mobileName = `${templateId}-mobile.png`;

  await page.locator(`[data-template-capture="${templateId}"] [data-template-capture-screen]`).screenshot({
    path: path.join(templatesDir, mobileName),
    type: "png",
  });

  console.log(`Wrote ${mobileName}`);
}

await browser.close();
