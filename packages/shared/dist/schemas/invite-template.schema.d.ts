import { z } from "zod";
export declare const coverTypeSchema: z.ZodEnum<["rings", "arch", "wave"]>;
export declare const inviteTemplatePreviewSchema: z.ZodObject<{
    accent: z.ZodString;
    background: z.ZodString;
    ink: z.ZodString;
    surface: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accent: string;
    background: string;
    ink: string;
    surface: string;
}, {
    accent: string;
    background: string;
    ink: string;
    surface: string;
}>;
export declare const inviteTemplateSchema: z.ZodEffects<z.ZodObject<{
    coverType: z.ZodEnum<["rings", "arch", "wave"]>;
    defaultPaletteId: z.ZodString;
    recommendedPaletteIds: z.ZodArray<z.ZodString, "many">;
    description: z.ZodString;
    id: z.ZodString;
    name: z.ZodString;
    preview: z.ZodObject<{
        accent: z.ZodString;
        background: z.ZodString;
        ink: z.ZodString;
        surface: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    }, {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    }>;
    screenshot: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    coverType: "rings" | "arch" | "wave";
    defaultPaletteId: string;
    recommendedPaletteIds: string[];
    name: string;
    preview: {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    };
    screenshot: string;
    tags: string[];
}, {
    id: string;
    description: string;
    coverType: "rings" | "arch" | "wave";
    defaultPaletteId: string;
    recommendedPaletteIds: string[];
    name: string;
    preview: {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    };
    screenshot: string;
    tags: string[];
}>, {
    id: string;
    description: string;
    coverType: "rings" | "arch" | "wave";
    defaultPaletteId: string;
    recommendedPaletteIds: string[];
    name: string;
    preview: {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    };
    screenshot: string;
    tags: string[];
}, {
    id: string;
    description: string;
    coverType: "rings" | "arch" | "wave";
    defaultPaletteId: string;
    recommendedPaletteIds: string[];
    name: string;
    preview: {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    };
    screenshot: string;
    tags: string[];
}>;
export type CoverType = z.infer<typeof coverTypeSchema>;
export type InviteTemplate = z.infer<typeof inviteTemplateSchema>;
export declare const isInviteTemplate: (value: unknown) => value is {
    id: string;
    description: string;
    coverType: "rings" | "arch" | "wave";
    defaultPaletteId: string;
    recommendedPaletteIds: string[];
    name: string;
    preview: {
        accent: string;
        background: string;
        ink: string;
        surface: string;
    };
    screenshot: string;
    tags: string[];
};
