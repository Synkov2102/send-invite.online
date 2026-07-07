"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteSitePaletteSchema = exports.inviteSitePaletteShapeSchema = void 0;
const zod_1 = require("zod");
const field_limits_1 = require("../field-limits");
const zod_helpers_1 = require("./zod-helpers");
const limits = field_limits_1.INVITE_FIELD_LIMITS;
exports.inviteSitePaletteShapeSchema = zod_1.z.object({
    accent: zod_1.z.string(),
    background: zod_1.z.string(),
    id: zod_1.z.string(),
    ink: zod_1.z.string(),
    label: zod_1.z.string(),
    line: zod_1.z.string(),
    mood: zod_1.z.string(),
    muted: zod_1.z.string(),
    photoText: zod_1.z.string(),
    surface: zod_1.z.string(),
    veil: zod_1.z.string(),
});
exports.inviteSitePaletteSchema = zod_1.z.object({
    accent: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    background: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    id: (0, zod_helpers_1.boundedString)(limits.paletteId),
    ink: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    label: (0, zod_helpers_1.boundedString)(limits.paletteLabel),
    line: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    mood: (0, zod_helpers_1.boundedString)(limits.paletteMood),
    muted: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    photoText: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    surface: (0, zod_helpers_1.boundedString)(limits.paletteColor),
    veil: (0, zod_helpers_1.boundedString)(limits.paletteColor),
});
