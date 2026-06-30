export const INVITE_FIELD_LIMITS = {
  address: 300,
  bride: 120,
  city: 120,
  dressCode: 500,
  dressCodeColor: 40,
  dressCodeColorsMax: 20,
  groom: 120,
  lead: 2000,
  mapUrl: 2048,
  mediaUrl: 2048,
  musicTitle: 120,
  paletteColor: 40,
  paletteId: 64,
  paletteLabel: 80,
  paletteMood: 120,
  rsvpDate: 40,
  rsvpOption: 100,
  rsvpOptionsMax: 20,
  rsvpQuestionTitle: 200,
  rsvpQuestionsMax: 20,
  rsvpText: 2000,
  ringMetal: 80,
  scheduleDescription: 500,
  scheduleItemMax: 30,
  scheduleTime: 20,
  scheduleTitle: 120,
  templateId: 64,
  textDate: 40,
  textTime: 20,
  venue: 200,
} as const;

function isWithinLimit(value: string, max: number) {
  return value.length <= max;
}

function isStringArrayWithinLimit(value: unknown, maxItems: number, maxItemLength: number) {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every((item) => typeof item === "string" && isWithinLimit(item, maxItemLength))
  );
}

export function validateInviteFieldLimits(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return "Некорректные данные приглашения.";
  }

  const invite = value as Record<string, unknown>;
  const limits = INVITE_FIELD_LIMITS;

  const stringChecks: Array<[string, number]> = [
    ["address", limits.address],
    ["bride", limits.bride],
    ["city", limits.city],
    ["coverImageUrl", limits.mediaUrl],
    ["date", limits.textDate],
    ["dressCode", limits.dressCode],
    ["groom", limits.groom],
    ["lead", limits.lead],
    ["musicTitle", limits.musicTitle],
    ["musicUrl", limits.mediaUrl],
    ["paletteId", limits.paletteId],
    ["portraitImageUrl", limits.mediaUrl],
    ["ringMetal", limits.ringMetal],
    ["rsvpDate", limits.rsvpDate],
    ["rsvpText", limits.rsvpText],
    ["time", limits.textTime],
    ["venue", limits.venue],
    ["venueImageUrl", limits.mediaUrl],
  ];

  for (const [field, max] of stringChecks) {
    if (typeof invite[field] !== "string" || !isWithinLimit(invite[field], max)) {
      return "Слишком длинные или некорректные данные приглашения.";
    }
  }

  if (
    invite.mapUrl !== undefined &&
    (typeof invite.mapUrl !== "string" || !isWithinLimit(invite.mapUrl, limits.mapUrl))
  ) {
    return "Ссылка на Яндекс Карты слишком длинная или некорректная.";
  }

  if (!isStringArrayWithinLimit(invite.dressCodeColors, limits.dressCodeColorsMax, limits.dressCodeColor)) {
    return "Слишком длинные или некорректные цвета дресс-кода.";
  }

  if (!Array.isArray(invite.schedule) || invite.schedule.length > limits.scheduleItemMax) {
    return "Слишком длинное расписание.";
  }

  for (const item of invite.schedule) {
    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item) ||
      typeof item.description !== "string" ||
      !isWithinLimit(item.description, limits.scheduleDescription) ||
      typeof item.time !== "string" ||
      !isWithinLimit(item.time, limits.scheduleTime) ||
      typeof item.title !== "string" ||
      !isWithinLimit(item.title, limits.scheduleTitle)
    ) {
      return "Слишком длинные или некорректные пункты расписания.";
    }
  }

  if (!Array.isArray(invite.rsvpQuestions) || invite.rsvpQuestions.length > limits.rsvpQuestionsMax) {
    return "Слишком много вопросов RSVP.";
  }

  for (const question of invite.rsvpQuestions) {
    if (
      typeof question !== "object" ||
      question === null ||
      Array.isArray(question) ||
      typeof question.title !== "string" ||
      !isWithinLimit(question.title, limits.rsvpQuestionTitle) ||
      (question.type !== "multiple" && question.type !== "single") ||
      !isStringArrayWithinLimit(question.options, limits.rsvpOptionsMax, limits.rsvpOption)
    ) {
      return "Слишком длинные или некорректные вопросы RSVP.";
    }
  }

  return null;
}

export function validatePaletteFieldLimits(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return "Некорректная палитра.";
  }

  const palette = value as Record<string, unknown>;
  const limits = INVITE_FIELD_LIMITS;
  const stringChecks: Array<[string, number]> = [
    ["accent", limits.paletteColor],
    ["background", limits.paletteColor],
    ["id", limits.paletteId],
    ["ink", limits.paletteColor],
    ["label", limits.paletteLabel],
    ["line", limits.paletteColor],
    ["mood", limits.paletteMood],
    ["muted", limits.paletteColor],
    ["photoText", limits.paletteColor],
    ["surface", limits.paletteColor],
    ["veil", limits.paletteColor],
  ];

  for (const [field, max] of stringChecks) {
    if (typeof palette[field] !== "string" || !isWithinLimit(palette[field], max)) {
      return "Слишком длинные или некорректные данные палитры.";
    }
  }

  return null;
}
