import { z } from "zod";
import { createTypeGuard } from "./zod-helpers";

export const coverTypeSchema = z.enum(["rings", "arch", "wave"]);

export const inviteTemplatePreviewSchema = z.object({
  accent: z.string(),
  background: z.string(),
  ink: z.string(),
  surface: z.string(),
});

export const inviteTemplateSchema = z
  .object({
    coverType: coverTypeSchema,
    defaultPaletteId: z.string().min(1),
    recommendedPaletteIds: z.array(z.string().min(1)).min(1),
    description: z.string(),
    id: z.string().min(1),
    name: z.string().min(1),
    preview: inviteTemplatePreviewSchema,
    screenshot: z.string().min(1),
    tags: z.array(z.string()),
  })
  .refine(
    (template) =>
      template.recommendedPaletteIds[0] === template.defaultPaletteId &&
      template.recommendedPaletteIds.includes(template.defaultPaletteId),
    { path: ["recommendedPaletteIds"] },
  );

export type CoverType = z.infer<typeof coverTypeSchema>;
export type InviteTemplate = z.infer<typeof inviteTemplateSchema>;

export const isInviteTemplate = createTypeGuard(inviteTemplateSchema);
