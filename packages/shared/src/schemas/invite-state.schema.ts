import { z } from "zod";
import { INVITE_FIELD_LIMITS } from "../field-limits";
import { boundedString, mediaUrlString } from "./zod-helpers";

const limits = INVITE_FIELD_LIMITS;

export const inviteScheduleItemShapeSchema = z.object({
  description: z.string(),
  time: z.string(),
  title: z.string(),
});

export const inviteRsvpQuestionShapeSchema = z.object({
  options: z.array(z.string()),
  title: z.string(),
  type: z.enum(["multiple", "single"]),
});

export const inviteStateShapeSchema = z.object({
  address: z.string(),
  bride: z.string(),
  city: z.string(),
  coverImageUrl: z.string(),
  date: z.string(),
  dressCode: z.string(),
  dressCodeColors: z.array(z.string()),
  groom: z.string(),
  lead: z.string(),
  mapUrl: z.string().optional(),
  musicEnabled: z.boolean(),
  musicTitle: z.string(),
  musicUrl: z.string(),
  paletteId: z.string(),
  portraitImageUrl: z.string(),
  ringMetal: z.string(),
  rsvpDate: z.string(),
  rsvpQuestions: z.array(inviteRsvpQuestionShapeSchema),
  rsvpText: z.string(),
  schedule: z.array(inviteScheduleItemShapeSchema),
  showRsvp: z.boolean(),
  time: z.string(),
  venue: z.string(),
  venueImageUrl: z.string(),
});

export const inviteScheduleItemSchema = z.object({
  description: boundedString(limits.scheduleDescription),
  time: boundedString(limits.scheduleTime),
  title: boundedString(limits.scheduleTitle),
});

export const inviteRsvpQuestionSchema = z.object({
  options: z.array(boundedString(limits.rsvpOption)).max(limits.rsvpOptionsMax),
  title: boundedString(limits.rsvpQuestionTitle),
  type: z.enum(["multiple", "single"]),
});

export const inviteStateSchema = inviteStateShapeSchema.extend({
  address: boundedString(limits.address),
  bride: boundedString(limits.bride),
  city: boundedString(limits.city),
  coverImageUrl: mediaUrlString(limits.mediaUrl),
  date: boundedString(limits.textDate),
  dressCode: boundedString(limits.dressCode),
  dressCodeColors: z.array(boundedString(limits.dressCodeColor)).max(limits.dressCodeColorsMax),
  groom: boundedString(limits.groom),
  lead: boundedString(limits.lead),
  mapUrl: boundedString(limits.mapUrl).optional(),
  musicTitle: boundedString(limits.musicTitle),
  musicUrl: mediaUrlString(limits.mediaUrl),
  paletteId: boundedString(limits.paletteId),
  portraitImageUrl: mediaUrlString(limits.mediaUrl),
  ringMetal: boundedString(limits.ringMetal),
  rsvpDate: boundedString(limits.rsvpDate),
  rsvpQuestions: z.array(inviteRsvpQuestionSchema).max(limits.rsvpQuestionsMax),
  rsvpText: boundedString(limits.rsvpText),
  schedule: z.array(inviteScheduleItemSchema).max(limits.scheduleItemMax),
  time: boundedString(limits.textTime),
  venue: boundedString(limits.venue),
  venueImageUrl: mediaUrlString(limits.mediaUrl),
});

export type InviteScheduleItem = z.infer<typeof inviteScheduleItemShapeSchema>;
export type InviteRsvpQuestion = z.infer<typeof inviteRsvpQuestionShapeSchema>;
export type InviteState = z.infer<typeof inviteStateShapeSchema>;
