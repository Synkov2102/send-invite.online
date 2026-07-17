import { z } from "zod";
export declare const inviteScheduleItemShapeSchema: z.ZodObject<{
    description: z.ZodString;
    time: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    time: string;
    title: string;
}, {
    description: string;
    time: string;
    title: string;
}>;
export declare const inviteRsvpQuestionShapeSchema: z.ZodObject<{
    options: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    type: z.ZodEnum<["multiple", "single"]>;
}, "strip", z.ZodTypeAny, {
    options: string[];
    type: "multiple" | "single";
    title: string;
}, {
    options: string[];
    type: "multiple" | "single";
    title: string;
}>;
export declare const inviteStateShapeSchema: z.ZodObject<{
    additionalInfo: z.ZodDefault<z.ZodString>;
    address: z.ZodString;
    bride: z.ZodString;
    city: z.ZodString;
    coverImageUrl: z.ZodString;
    date: z.ZodString;
    dressCode: z.ZodString;
    dressCodeColors: z.ZodArray<z.ZodString, "many">;
    groom: z.ZodString;
    groupChatText: z.ZodDefault<z.ZodString>;
    groupChatUrl: z.ZodDefault<z.ZodString>;
    lead: z.ZodString;
    mapUrl: z.ZodOptional<z.ZodString>;
    musicEnabled: z.ZodBoolean;
    musicTitle: z.ZodString;
    musicUrl: z.ZodString;
    paletteId: z.ZodString;
    portraitImageUrl: z.ZodString;
    ringMetal: z.ZodString;
    rsvpDate: z.ZodString;
    rsvpQuestions: z.ZodArray<z.ZodObject<{
        options: z.ZodArray<z.ZodString, "many">;
        title: z.ZodString;
        type: z.ZodEnum<["multiple", "single"]>;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        type: "multiple" | "single";
        title: string;
    }, {
        options: string[];
        type: "multiple" | "single";
        title: string;
    }>, "many">;
    rsvpText: z.ZodString;
    schedule: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        time: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        time: string;
        title: string;
    }, {
        description: string;
        time: string;
        title: string;
    }>, "many">;
    showAdditionalInfo: z.ZodDefault<z.ZodBoolean>;
    showGroupChat: z.ZodDefault<z.ZodBoolean>;
    showRsvp: z.ZodBoolean;
    time: z.ZodString;
    venue: z.ZodString;
    venueImageUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
}, {
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
    additionalInfo?: string | undefined;
    groupChatText?: string | undefined;
    groupChatUrl?: string | undefined;
    mapUrl?: string | undefined;
    showAdditionalInfo?: boolean | undefined;
    showGroupChat?: boolean | undefined;
}>;
export declare const inviteScheduleItemSchema: z.ZodObject<{
    description: z.ZodString;
    time: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    time: string;
    title: string;
}, {
    description: string;
    time: string;
    title: string;
}>;
export declare const inviteRsvpQuestionSchema: z.ZodObject<{
    options: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    type: z.ZodEnum<["multiple", "single"]>;
}, "strip", z.ZodTypeAny, {
    options: string[];
    type: "multiple" | "single";
    title: string;
}, {
    options: string[];
    type: "multiple" | "single";
    title: string;
}>;
export declare const inviteStateSchema: z.ZodObject<{
    musicEnabled: z.ZodBoolean;
    showRsvp: z.ZodBoolean;
} & {
    additionalInfo: z.ZodDefault<z.ZodString>;
    address: z.ZodString;
    bride: z.ZodString;
    city: z.ZodString;
    coverImageUrl: z.ZodEffects<z.ZodString, string, string>;
    date: z.ZodString;
    dressCode: z.ZodString;
    dressCodeColors: z.ZodArray<z.ZodString, "many">;
    groom: z.ZodString;
    groupChatText: z.ZodDefault<z.ZodString>;
    groupChatUrl: z.ZodDefault<z.ZodString>;
    lead: z.ZodString;
    mapUrl: z.ZodOptional<z.ZodString>;
    musicTitle: z.ZodString;
    musicUrl: z.ZodEffects<z.ZodString, string, string>;
    paletteId: z.ZodString;
    portraitImageUrl: z.ZodEffects<z.ZodString, string, string>;
    ringMetal: z.ZodString;
    rsvpDate: z.ZodString;
    rsvpQuestions: z.ZodArray<z.ZodObject<{
        options: z.ZodArray<z.ZodString, "many">;
        title: z.ZodString;
        type: z.ZodEnum<["multiple", "single"]>;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        type: "multiple" | "single";
        title: string;
    }, {
        options: string[];
        type: "multiple" | "single";
        title: string;
    }>, "many">;
    rsvpText: z.ZodString;
    schedule: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        time: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        time: string;
        title: string;
    }, {
        description: string;
        time: string;
        title: string;
    }>, "many">;
    showAdditionalInfo: z.ZodDefault<z.ZodBoolean>;
    showGroupChat: z.ZodDefault<z.ZodBoolean>;
    time: z.ZodString;
    venue: z.ZodString;
    venueImageUrl: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
    additionalInfo?: string | undefined;
    groupChatText?: string | undefined;
    groupChatUrl?: string | undefined;
    mapUrl?: string | undefined;
    showAdditionalInfo?: boolean | undefined;
    showGroupChat?: boolean | undefined;
}>;
export type InviteScheduleItem = z.infer<typeof inviteScheduleItemShapeSchema>;
export type InviteRsvpQuestion = z.infer<typeof inviteRsvpQuestionShapeSchema>;
export type InviteState = z.infer<typeof inviteStateShapeSchema>;
