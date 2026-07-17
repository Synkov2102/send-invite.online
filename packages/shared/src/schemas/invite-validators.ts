import type { ZodError } from "zod";
import { createTypeGuard } from "./zod-helpers";
import { inviteSitePaletteSchema, inviteSitePaletteShapeSchema } from "./invite-palette.schema";
import {
  createInviteSitePayloadSchema,
  createInviteSitePayloadShapeSchema,
  publishedInviteSiteSchema,
  publishedInviteSiteShapeSchema,
} from "./invite-site.schema";
import { inviteStateSchema, inviteStateShapeSchema } from "./invite-state.schema";

export const isInviteState = createTypeGuard(inviteStateShapeSchema);
export const isInviteSitePalette = createTypeGuard(inviteSitePaletteShapeSchema);
export const isPublishedInviteSite = createTypeGuard(publishedInviteSiteShapeSchema);

/** Fill defaults for invites saved before newer optional fields existed. */
export function normalizeInviteState(
  invite: import("./invite-state.schema").InviteState,
): import("./invite-state.schema").InviteState {
  return inviteStateShapeSchema.parse(invite);
}

type ParsedPayload =
  | { ok: true; payload: import("./invite-site.schema").CreateInviteSitePayload }
  | { error: string; ok: false };

function getIssuePath(error: ZodError) {
  return error.issues[0]?.path.map(String).join(".") ?? "";
}

function mapInviteLimitError(error: ZodError) {
  const path = getIssuePath(error);

  if (path === "mapUrl") {
    return "Ссылка на Яндекс Карты слишком длинная или некорректная.";
  }

  if (path === "groupChatUrl") {
    return "Ссылка на общий чат слишком длинная.";
  }

  if (path === "groupChatText" || path === "additionalInfo") {
    return "Слишком длинный текст дополнительного блока.";
  }

  if (path.startsWith("dressCodeColors")) {
    return "Слишком длинные или некорректные цвета дресс-кода.";
  }

  if (path.startsWith("schedule")) {
    return path === "schedule"
      ? "Слишком длинное расписание."
      : "Слишком длинные или некорректные пункты расписания.";
  }

  if (path.startsWith("rsvpQuestions")) {
    return path === "rsvpQuestions"
      ? "Слишком много вопросов RSVP."
      : "Слишком длинные или некорректные вопросы RSVP.";
  }

  return "Слишком длинные или некорректные данные приглашения.";
}

function mapPaletteLimitError() {
  return "Слишком длинные или некорректные данные палитры.";
}

export function parseCreateInviteSitePayload(value: unknown): ParsedPayload {
  const shapeResult = createInviteSitePayloadShapeSchema.safeParse(value);

  if (!shapeResult.success) {
    const path = getIssuePath(shapeResult.error);

    if (path === "templateId") {
      return { error: "Неизвестный шаблон приглашения.", ok: false };
    }

    if (path.startsWith("invite")) {
      return { error: "Не удалось прочитать данные приглашения.", ok: false };
    }

    if (path.startsWith("palette")) {
      return { error: "Не удалось прочитать палитру приглашения.", ok: false };
    }

    return { error: "Некорректные данные сайта.", ok: false };
  }

  const inviteLimits = inviteStateSchema.safeParse(shapeResult.data.invite);

  if (!inviteLimits.success) {
    return { error: mapInviteLimitError(inviteLimits.error), ok: false };
  }

  const paletteLimits = inviteSitePaletteSchema.safeParse(shapeResult.data.palette);

  if (!paletteLimits.success) {
    return { error: mapPaletteLimitError(), ok: false };
  }

  const strictResult = createInviteSitePayloadSchema.safeParse(value);

  if (!strictResult.success) {
    const path = getIssuePath(strictResult.error);

    if (path === "templateId") {
      return { error: "Неизвестный шаблон приглашения.", ok: false };
    }

    if (path.startsWith("invite")) {
      return { error: mapInviteLimitError(strictResult.error), ok: false };
    }

    if (path.startsWith("palette")) {
      return { error: mapPaletteLimitError(), ok: false };
    }

    return { error: "Некорректные данные сайта.", ok: false };
  }

  return {
    ok: true,
    payload: strictResult.data,
  };
}

export function validateInviteFieldLimits(value: unknown): string | null {
  const result = inviteStateSchema.safeParse(value);

  return result.success ? null : mapInviteLimitError(result.error);
}

export function validatePaletteFieldLimits(value: unknown): string | null {
  const result = inviteSitePaletteSchema.safeParse(value);

  return result.success ? null : mapPaletteLimitError();
}

export {
  createInviteSitePayloadSchema,
  createInviteSitePayloadShapeSchema,
  publishedInviteSiteSchema,
  publishedInviteSiteShapeSchema,
};
