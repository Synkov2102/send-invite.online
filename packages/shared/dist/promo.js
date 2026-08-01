"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMO_CODE_PATTERN = exports.PROMO_CODE_MAX_LENGTH = void 0;
exports.normalizePromoCode = normalizePromoCode;
exports.isValidPromoCodeFormat = isValidPromoCodeFormat;
exports.formatRubAmount = formatRubAmount;
exports.parseRubAmount = parseRubAmount;
exports.applyPromoDiscount = applyPromoDiscount;
exports.buildListPricing = buildListPricing;
exports.getListPromoPricing = getListPromoPricing;
exports.formatRubPriceLabel = formatRubPriceLabel;
const commerce_1 = require("./commerce");
exports.PROMO_CODE_MAX_LENGTH = 32;
exports.PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;
function normalizePromoCode(raw) {
    return raw.trim().toUpperCase();
}
function isValidPromoCodeFormat(code) {
    return exports.PROMO_CODE_PATTERN.test(code);
}
/** Formats a ruble amount as Robokassa-style "4000.00". */
function formatRubAmount(amountRub) {
    if (!Number.isFinite(amountRub) || amountRub < 0) {
        throw new Error("Invalid ruble amount.");
    }
    return amountRub.toFixed(2);
}
function parseRubAmount(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
        throw new Error("Invalid ruble amount string.");
    }
    return value;
}
function applyPromoDiscount(listPriceRub, type, value) {
    if (!Number.isFinite(listPriceRub) || listPriceRub < 0) {
        throw new Error("Invalid list price.");
    }
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Invalid promo value.");
    }
    let discountRub;
    if (type === "percent") {
        if (value > 100) {
            throw new Error("Percent discount cannot exceed 100.");
        }
        discountRub = (listPriceRub * value) / 100;
    }
    else {
        discountRub = value;
    }
    discountRub = Math.min(discountRub, listPriceRub);
    // Keep money math in kopecks to avoid float drift in signatures.
    const listKopeks = Math.round(listPriceRub * 100);
    const discountKopeks = Math.round(discountRub * 100);
    const amountKopeks = Math.max(0, listKopeks - discountKopeks);
    return {
        amount: formatRubAmount(amountKopeks / 100),
        discountAmount: formatRubAmount(discountKopeks / 100),
        originalAmount: formatRubAmount(listKopeks / 100),
    };
}
/** Pricing with no promo code applied, for an arbitrary (possibly discounted) list price. */
function buildListPricing(listPriceRub) {
    return {
        amount: formatRubAmount(listPriceRub),
        discountAmount: formatRubAmount(0),
        originalAmount: formatRubAmount(listPriceRub),
    };
}
function getListPromoPricing() {
    return buildListPricing(commerce_1.INVITE_SITE_PRICE_RUB);
}
function formatRubPriceLabel(amount) {
    const value = parseRubAmount(amount);
    return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
