import { INVITE_SITE_PRICE_RUB } from "./commerce";

export const PROMO_CODE_MAX_LENGTH = 32;
export const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

export type PromoDiscountType = "percent" | "fixed";

export type PromoPricing = {
  amount: string;
  discountAmount: string;
  originalAmount: string;
};

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isValidPromoCodeFormat(code: string): boolean {
  return PROMO_CODE_PATTERN.test(code);
}

/** Formats a ruble amount as Robokassa-style "4000.00". */
export function formatRubAmount(amountRub: number): string {
  if (!Number.isFinite(amountRub) || amountRub < 0) {
    throw new Error("Invalid ruble amount.");
  }

  return amountRub.toFixed(2);
}

export function parseRubAmount(amount: string): number {
  const value = Number(amount);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid ruble amount string.");
  }

  return value;
}

export function applyPromoDiscount(
  listPriceRub: number,
  type: PromoDiscountType,
  value: number,
): PromoPricing {
  if (!Number.isFinite(listPriceRub) || listPriceRub < 0) {
    throw new Error("Invalid list price.");
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid promo value.");
  }

  let discountRub: number;

  if (type === "percent") {
    if (value > 100) {
      throw new Error("Percent discount cannot exceed 100.");
    }

    discountRub = (listPriceRub * value) / 100;
  } else {
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

export function getListPromoPricing(): PromoPricing {
  return {
    amount: formatRubAmount(INVITE_SITE_PRICE_RUB),
    discountAmount: formatRubAmount(0),
    originalAmount: formatRubAmount(INVITE_SITE_PRICE_RUB),
  };
}

export function formatRubPriceLabel(amount: string): string {
  const value = parseRubAmount(amount);
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
