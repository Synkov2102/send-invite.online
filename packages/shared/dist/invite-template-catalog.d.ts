/**
 * Каталог шаблонов — единая точка регистрации.
 *
 * Чтобы добавить шаблон на существующем движке:
 * 1. Добавьте объект в `inviteTemplateCatalog` ниже.
 * 2. Укажите `kind` (alpine | aqua | silk | vanilla) и `editorReady: true`.
 * 3. Положите скриншот в frontend/public/images/templates/.
 *
 * Чтобы добавить новый движок рендера:
 * 1. Создайте папку frontend/src/invitation-templates/<kind>/.
 * 2. Добавьте kind в TemplateKind и loader в invitation-templates/registry.ts.
 */
import type { InviteState } from "./invite-state";
export type CoverType = "rings" | "arch" | "wave";
export type TemplateKind = "alpine" | "aqua" | "silk" | "vanilla";
export type InviteTemplate = {
    id: string;
    name: string;
    description: string;
    coverType: CoverType;
    defaultPaletteId: string;
    recommendedPaletteIds: readonly string[];
    tags: string[];
    screenshot: string;
    preview: {
        background: string;
        surface: string;
        ink: string;
        accent: string;
    };
};
export type InviteTemplateDefinition = InviteTemplate & {
    /** Какой React-движок рисует шаблон. */
    kind: TemplateKind;
    /** Показывать в каталоге и открывать в редакторе. */
    editorReady: boolean;
    /** Демо-тексты при первом открытии в редакторе (необязательно). */
    editorPreset?: Partial<InviteState>;
};
export declare const inviteTemplateCatalog: InviteTemplateDefinition[];
export declare function toPublicTemplate(definition: InviteTemplateDefinition): InviteTemplate;
export declare function getTemplateDefinition(id: string | null | undefined): InviteTemplateDefinition;
export declare function getTemplateKind(templateId: string): TemplateKind;
export declare function getInviteTemplateName(templateId: string): string;
export declare function isEditorReadyTemplate(templateId: string): boolean;
export declare function getEditorReadyTemplates(): InviteTemplate[];
export declare function getEditorPreset(templateId: string): Partial<InviteState> | undefined;
export declare function isWideTemplateKind(kind: TemplateKind): kind is "aqua" | "silk" | "vanilla";
export declare const defaultInviteTemplates: InviteTemplate[];
export declare function getInviteTemplate(id: string | null | undefined): InviteTemplate;
export declare function isInviteTemplate(value: unknown): value is InviteTemplate;
