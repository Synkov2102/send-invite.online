import { z } from "zod";

export const PARTNER_STATS_DEFAULT_DAYS = 30;
export const PARTNER_STATS_MAX_DAYS = 365;

const DAY_MS = 24 * 60 * 60 * 1000;
// В Москве нет перехода на летнее время с 2014 года — смещение постоянное.
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;

function isoDayToMs(day: string) {
  return Date.parse(`${day}T00:00:00.000Z`);
}

export function shiftIsoDay(day: string, days: number) {
  return new Date(isoDayToMs(day) + days * DAY_MS).toISOString().slice(0, 10);
}

/** День YYYY-MM-DD по московскому времени — так партнёру считаются сутки. */
export function toMoscowIsoDay(date: Date) {
  return new Date(date.getTime() + MOSCOW_OFFSET_MS).toISOString().slice(0, 10);
}

/** Начало московских суток `day` в UTC ISO. */
export function moscowDayStartIso(day: string) {
  return new Date(isoDayToMs(day) - MOSCOW_OFFSET_MS).toISOString();
}

/** Все дни от `from` до `to` включительно. */
export function listIsoDays(from: string, to: string) {
  const days: string[] = [];

  for (let day = from; day <= to; day = shiftIsoDay(day, 1)) {
    days.push(day);
  }

  return days;
}

const isoDaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате ГГГГ-ММ-ДД.")
  // 2026-02-31 проходит regex, но Date сдвигает его на март.
  .refine((value) => {
    const ms = isoDayToMs(value);
    return !Number.isNaN(ms) && new Date(ms).toISOString().startsWith(value);
  }, "Некорректная дата.");

export const partnerStatsQuerySchema = z.object({
  from: isoDaySchema.optional(),
  to: isoDaySchema.optional(),
});

export type PartnerStatsQuery = z.infer<typeof partnerStatsQuerySchema>;

/**
 * Без границ — последние 30 дней по `today` (день по МСК, его считает вызывающий).
 */
export function parsePartnerStatsQuery(value: unknown, today: string) {
  const result = partnerStatsQuerySchema.safeParse(value ?? {});

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Некорректный период.",
      ok: false as const,
    };
  }

  const to = result.data.to ?? today;
  const from = result.data.from ?? shiftIsoDay(to, -(PARTNER_STATS_DEFAULT_DAYS - 1));

  if (from > to) {
    return { error: "Начало периода позже его конца.", ok: false as const };
  }

  if ((isoDayToMs(to) - isoDayToMs(from)) / DAY_MS + 1 > PARTNER_STATS_MAX_DAYS) {
    return {
      error: `Период не может быть длиннее ${PARTNER_STATS_MAX_DAYS} дней.`,
      ok: false as const,
    };
  }

  return { ok: true as const, range: { from, to } };
}

export type PartnerPromoCode = {
  code: string;
  expiresAt: string | null;
  id: string;
  isActive: boolean;
  /** null — у кода нет общего лимита. */
  remaining: number | null;
  startsAt: string | null;
};

export type PartnerPromoStats = {
  daily: { count: number; date: string }[];
  from: string;
  to: string;
  total: number;
};
