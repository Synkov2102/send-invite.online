import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  listIsoDays,
  moscowDayStartIso,
  parsePartnerStatsQuery,
  shiftIsoDay,
  toMoscowIsoDay,
  type PartnerPromoCode,
  type PartnerPromoStats,
} from "@invite/shared";
import { PaymentOrderStore } from "./payment-order.store";
import { PromoCodeStore, type PromoCode } from "./promo-code.store";

function toPartnerPromoCode(promo: PromoCode): PartnerPromoCode {
  return {
    code: promo.code,
    expiresAt: promo.expiresAt,
    id: promo.id,
    isActive: promo.isActive,
    // usedCount включает брони pending-заказов — партнёру показываем только остаток.
    remaining: promo.maxUses === null ? null : Math.max(0, promo.maxUses - promo.usedCount),
    startsAt: promo.startsAt,
  };
}

@Injectable()
export class PartnerStatsService {
  constructor(
    private readonly promoCodes: PromoCodeStore,
    private readonly orders: PaymentOrderStore,
  ) {}

  async listCodes(userId: string) {
    const codes = await this.promoCodes.listByPartner(userId);
    return { codes: codes.map(toPartnerPromoCode) };
  }

  /** Использование = оплаченный заказ с кодом. Возвраты после оплаты не вычитаются. */
  async getStats(
    userId: string,
    promoId: string,
    query: unknown,
    now = new Date(),
  ): Promise<PartnerPromoStats> {
    const parsed = parsePartnerStatsQuery(query, toMoscowIsoDay(now));

    if (!parsed.ok) {
      throw new BadRequestException({ error: parsed.error });
    }

    const promo = await this.promoCodes.getByIdForPartner(promoId, userId);

    if (!promo) {
      throw new NotFoundException({ error: "Промокод не найден." });
    }

    const { from, to } = parsed.range;
    const paidAt = await this.orders.listPaidAtForPromo(
      promo.id,
      moscowDayStartIso(from),
      moscowDayStartIso(shiftIsoDay(to, 1)),
    );
    const counts = new Map<string, number>();

    for (const value of paidAt) {
      const day = toMoscowIsoDay(new Date(value));
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    return {
      daily: listIsoDays(from, to).map((date) => ({ count: counts.get(date) ?? 0, date })),
      from,
      to,
      total: paidAt.length,
    };
  }
}
