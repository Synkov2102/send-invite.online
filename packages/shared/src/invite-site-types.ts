import type { InviteState } from "./invite-state";
import {
  validateInviteFieldLimits,
  validatePaletteFieldLimits,
} from "./invite-field-limits";

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

type ParsedPayload =
  | { ok: true; payload: CreateInviteSitePayload }
  | { error: string; ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSchedule(value: unknown): value is InviteState["schedule"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.description === "string" &&
        typeof item.time === "string" &&
        typeof item.title === "string",
    )
  );
}

function isRsvpQuestions(value: unknown): value is InviteState["rsvpQuestions"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.title === "string" &&
        (item.type === "multiple" || item.type === "single") &&
        isStringArray(item.options),
    )
  );
}

export function isInviteState(value: unknown): value is InviteState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.address === "string" &&
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
    typeof value.venueImageUrl === "string"
  );
}

export function isInviteSitePalette(value: unknown): value is InviteSitePalette {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accent === "string" &&
    typeof value.background === "string" &&
    typeof value.id === "string" &&
    typeof value.ink === "string" &&
    typeof value.label === "string" &&
    typeof value.line === "string" &&
    typeof value.mood === "string" &&
    typeof value.muted === "string" &&
    typeof value.photoText === "string" &&
    typeof value.surface === "string" &&
    typeof value.veil === "string"
  );
}

export function isPublishedInviteSite(value: unknown): value is PublishedInviteSite {
  return (
    isRecord(value) &&
    typeof value.createdAt === "string" &&
    typeof value.id === "string" &&
    typeof value.templateId === "string" &&
    typeof value.updatedAt === "string" &&
    isInviteState(value.invite) &&
    isInviteSitePalette(value.palette)
  );
}

export function parseCreateInviteSitePayload(value: unknown): ParsedPayload {
  if (!isRecord(value)) {
    return { error: "Некорректные данные сайта.", ok: false };
  }

  if (
    typeof value.templateId !== "string" ||
    value.templateId.trim().length === 0 ||
    value.templateId.trim().length > 64
  ) {
    return { error: "Неизвестный шаблон приглашения.", ok: false };
  }

  if (!isInviteState(value.invite)) {
    return { error: "Не удалось прочитать данные приглашения.", ok: false };
  }

  const inviteLimitError = validateInviteFieldLimits(value.invite);

  if (inviteLimitError) {
    return { error: inviteLimitError, ok: false };
  }

  if (!isInviteSitePalette(value.palette)) {
    return { error: "Не удалось прочитать палитру приглашения.", ok: false };
  }

  const paletteLimitError = validatePaletteFieldLimits(value.palette);

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
