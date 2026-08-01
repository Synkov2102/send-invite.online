export const INVITE_SITE_PRICE_RUB = 4_000;
export const INVITE_SITE_PRICE = "4000.00";
export const INVITE_SITE_SERVICE_NAME =
  "Создание и публикация сайта-приглашения";

export function formatRubPrice(amountRub: number) {
  return `${new Intl.NumberFormat("ru-RU").format(amountRub)} ₽`;
}

export function formatInviteSitePrice() {
  return formatRubPrice(INVITE_SITE_PRICE_RUB);
}
