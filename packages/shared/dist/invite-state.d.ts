export type InviteScheduleItem = {
    description: string;
    time: string;
    title: string;
};
export type InviteRsvpQuestion = {
    options: string[];
    title: string;
    type: "multiple" | "single";
};
export type InviteState = {
    address: string;
    bride: string;
    city: string;
    coverImageUrl: string;
    date: string;
    dressCode: string;
    dressCodeColors: string[];
    groom: string;
    lead: string;
    mapUrl?: string;
    musicEnabled: boolean;
    musicTitle: string;
    musicUrl: string;
    paletteId: string;
    portraitImageUrl: string;
    ringMetal: string;
    rsvpDate: string;
    rsvpQuestions: InviteRsvpQuestion[];
    rsvpText: string;
    schedule: InviteScheduleItem[];
    showRsvp: boolean;
    time: string;
    venue: string;
    venueImageUrl: string;
};
