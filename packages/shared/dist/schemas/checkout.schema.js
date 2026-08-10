"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBodySchema = exports.promoPreviewBodySchema = exports.receiptEmailSchema = exports.RECEIPT_EMAIL_MAX_LENGTH = exports.promoCodeInputSchema = void 0;
exports.parsePromoPreviewBody = parsePromoPreviewBody;
exports.parseCheckoutBody = parseCheckoutBody;
const zod_1 = require("zod");
const promo_1 = require("../promo");
exports.promoCodeInputSchema = zod_1.z
    .string()
    .trim()
    .min(2, "Введите промокод.")
    .max(promo_1.PROMO_CODE_MAX_LENGTH, "Слишком длинный промокод.");
exports.RECEIPT_EMAIL_MAX_LENGTH = 254;
/** Почта для фискального чека: нужна, когда в аккаунте её нет. */
exports.receiptEmailSchema = zod_1.z
    .string()
    .trim()
    .max(exports.RECEIPT_EMAIL_MAX_LENGTH, "Слишком длинный адрес.")
    .email("Проверьте адрес — похоже, в нём опечатка.");
exports.promoPreviewBodySchema = zod_1.z.object({
    promoCode: exports.promoCodeInputSchema,
});
exports.checkoutBodySchema = zod_1.z.object({
    email: exports.receiptEmailSchema.optional(),
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
    const readOptional = (raw) => typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
    const promoCode = readOptional(record.promoCode);
    const email = readOptional(record.email);
    const siteId = readOptional(record.siteId);
    if (promoCode !== undefined) {
        const promoResult = exports.promoCodeInputSchema.safeParse(promoCode);
        if (!promoResult.success) {
            return {
                error: promoResult.error.issues[0]?.message ?? "Некорректный промокод.",
                ok: false,
            };
        }
    }
    if (email !== undefined) {
        const emailResult = exports.receiptEmailSchema.safeParse(email);
        if (!emailResult.success) {
            return {
                error: emailResult.error.issues[0]?.message ?? "Некорректный email.",
                ok: false,
            };
        }
    }
    return {
        ok: true,
        payload: {
            email,
            promoCode,
            site: record.site,
            siteId,
        },
    };
}
