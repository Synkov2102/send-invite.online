export {
  formatInviteSitePrice,
  formatRubPrice,
  formatRubPriceLabel,
  getListPromoPricing,
  INVITE_SITE_PRICE,
  INVITE_SITE_PRICE_RUB,
  INVITE_SITE_SERVICE_NAME,
} from "@invite/shared";

export const seller = {
  city: "Санкт-Петербург",
  email: "Synkoveugeny@yandex.ru",
  fullName: "Сынков Евгений Алексеевич",
  inn: "780527120543",
} as const;

export function formatSellerLegalName() {
  return `Самозанятый ${seller.fullName}`;
}
