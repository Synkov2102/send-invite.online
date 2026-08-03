export {
  formatInviteSitePrice,
  formatRubPrice,
  formatRubPriceLabel,
  getListPromoPricing,
  INVITE_SITE_PRICE,
  INVITE_SITE_PRICE_RUB,
  INVITE_SITE_SERVICE_NAME,
} from "@invite/shared";
import type { SitePricing } from "@invite/shared";

export const seller = {
  city: "Санкт-Петербург",
  email: "Synkoveugeny@yandex.ru",
  fullName: "Сынков Евгений Алексеевич",
  inn: "780527120543",
} as const;

export function formatSellerLegalName() {
  return `Самозанятый ${seller.fullName}`;
}

export type InviteSitePricing = SitePricing;

/** Percent off vs. the struck-through price, or null when there is no active sale. */
export function getSaleDiscountPercent(pricing: InviteSitePricing): number | null {
  if (pricing.originalPriceRub === null || pricing.originalPriceRub <= pricing.currentPriceRub) {
    return null;
  }

  return Math.round((1 - pricing.currentPriceRub / pricing.originalPriceRub) * 100);
}
