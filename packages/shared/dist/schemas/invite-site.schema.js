"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishedInviteSiteSchema = exports.publishedInviteSiteShapeSchema = exports.createInviteSitePayloadSchema = exports.createInviteSitePayloadShapeSchema = void 0;
const zod_1 = require("zod");
const field_limits_1 = require("../field-limits");
const invite_palette_schema_1 = require("./invite-palette.schema");
const invite_state_schema_1 = require("./invite-state.schema");
const zod_helpers_1 = require("./zod-helpers");
const limits = field_limits_1.INVITE_FIELD_LIMITS;
exports.createInviteSitePayloadShapeSchema = zod_1.z.object({
    invite: invite_state_schema_1.inviteStateShapeSchema,
    palette: invite_palette_schema_1.inviteSitePaletteShapeSchema,
    templateId: zod_1.z.string(),
});
exports.createInviteSitePayloadSchema = zod_1.z.object({
    invite: invite_state_schema_1.inviteStateSchema,
    palette: invite_palette_schema_1.inviteSitePaletteSchema,
    templateId: (0, zod_helpers_1.boundedString)(limits.templateId).trim().min(1),
});
exports.publishedInviteSiteShapeSchema = exports.createInviteSitePayloadShapeSchema.extend({
    createdAt: zod_1.z.string(),
    id: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.publishedInviteSiteSchema = exports.createInviteSitePayloadSchema.extend({
    createdAt: zod_1.z.string(),
    id: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
