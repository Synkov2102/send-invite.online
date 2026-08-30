import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { inviteTemplateCatalog } = require("@invite/shared");
const source = readFileSync(new URL("../src/lib/invite-palette-catalog.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getPalettePreset } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const template = inviteTemplateCatalog.find(({ id }) => id === "velvet-ticket");

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("velvet has exactly ten distinct palettes and preserves the existing choices", () => {
  assert.equal(template.recommendedPaletteIds.length, 10);
  assert.equal(new Set(template.recommendedPaletteIds).size, 10);
  for (const id of ["crimson-rosewood", "crimson-paper", "crimson-black-tie", "crimson-midnight-ruby", "crimson-plum-orchid", "crimson-mocha-copper", "crimson-champagne-ink"]) {
    assert.ok(template.recommendedPaletteIds.includes(id));
  }
  assert.equal(template.defaultPaletteId, "crimson-rosewood");
});

for (const [index, id] of template.recommendedPaletteIds.entries()) {
  test(`palette ${index + 1}/10: ${id} has readable text and buttons`, () => {
    const palette = getPalettePreset(id);
    assert.ok(palette, `Missing palette ${id}`);
    for (const [foreground, background] of [
      ["ink", "surface"],
      ["muted", "surface"],
      ["accent", "surface"],
      ["photoText", "background"],
    ]) {
      const ratio = contrast(palette[foreground], palette[background]);
      assert.ok(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)} < 4.5`);
    }
  });
}
