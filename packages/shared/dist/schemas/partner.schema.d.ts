import { z } from "zod";
export declare const PARTNER_STATS_DEFAULT_DAYS = 30;
export declare const PARTNER_STATS_MAX_DAYS = 365;
export declare function shiftIsoDay(day: string, days: number): string;
/** День YYYY-MM-DD по московскому времени — так партнёру считаются сутки. */
export declare function toMoscowIsoDay(date: Date): string;
/** Начало московских суток `day` в UTC ISO. */
export declare function moscowDayStartIso(day: string): string;
/** Все дни от `from` до `to` включительно. */
export declare function listIsoDays(from: string, to: string): string[];
export declare const partnerStatsQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    to: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    from?: string | undefined;
    to?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
}>;
export type PartnerStatsQuery = z.infer<typeof partnerStatsQuerySchema>;
/**
 * Без границ — последние 30 дней по `today` (день по МСК, его считает вызывающий).
 */
export declare function parsePartnerStatsQuery(value: unknown, today: string): {
    error: string;
    ok: false;
    range?: undefined;
} | {
    ok: true;
    range: {
        from: string;
        to: string;
    };
    error?: undefined;
};
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
    daily: {
        count: number;
        date: string;
    }[];
    from: string;
    to: string;
    total: number;
};
