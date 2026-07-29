/**
 * Каталог шаблонов — единая точка регистрации.
 *
 * Чтобы добавить шаблон на существующем движке:
 * 1. Добавьте объект в `inviteTemplateCatalog` ниже.
 * 2. Укажите `kind` и `editorReady: true`.
 * 3. Положите скриншот в frontend/public/images/templates/ и mobile-версию `*-mobile.webp`
 *    (можно собрать: `node frontend/scripts/capture-template-screenshots.mjs` при запущенном frontend).
 *
 * Чтобы добавить новый движок рендера:
 * 1. Создайте папку frontend/src/invitation-templates/<kind>/.
 * 2. Добавьте kind в TemplateKind и loader в invitation-templates/registry.ts.
 */
import type { InviteState } from "./invite-state";
import type { CoverType, InviteTemplate } from "./schemas/invite-template.schema";
export type { CoverType, InviteTemplate };
export { isInviteTemplate } from "./schemas/invite-template.schema";
export type TemplateKind = "alpine" | "aqua" | "chapter" | "chrome" | "clarity" | "crimson" | "editorial" | "electric" | "memoir" | "minimal" | "silk";
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
/** Каталог пополняется в конце — разворачиваем, чтобы на странице шаблонов новые были первыми. */
export declare function getEditorReadyTemplates(): {
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
}[];
export declare function getEditorPreset(templateId: string): Partial<{
    time: string;
    date: string;
    additionalInfo: string;
    address: string;
    bride: string;
    city: string;
    coverImageUrl: string;
    dressCode: string;
    dressCodeColors: string[];
    groom: string;
    groupChatText: string;
    groupChatUrl: string;
    lead: string;
    musicEnabled: boolean;
    musicTitle: string;
    musicUrl: string;
    paletteId: string;
    portraitImageUrl: string;
    ringMetal: string;
    rsvpDate: string;
    rsvpQuestions: {
        options: string[];
        type: "multiple" | "single";
        title: string;
    }[];
    rsvpText: string;
    schedule: {
        description: string;
        time: string;
        title: string;
    }[];
    showAdditionalInfo: boolean;
    showGroupChat: boolean;
    showRsvp: boolean;
    venue: string;
    venueImageUrl: string;
    mapUrl?: string | undefined;
}> | undefined;
export declare function isWideTemplateKind(kind: TemplateKind): kind is "aqua" | "chapter" | "chrome" | "clarity" | "crimson" | "editorial" | "electric" | "memoir" | "minimal" | "silk";
export declare const defaultInviteTemplates: InviteTemplate[];
export declare function getInviteTemplate(id: string | null | undefined): InviteTemplate;
