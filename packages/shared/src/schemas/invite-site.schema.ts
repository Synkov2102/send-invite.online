import { z } from "zod";
import { INVITE_FIELD_LIMITS } from "../field-limits";
import { inviteSitePaletteSchema, inviteSitePaletteShapeSchema } from "./invite-palette.schema";
import { inviteStateSchema, inviteStateShapeSchema } from "./invite-state.schema";
import { boundedString } from "./zod-helpers";

const limits = INVITE_FIELD_LIMITS;

export const createInviteSitePayloadShapeSchema = z.object({
  invite: inviteStateShapeSchema,
  palette: inviteSitePaletteShapeSchema,
  templateId: z.string(),
});

export const createInviteSitePayloadSchema = z.object({
  invite: inviteStateSchema,
  palette: inviteSitePaletteSchema,
  templateId: boundedString(limits.templateId).trim().min(1),
});

export const publishedInviteSiteShapeSchema = createInviteSitePayloadShapeSchema.extend({
  createdAt: z.string(),
  id: z.string(),
  updatedAt: z.string(),
});

export const publishedInviteSiteSchema = createInviteSitePayloadSchema.extend({
  createdAt: z.string(),
  id: z.string(),
  updatedAt: z.string(),
});

export type CreateInviteSitePayload = z.infer<typeof createInviteSitePayloadShapeSchema>;
export type PublishedInviteSite = z.infer<typeof publishedInviteSiteShapeSchema>;
