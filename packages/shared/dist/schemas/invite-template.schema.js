"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInviteTemplate = exports.inviteTemplateSchema = exports.inviteTemplatePreviewSchema = exports.coverTypeSchema = void 0;
const zod_1 = require("zod");
const zod_helpers_1 = require("./zod-helpers");
exports.coverTypeSchema = zod_1.z.enum(["rings", "arch", "wave"]);
exports.inviteTemplatePreviewSchema = zod_1.z.object({
    accent: zod_1.z.string(),
    background: zod_1.z.string(),
    ink: zod_1.z.string(),
    surface: zod_1.z.string(),
});
exports.inviteTemplateSchema = zod_1.z
    .object({
    coverType: exports.coverTypeSchema,
    defaultPaletteId: zod_1.z.string().min(1),
    recommendedPaletteIds: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    description: zod_1.z.string(),
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    preview: exports.inviteTemplatePreviewSchema,
    screenshot: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string()),
})
    .refine((template) => template.recommendedPaletteIds[0] === template.defaultPaletteId &&
    template.recommendedPaletteIds.includes(template.defaultPaletteId), { path: ["recommendedPaletteIds"] });
exports.isInviteTemplate = (0, zod_helpers_1.createTypeGuard)(exports.inviteTemplateSchema);
