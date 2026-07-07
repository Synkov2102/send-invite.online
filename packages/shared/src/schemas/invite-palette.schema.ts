import { z } from "zod";
import { INVITE_FIELD_LIMITS } from "../field-limits";
import { boundedString } from "./zod-helpers";

const limits = INVITE_FIELD_LIMITS;

export const inviteSitePaletteShapeSchema = z.object({
  accent: z.string(),
  background: z.string(),
  id: z.string(),
  ink: z.string(),
  label: z.string(),
  line: z.string(),
  mood: z.string(),
  muted: z.string(),
  photoText: z.string(),
  surface: z.string(),
  veil: z.string(),
});

export const inviteSitePaletteSchema = z.object({
  accent: boundedString(limits.paletteColor),
  background: boundedString(limits.paletteColor),
  id: boundedString(limits.paletteId),
  ink: boundedString(limits.paletteColor),
  label: boundedString(limits.paletteLabel),
  line: boundedString(limits.paletteColor),
  mood: boundedString(limits.paletteMood),
  muted: boundedString(limits.paletteColor),
  photoText: boundedString(limits.paletteColor),
  surface: boundedString(limits.paletteColor),
  veil: boundedString(limits.paletteColor),
});

export type InviteSitePalette = z.infer<typeof inviteSitePaletteShapeSchema>;
