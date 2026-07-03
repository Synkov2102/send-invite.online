"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVITE_SITE_SERVICE_NAME = exports.INVITE_SITE_PRICE = exports.INVITE_SITE_PRICE_RUB = void 0;
exports.formatInviteSitePrice = formatInviteSitePrice;
exports.INVITE_SITE_PRICE_RUB = 4_000;
exports.INVITE_SITE_PRICE = "4000.00";
exports.INVITE_SITE_SERVICE_NAME = "Создание и публикация сайта-приглашения";
function formatInviteSitePrice() {
    return `${new Intl.NumberFormat("ru-RU").format(exports.INVITE_SITE_PRICE_RUB)} ₽`;
}
