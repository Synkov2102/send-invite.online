import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { createElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getPalettePreset } from "@/lib/invite-palette-catalog";
import { inviteTemplateCatalog } from "@/lib/invite-templates";
import { InviteSocialImage, socialImageFonts, socialImageStyles } from "./invite-social-image";

describe("social image rendering", () => {
  for (const template of inviteTemplateCatalog) {
    it(`renders all palettes of ${template.id} as 1200 × 630 PNGs`, async () => {
      const fontName = socialImageStyles[template.kind].font;
      const font = socialImageFonts[fontName];
      const data = await readFile(path.join(process.cwd(), "public/fonts/social", font.file));

      for (const paletteId of template.recommendedPaletteIds) {
        const palette = getPalettePreset(paletteId);
        assert.ok(palette, `Missing palette: ${paletteId}`);
        const response = new ImageResponse(
          createElement(InviteSocialImage, { kind: template.kind, palette }),
          {
            width: 1200,
            height: 630,
            fonts: [{ name: fontName, data, weight: font.weight, style: "normal" }],
          },
        );
        const png = Buffer.from(await response.arrayBuffer());
        const metadata = await sharp(png).metadata();
        assert.equal(metadata.format, "png");
        assert.equal(metadata.width, 1200);
        assert.equal(metadata.height, 630);

        // SVG-декор должен быть отрисован, а не потерян при сериализации JSX.
        if (template.kind === "chapter") {
          const { data: pixel } = await sharp(png)
            .extract({ left: 60, top: 60, width: 1, height: 1 })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
          assert.equal(`#${pixel.toString("hex")}`, palette.surface.toLowerCase());
        }
      }
    });
  }
});
