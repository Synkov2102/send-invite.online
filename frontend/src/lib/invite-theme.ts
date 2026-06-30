import type { CSSProperties } from "react";
import type { InviteSitePalette } from "@/lib/invite-site-types";

export type { InvitePalette, InvitePalettePreset } from "@/lib/invite-palette-catalog";
export {
  getPalettePreset,
  invitePaletteCatalog,
  invitePalettePresets,
  palettePresets,
} from "@/lib/invite-palette-catalog";
export {
  getRecommendedPaletteIds,
  getTemplatePalettes,
  isRecommendedPaletteForTemplate,
  resolveTemplatePaletteId,
} from "@/lib/template-palettes";

export type InviteVars = CSSProperties & {
  "--invite-bg": string;
  "--invite-surface": string;
  "--invite-ink": string;
  "--invite-photo-text": string;
  "--invite-muted": string;
  "--invite-accent": string;
  "--invite-line": string;
  "--invite-veil": string;
};

export const inviteImages = {
  cover: "/images/wedding-mountain-cover.png",
  portrait: "/images/wedding-mountain-portrait.png",
  venue: "/images/wedding-mountain-cover.png",
} as const;

export const silkImages = {
  cover: "/images/silk-wedding-cover.png",
  portrait: "/images/silk-wedding-rings.png",
  venue: "/images/silk-wedding-venue.png",
} as const;

const ringColors = {
  gold: "#d7a83a",
  silver: "#d8dbe0",
} as const;

export const defaultCustomPalette: InviteSitePalette & {
  id: string;
  label: string;
  mood: string;
} = {
  id: "custom",
  label: "Своя",
  mood: "Настроенная вручную",
  background: "#e4e7e1",
  surface: "#fffaf2",
  ink: "#34342f",
  photoText: "#ffffff",
  muted: "#7d7d74",
  accent: "#8b7960",
  line: "#d8d1c2",
  veil: "rgba(255, 250, 242, 0.84)",
};

export function createInviteVars(palette: InviteSitePalette): InviteVars {
  return {
    "--invite-accent": palette.accent,
    "--invite-bg": palette.background,
    "--invite-ink": palette.ink,
    "--invite-line": palette.line,
    "--invite-muted": palette.muted,
    "--invite-photo-text": palette.photoText,
    "--invite-surface": palette.surface,
    "--invite-veil": palette.veil,
  };
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function mixHexColors(from: string, to: string, amount: number) {
  const read = (hex: string) => {
    const value = hex.replace("#", "");

    return {
      blue: parseInt(value.slice(4, 6), 16),
      green: parseInt(value.slice(2, 4), 16),
      red: parseInt(value.slice(0, 2), 16),
    };
  };
  const start = read(from);
  const end = read(to);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(mix(start.red, end.red))}${toHex(mix(start.green, end.green))}${toHex(
    mix(start.blue, end.blue),
  )}`;
}

export function createRingColor(ringMetal: string | number) {
  return mixHexColors(ringColors.gold, ringColors.silver, Number(ringMetal) / 100);
}
