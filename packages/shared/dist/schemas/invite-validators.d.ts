import { createInviteSitePayloadSchema, createInviteSitePayloadShapeSchema, publishedInviteSiteSchema, publishedInviteSiteShapeSchema } from "./invite-site.schema";
export declare const isInviteState: (value: unknown) => value is {
    time: string;
    date: string;
    address: string;
    bride: string;
    city: string;
    coverImageUrl: string;
    dressCode: string;
    dressCodeColors: string[];
    groom: string;
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
    showRsvp: boolean;
    venue: string;
    venueImageUrl: string;
    mapUrl?: string | undefined;
};
export declare const isInviteSitePalette: (value: unknown) => value is {
    accent: string;
    background: string;
    id: string;
    ink: string;
    label: string;
    line: string;
    mood: string;
    muted: string;
    photoText: string;
    surface: string;
    veil: string;
};
export declare const isPublishedInviteSite: (value: unknown) => value is {
    id: string;
    invite: {
        time: string;
        date: string;
        address: string;
        bride: string;
        city: string;
        coverImageUrl: string;
        dressCode: string;
        dressCodeColors: string[];
        groom: string;
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
        showRsvp: boolean;
        venue: string;
        venueImageUrl: string;
        mapUrl?: string | undefined;
    };
    palette: {
        accent: string;
        background: string;
        id: string;
        ink: string;
        label: string;
        line: string;
        mood: string;
        muted: string;
        photoText: string;
        surface: string;
        veil: string;
    };
    templateId: string;
    createdAt: string;
    updatedAt: string;
};
type ParsedPayload = {
    ok: true;
    payload: import("./invite-site.schema").CreateInviteSitePayload;
} | {
    error: string;
    ok: false;
};
export declare function parseCreateInviteSitePayload(value: unknown): ParsedPayload;
export declare function validateInviteFieldLimits(value: unknown): string | null;
export declare function validatePaletteFieldLimits(value: unknown): string | null;
export { createInviteSitePayloadSchema, createInviteSitePayloadShapeSchema, publishedInviteSiteSchema, publishedInviteSiteShapeSchema, };
