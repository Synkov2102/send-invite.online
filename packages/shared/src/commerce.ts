export const INVITE_SITE_PRICE_RUB = 4_000;
export const INVITE_SITE_PRICE = "4000.00";
export const INVITE_SITE_SERVICE_NAME =
  "Создание и публикация сайта-приглашения";

export function formatInviteSitePrice() {
  return `${new Intl.NumberFormat("ru-RU").format(INVITE_SITE_PRICE_RUB)} ₽`;
}
