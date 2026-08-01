export declare const PROMO_CODE_MAX_LENGTH = 32;
export declare const PROMO_CODE_PATTERN: RegExp;
export type PromoDiscountType = "percent" | "fixed";
export type PromoPricing = {
    amount: string;
    discountAmount: string;
    originalAmount: string;
};
export declare function normalizePromoCode(raw: string): string;
export declare function isValidPromoCodeFormat(code: string): boolean;
/** Formats a ruble amount as Robokassa-style "4000.00". */
export declare function formatRubAmount(amountRub: number): string;
export declare function parseRubAmount(amount: string): number;
export declare function applyPromoDiscount(listPriceRub: number, type: PromoDiscountType, value: number): PromoPricing;
/** Pricing with no promo code applied, for an arbitrary (possibly discounted) list price. */
export declare function buildListPricing(listPriceRub: number): PromoPricing;
export declare function getListPromoPricing(): PromoPricing;
export declare function formatRubPriceLabel(amount: string): string;
