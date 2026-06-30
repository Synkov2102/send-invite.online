"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInviteState = isInviteState;
exports.isInviteSitePalette = isInviteSitePalette;
exports.isPublishedInviteSite = isPublishedInviteSite;
exports.parseCreateInviteSitePayload = parseCreateInviteSitePayload;
const invite_field_limits_1 = require("./invite-field-limits");
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringArray(value) {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function isSchedule(value) {
    return (Array.isArray(value) &&
        value.every((item) => isRecord(item) &&
            typeof item.description === "string" &&
            typeof item.time === "string" &&
            typeof item.title === "string"));
}
function isRsvpQuestions(value) {
    return (Array.isArray(value) &&
        value.every((item) => isRecord(item) &&
            typeof item.title === "string" &&
            (item.type === "multiple" || item.type === "single") &&
            isStringArray(item.options)));
}
function isInviteState(value) {
    if (!isRecord(value)) {
        return false;
    }
    return (typeof value.address === "string" &&
        typeof value.bride === "string" &&
        typeof value.city === "string" &&
        typeof value.coverImageUrl === "string" &&
        typeof value.date === "string" &&
        typeof value.dressCode === "string" &&
        isStringArray(value.dressCodeColors) &&
        typeof value.groom === "string" &&
        typeof value.lead === "string" &&
        (value.mapUrl === undefined || typeof value.mapUrl === "string") &&
        typeof value.musicEnabled === "boolean" &&
        typeof value.musicTitle === "string" &&
        typeof value.musicUrl === "string" &&
        typeof value.paletteId === "string" &&
        typeof value.portraitImageUrl === "string" &&
        typeof value.ringMetal === "string" &&
        typeof value.rsvpDate === "string" &&
        isRsvpQuestions(value.rsvpQuestions) &&
        typeof value.rsvpText === "string" &&
        isSchedule(value.schedule) &&
        typeof value.showRsvp === "boolean" &&
        typeof value.time === "string" &&
        typeof value.venue === "string" &&
        typeof value.venueImageUrl === "string");
}
function isInviteSitePalette(value) {
    if (!isRecord(value)) {
        return false;
    }
    return (typeof value.accent === "string" &&
        typeof value.background === "string" &&
        typeof value.id === "string" &&
        typeof value.ink === "string" &&
        typeof value.label === "string" &&
        typeof value.line === "string" &&
        typeof value.mood === "string" &&
        typeof value.muted === "string" &&
        typeof value.photoText === "string" &&
        typeof value.surface === "string" &&
        typeof value.veil === "string");
}
function isPublishedInviteSite(value) {
    return (isRecord(value) &&
        typeof value.createdAt === "string" &&
        typeof value.id === "string" &&
        typeof value.templateId === "string" &&
        typeof value.updatedAt === "string" &&
        isInviteState(value.invite) &&
        isInviteSitePalette(value.palette));
}
function parseCreateInviteSitePayload(value) {
    if (!isRecord(value)) {
        return { error: "Некорректные данные сайта.", ok: false };
    }
    if (typeof value.templateId !== "string" ||
        value.templateId.trim().length === 0 ||
        value.templateId.trim().length > 64) {
        return { error: "Неизвестный шаблон приглашения.", ok: false };
    }
    if (!isInviteState(value.invite)) {
        return { error: "Не удалось прочитать данные приглашения.", ok: false };
    }
    const inviteLimitError = (0, invite_field_limits_1.validateInviteFieldLimits)(value.invite);
    if (inviteLimitError) {
        return { error: inviteLimitError, ok: false };
    }
    if (!isInviteSitePalette(value.palette)) {
        return { error: "Не удалось прочитать палитру приглашения.", ok: false };
    }
    const paletteLimitError = (0, invite_field_limits_1.validatePaletteFieldLimits)(value.palette);
    if (paletteLimitError) {
        return { error: paletteLimitError, ok: false };
    }
    return {
        ok: true,
        payload: {
            invite: value.invite,
            palette: value.palette,
            templateId: value.templateId.trim(),
        },
    };
}
