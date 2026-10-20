"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerStatsQuerySchema = exports.PARTNER_STATS_MAX_DAYS = exports.PARTNER_STATS_DEFAULT_DAYS = void 0;
exports.shiftIsoDay = shiftIsoDay;
exports.toMoscowIsoDay = toMoscowIsoDay;
exports.moscowDayStartIso = moscowDayStartIso;
exports.listIsoDays = listIsoDays;
exports.parsePartnerStatsQuery = parsePartnerStatsQuery;
const zod_1 = require("zod");
exports.PARTNER_STATS_DEFAULT_DAYS = 30;
exports.PARTNER_STATS_MAX_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;
// В Москве нет перехода на летнее время с 2014 года — смещение постоянное.
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;
function isoDayToMs(day) {
    return Date.parse(`${day}T00:00:00.000Z`);
}
function shiftIsoDay(day, days) {
    return new Date(isoDayToMs(day) + days * DAY_MS).toISOString().slice(0, 10);
}
/** День YYYY-MM-DD по московскому времени — так партнёру считаются сутки. */
function toMoscowIsoDay(date) {
    return new Date(date.getTime() + MOSCOW_OFFSET_MS).toISOString().slice(0, 10);
}
/** Начало московских суток `day` в UTC ISO. */
function moscowDayStartIso(day) {
    return new Date(isoDayToMs(day) - MOSCOW_OFFSET_MS).toISOString();
}
/** Все дни от `from` до `to` включительно. */
function listIsoDays(from, to) {
    const days = [];
    for (let day = from; day <= to; day = shiftIsoDay(day, 1)) {
        days.push(day);
    }
    return days;
}
const isoDaySchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате ГГГГ-ММ-ДД.")
    // 2026-02-31 проходит regex, но Date сдвигает его на март.
    .refine((value) => {
    const ms = isoDayToMs(value);
    return !Number.isNaN(ms) && new Date(ms).toISOString().startsWith(value);
}, "Некорректная дата.");
exports.partnerStatsQuerySchema = zod_1.z.object({
    from: isoDaySchema.optional(),
    to: isoDaySchema.optional(),
});
/**
 * Без границ — последние 30 дней по `today` (день по МСК, его считает вызывающий).
 */
function parsePartnerStatsQuery(value, today) {
    const result = exports.partnerStatsQuerySchema.safeParse(value ?? {});
    if (!result.success) {
        return {
            error: result.error.issues[0]?.message ?? "Некорректный период.",
            ok: false,
        };
    }
    const to = result.data.to ?? today;
    const from = result.data.from ?? shiftIsoDay(to, -(exports.PARTNER_STATS_DEFAULT_DAYS - 1));
    if (from > to) {
        return { error: "Начало периода позже его конца.", ok: false };
    }
    if ((isoDayToMs(to) - isoDayToMs(from)) / DAY_MS + 1 > exports.PARTNER_STATS_MAX_DAYS) {
        return {
            error: `Период не может быть длиннее ${exports.PARTNER_STATS_MAX_DAYS} дней.`,
            ok: false,
        };
    }
    return { ok: true, range: { from, to } };
}
