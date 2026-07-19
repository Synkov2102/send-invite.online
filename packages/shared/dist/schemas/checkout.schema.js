"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBodySchema = exports.promoPreviewBodySchema = exports.promoCodeInputSchema = void 0;
exports.parsePromoPreviewBody = parsePromoPreviewBody;
exports.parseCheckoutBody = parseCheckoutBody;
const zod_1 = require("zod");
const promo_1 = require("../promo");
exports.promoCodeInputSchema = zod_1.z
    .string()
    .trim()
    .min(2, "Введите промокод.")
    .max(promo_1.PROMO_CODE_MAX_LENGTH, "Слишком длинный промокод.");
exports.promoPreviewBodySchema = zod_1.z.object({
    promoCode: exports.promoCodeInputSchema,
});
exports.checkoutBodySchema = zod_1.z.object({
    promoCode: exports.promoCodeInputSchema.optional(),
    site: zod_1.z.unknown().optional(),
    siteId: zod_1.z.string().trim().min(1).optional(),
});
function parsePromoPreviewBody(value) {
    const result = exports.promoPreviewBodySchema.safeParse(value);
    if (!result.success) {
        return {
            error: result.error.issues[0]?.message ?? "Некорректный промокод.",
            ok: false,
        };
    }
    return { ok: true, payload: result.data };
}
function parseCheckoutBody(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { error: "Некорректные данные заказа.", ok: false };
    }
    const record = value;
    const promoRaw = record.promoCode;
    const promoCode = typeof promoRaw === "string" && promoRaw.trim() ? promoRaw.trim() : undefined;
    const siteIdRaw = record.siteId;
    const siteId = typeof siteIdRaw === "string" && siteIdRaw.trim() ? siteIdRaw.trim() : undefined;
    if (promoCode !== undefined) {
        const promoResult = exports.promoCodeInputSchema.safeParse(promoCode);
        if (!promoResult.success) {
            return {
                error: promoResult.error.issues[0]?.message ?? "Некорректный промокод.",
                ok: false,
            };
        }
        return {
            ok: true,
            payload: {
                promoCode: promoResult.data,
                site: record.site,
                siteId,
            },
        };
    }
    return {
        ok: true,
        payload: {
            promoCode: undefined,
            site: record.site,
            siteId,
        },
    };
}
