import type { InviteSitePalette } from "@/lib/invite-site-types";
import { getInviteTemplate, type InviteTemplate } from "@/lib/invite-templates";
import {
  getPalettePreset,
  type InvitePalettePreset,
} from "@/lib/invite-palette-catalog";

export type InvitePalette = InviteSitePalette;

export function getRecommendedPaletteIds(
  template: InviteTemplate | string,
): readonly string[] {
  const resolved =
    typeof template === "string" ? getInviteTemplate(template) : template;

  return resolved.recommendedPaletteIds;
}

export function getTemplatePalettes(
  template: InviteTemplate | string,
): InvitePalettePreset[] {
  return getRecommendedPaletteIds(template)
    .map((paletteId) => getPalettePreset(paletteId))
    .filter((palette): palette is InvitePalettePreset => palette !== undefined);
}

export function resolveTemplatePaletteId(
  template: InviteTemplate | string,
  paletteId: string,
): string {
  if (paletteId === "custom") {
    return paletteId;
  }

  const resolved =
    typeof template === "string" ? getInviteTemplate(template) : template;

  if (resolved.recommendedPaletteIds.includes(paletteId)) {
    return paletteId;
  }

  return resolved.defaultPaletteId;
}

export function isRecommendedPaletteForTemplate(
  template: InviteTemplate | string,
  paletteId: string,
): boolean {
  return getRecommendedPaletteIds(template).includes(paletteId);
}
