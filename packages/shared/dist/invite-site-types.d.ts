import type { InviteState } from "./invite-state";
export type InviteSitePalette = {
    id: string;
    label: string;
    mood: string;
    background: string;
    surface: string;
    ink: string;
    photoText: string;
    muted: string;
    accent: string;
    line: string;
    veil: string;
};
export type CreateInviteSitePayload = {
    invite: InviteState;
    palette: InviteSitePalette;
    templateId: string;
};
export type PublishedInviteSite = CreateInviteSitePayload & {
    createdAt: string;
    id: string;
    updatedAt: string;
};
type ParsedPayload = {
    ok: true;
    payload: CreateInviteSitePayload;
} | {
    error: string;
    ok: false;
};
export declare function isInviteState(value: unknown): value is InviteState;
export declare function isInviteSitePalette(value: unknown): value is InviteSitePalette;
export declare function isPublishedInviteSite(value: unknown): value is PublishedInviteSite;
export declare function parseCreateInviteSitePayload(value: unknown): ParsedPayload;
export {};
