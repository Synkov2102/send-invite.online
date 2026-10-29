import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import sharp from "sharp";

const root = fileURLToPath(new URL("../../", import.meta.url));
const previews = path.join(root, "frontend/public/images/templates");
const args = process.argv.slice(2);
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const output = path.resolve(option("output") ?? path.join(root, "output/avito"));
const source = path.resolve(option("source") ?? path.join(root, "output/avito/sources"));
const paletteNumber = Number(option("palette") ?? 1);
const require = createRequire(import.meta.url);
const { inviteTemplateCatalog } = require("@invite/shared");
// Screen boundaries follow each supplied raster, including foreground occlusions.
const cards = [
  ["01-create", 218, 310, 310, 635, "M520 629 L550 629 L550 735 L520 714 Z"],
  ["02-no-designer", 190, 291, 323, 648],
  ["03-music", 217, 286, 307, 646],
  ["04-colors", 165, 277, 323, 667, "M470 642 L488 627 L488 665 Z"],
  ["05-rsvp", 197, 280, 322, 650, "M510 653 L545 636 L550 800 L519 808 Z"],
  ["06-duration", 224, 286, 307, 645],
  ["07-templates", 187, 286, 310, 648],
  ["08-photos", 202, 275, 313, 657, "M474 650 L550 628 L550 823 L515 833 Z"],
  ["09-link", 225, 293, 332, 650],
  ["10-choice", 187, 286, 310, 648],
];

await mkdir(path.join(output, "masks"), { recursive: true });
const layouts = [];
for (const [index, [name, x, y, width, height, occlusion = ""]] of cards.entries()) {
  let original = await sharp(path.join(source, `${name}.png`)).ensureAlpha().png().toBuffer();
  if (name === "10-choice") {
    // Keep the original heading; reuse the single-phone scene from card 07.
    const scene = await sharp(path.join(source, "07-templates.png"))
      .extract({ left: 0, top: 263, width: 1080, height: 817 }).png().toBuffer();
    original = await sharp(original).composite([{ input: scene, top: 263, left: 0 }]).png().toBuffer();
  }
  const notchWidth = width * 0.52;
  const notchX = x + (width - notchWidth) / 2;
  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="35" fill="white"/><path d="M${notchX} ${y - 1}h${notchWidth}v12q0 12 -14 12h-${notchWidth - 28}q-14 0 -14 -12Z" fill="black"/><path d="${occlusion}" fill="black"/></svg>`;
  // Convert the luminance mask to alpha, retaining antialiasing at the edges.
  const gray = await sharp(Buffer.from(svg)).flatten({ background: "black" }).greyscale().raw().toBuffer();
  const alpha = await sharp({ create: { width: 1080, height: 1080, channels: 3, background: "white" } })
    .joinChannel(gray, { raw: { width: 1080, height: 1080, channels: 1 } }).png().toBuffer();
  let overlay = await sharp(original).composite([{ input: alpha, blend: "dest-out" }]).png().toBuffer();
  const right = index % 2 === 1;
  if (right) {
    const sceneTop = ["04-colors", "08-photos"].includes(name) ? 240 : y - 24;
    const sceneBottom = 985;
    const scene = await sharp(overlay).extract({ left: 0, top: sceneTop, width: 1080, height: sceneBottom - sceneTop }).flop().png().toBuffer();
    const header = await sharp(overlay).extract({ left: 0, top: 0, width: 1080, height: sceneTop }).png().toBuffer();
    const footer = await sharp(overlay).extract({ left: 0, top: sceneBottom, width: 1080, height: 1080 - sceneBottom }).png().toBuffer();
    const brand = await sharp(overlay).extract({ left: 390, top: 968, width: 310, height: 112 }).png().toBuffer();
    overlay = await sharp({ create: { width: 1080, height: 1080, channels: 4, background: "transparent" } })
      .composite([{ input: header, top: 0, left: 0 }, { input: scene, top: sceneTop, left: 0 }, { input: footer, top: sceneBottom, left: 0 }, { input: brand, top: 968, left: 390 }]).png().toBuffer();
    if (name === "06-duration") {
      const calendar = Buffer.from('<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-10 190 760)"><rect x="118" y="716" width="145" height="83" fill="#fff6ea"/><text x="190" y="787" text-anchor="middle" font-family="Arial" font-size="79" font-weight="900" fill="#ff0754">+10</text></g></svg>');
      overlay = await sharp(overlay).composite([{ input: calendar }]).png().toBuffer();
    }
  }
  await writeFile(path.join(output, "masks", `${name}.png`), overlay);
  layouts.push({ name, x: right ? 1080 - x - width : x, y, width, height, side: right ? "right" : "left", overlay });
}

const available = (await readdir(previews)).filter((name) => name.endsWith("-mobile.webp")).sort();
const selected = option("templates")?.split(",");
const files = selected
  ? selected.map((id) => `${id}-mobile.webp`)
  : args.includes("--all") ? available : ["chapter-ticket-mobile.webp", "crimson-letter-mobile.webp", "minimal-paper-mobile.webp"];
const thumbs = [];
for (const file of files) {
  if (!available.includes(file)) throw new Error(`Unknown preview: ${file}`);
  const id = file.replace("-mobile.webp", "");
  const destination = path.join(output, "ready", id);
  await mkdir(destination, { recursive: true });
  for (const layout of layouts) {
    const template = inviteTemplateCatalog.find((item) => item.id === id);
    const preview = option("palette")
      ? path.join(previews, id, `${template.recommendedPaletteIds[paletteNumber - 1]}.webp`)
      : path.join(previews, file);
    const screen = await sharp(preview).resize(layout.width, layout.height, { fit: "cover", position: "top" }).png().toBuffer();
    const result = await sharp({ create: { width: 1080, height: 1080, channels: 4, background: "white" } })
      .composite([{ input: screen, left: layout.x, top: layout.y }, { input: layout.overlay }]).png().toBuffer();
    await writeFile(path.join(destination, `${layout.name}.png`), result);
    if (files.indexOf(file) === 0) thumbs.push(await sharp(result).resize(270, 270).png().toBuffer());
  }
  console.log(`Created 10 cards: ${destination}`);
}
await sharp({ create: { width: 1350, height: 540, channels: 3, background: "#eeeeee" } })
  .composite(thumbs.map((input, i) => ({ input, left: (i % 5) * 270, top: Math.floor(i / 5) * 270 })))
  .png().toFile(path.join(output, "contact-sheet.png"));
await writeFile(path.join(output, "masks/layouts.json"), JSON.stringify(layouts.map(({ overlay, ...layout }) => layout), null, 2));
console.log(`Masks and contact sheet: ${output}`);
