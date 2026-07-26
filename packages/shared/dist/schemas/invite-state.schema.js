"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteStateSchema = exports.inviteRsvpQuestionSchema = exports.inviteScheduleItemSchema = exports.inviteStateShapeSchema = exports.inviteRsvpQuestionShapeSchema = exports.inviteScheduleItemShapeSchema = void 0;
const zod_1 = require("zod");
const field_limits_1 = require("../field-limits");
const zod_helpers_1 = require("./zod-helpers");
const limits = field_limits_1.INVITE_FIELD_LIMITS;
exports.inviteScheduleItemShapeSchema = zod_1.z.object({
    description: zod_1.z.string(),
    time: zod_1.z.string(),
    title: zod_1.z.string(),
});
exports.inviteRsvpQuestionShapeSchema = zod_1.z.object({
    options: zod_1.z.array(zod_1.z.string()),
    title: zod_1.z.string(),
    type: zod_1.z.enum(["multiple", "single"]),
});
exports.inviteStateShapeSchema = zod_1.z.object({
    additionalInfo: zod_1.z.string().default(""),
    address: zod_1.z.string(),
    bride: zod_1.z.string(),
    city: zod_1.z.string(),
    coverImageUrl: zod_1.z.string(),
    date: zod_1.z.string(),
    dressCode: zod_1.z.string(),
    dressCodeColors: zod_1.z.array(zod_1.z.string()),
    groom: zod_1.z.string(),
    groupChatText: zod_1.z.string().default(""),
    groupChatUrl: zod_1.z.string().default(""),
    lead: zod_1.z.string(),
    mapUrl: zod_1.z.string().optional(),
    musicEnabled: zod_1.z.boolean(),
    musicTitle: zod_1.z.string(),
    musicUrl: zod_1.z.string(),
    paletteId: zod_1.z.string(),
    portraitImageUrl: zod_1.z.string(),
    ringMetal: zod_1.z.string(),
    rsvpDate: zod_1.z.string(),
    rsvpQuestions: zod_1.z.array(exports.inviteRsvpQuestionShapeSchema),
    rsvpText: zod_1.z.string(),
    schedule: zod_1.z.array(exports.inviteScheduleItemShapeSchema),
    showAdditionalInfo: zod_1.z.boolean().default(false),
    showGroupChat: zod_1.z.boolean().default(false),
    showRsvp: zod_1.z.boolean(),
    time: zod_1.z.string(),
    venue: zod_1.z.string(),
    venueImageUrl: zod_1.z.string(),
});
exports.inviteScheduleItemSchema = zod_1.z.object({
    description: (0, zod_helpers_1.boundedString)(limits.scheduleDescription),
    time: (0, zod_helpers_1.boundedString)(limits.scheduleTime),
    title: (0, zod_helpers_1.boundedString)(limits.scheduleTitle),
});
exports.inviteRsvpQuestionSchema = zod_1.z.object({
    options: zod_1.z.array((0, zod_helpers_1.boundedString)(limits.rsvpOption)).max(limits.rsvpOptionsMax),
    title: (0, zod_helpers_1.boundedString)(limits.rsvpQuestionTitle),
    type: zod_1.z.enum(["multiple", "single"]),
});
exports.inviteStateSchema = exports.inviteStateShapeSchema.extend({
    additionalInfo: (0, zod_helpers_1.boundedString)(limits.additionalInfo).default(""),
    address: (0, zod_helpers_1.boundedString)(limits.address),
    bride: (0, zod_helpers_1.boundedString)(limits.bride),
    city: (0, zod_helpers_1.boundedString)(limits.city),
    coverImageUrl: (0, zod_helpers_1.mediaUrlString)(limits.mediaUrl),
    date: (0, zod_helpers_1.boundedString)(limits.textDate),
    dressCode: (0, zod_helpers_1.boundedString)(limits.dressCode),
    dressCodeColors: zod_1.z.array((0, zod_helpers_1.boundedString)(limits.dressCodeColor)).max(limits.dressCodeColorsMax),
    groom: (0, zod_helpers_1.boundedString)(limits.groom),
    groupChatText: (0, zod_helpers_1.boundedString)(limits.groupChatText).default(""),
    groupChatUrl: (0, zod_helpers_1.httpUrlString)(limits.groupChatUrl).default(""),
    lead: (0, zod_helpers_1.boundedString)(limits.lead),
    mapUrl: (0, zod_helpers_1.boundedString)(limits.mapUrl).optional(),
    musicTitle: (0, zod_helpers_1.boundedString)(limits.musicTitle),
    musicUrl: (0, zod_helpers_1.mediaUrlString)(limits.mediaUrl),
    paletteId: (0, zod_helpers_1.boundedString)(limits.paletteId),
    portraitImageUrl: (0, zod_helpers_1.mediaUrlString)(limits.mediaUrl),
    ringMetal: (0, zod_helpers_1.boundedString)(limits.ringMetal),
    rsvpDate: (0, zod_helpers_1.boundedString)(limits.rsvpDate),
    rsvpQuestions: zod_1.z.array(exports.inviteRsvpQuestionSchema).max(limits.rsvpQuestionsMax),
    rsvpText: (0, zod_helpers_1.boundedString)(limits.rsvpText),
    schedule: zod_1.z.array(exports.inviteScheduleItemSchema).max(limits.scheduleItemMax),
    showAdditionalInfo: zod_1.z.boolean().default(false),
    showGroupChat: zod_1.z.boolean().default(false),
    time: (0, zod_helpers_1.boundedString)(limits.textTime),
    venue: (0, zod_helpers_1.boundedString)(limits.venue),
    venueImageUrl: (0, zod_helpers_1.mediaUrlString)(limits.mediaUrl),
});
