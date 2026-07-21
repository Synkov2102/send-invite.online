import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "../public/images/templates");
const baseUrl = (process.env.TEMPLATE_CAPTURE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const { inviteTemplateCatalog } = require("@invite/shared");
const templates = inviteTemplateCatalog.filter((template) => template.editorReady);

const waitMsByTemplate = {
  "alpine-rings": 4500,
  "lagoon-wave": 3500,
  "silk-monogram": 2500,
  "chrome-affair": 2500,
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

for (const template of templates) {
  const templateDir = path.join(templatesDir, template.id);
  await mkdir(templateDir, { recursive: true });

  for (const paletteId of template.recommendedPaletteIds) {
    const url = `${baseUrl}/templates/capture/${template.id}?palette=${encodeURIComponent(paletteId)}`;

    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForSelector(
      `[data-template-capture="${template.id}"] [data-template-capture-screen]`,
      {
        timeout: 30_000,
      },
    );
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.waitForTimeout(waitMsByTemplate[template.id] ?? 3000);
    await preparePageByTemplate[template.id]?.(page);

    const screenshot = await page
      .locator(
        `[data-template-capture="${template.id}"] [data-template-capture-screen]`,
      )
      .screenshot({ type: "png" });
    const paletteName = `${paletteId}.webp`;

    await sharp(screenshot)
      .webp({ quality: 82 })
      .toFile(path.join(templateDir, paletteName));

    console.log(`Wrote ${template.id}/${paletteName}`);
  }
}

await browser.close();
