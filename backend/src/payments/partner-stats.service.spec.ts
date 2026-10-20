import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PartnerStatsService } from "./partner-stats.service";
import { PaymentOrderStore } from "./payment-order.store";
import { PromoCodeStore, type PromoCode } from "./promo-code.store";

function makePromo(overrides: Partial<PromoCode> = {}): PromoCode {
  return {
    code: "PARTNER10",
    createdAt: "2026-01-01T00:00:00.000Z",
    expiresAt: null,
    id: "promo-1",
    isActive: true,
    maxUses: null,
    maxUsesPerUser: 1,
    note: null,
    partnerUserId: "partner-1",
    startsAt: null,
    type: "percent",
    updatedAt: "2026-01-01T00:00:00.000Z",
    usedCount: 0,
    value: 10,
    ...overrides,
  };
}

// 2026-10-09 12:00 МСК
const NOW = new Date("2026-10-09T09:00:00.000Z");

describe("PartnerStatsService", () => {
  let service: PartnerStatsService;
  let promoCodes: { getByIdForPartner: jest.Mock; listByPartner: jest.Mock };
  let orders: { listPaidAtForPromo: jest.Mock };

  beforeEach(async () => {
    promoCodes = {
      getByIdForPartner: jest.fn().mockResolvedValue(makePromo()),
      listByPartner: jest.fn().mockResolvedValue([]),
    };
    orders = { listPaidAtForPromo: jest.fn().mockResolvedValue([]) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PartnerStatsService,
        { provide: PromoCodeStore, useValue: promoCodes },
        { provide: PaymentOrderStore, useValue: orders },
      ],
    }).compile();

    service = moduleRef.get(PartnerStatsService);
  });

  describe("listCodes", () => {
    it("returns only public fields and remaining instead of usedCount", async () => {
      promoCodes.listByPartner.mockResolvedValue([
        makePromo({ maxUses: 50, usedCount: 12, note: "секретная заметка" }),
        makePromo({ code: "NOLIMIT", id: "promo-2", maxUses: null }),
      ]);

      const result = await service.listCodes("partner-1");

      expect(promoCodes.listByPartner).toHaveBeenCalledWith("partner-1");
      expect(result.codes).toEqual([
        {
          code: "PARTNER10",
          expiresAt: null,
          id: "promo-1",
          isActive: true,
          remaining: 38,
          startsAt: null,
        },
        {
          code: "NOLIMIT",
          expiresAt: null,
          id: "promo-2",
          isActive: true,
          remaining: null,
          startsAt: null,
        },
      ]);
    });

    it("never reports negative remaining", async () => {
      promoCodes.listByPartner.mockResolvedValue([makePromo({ maxUses: 5, usedCount: 7 })]);

      const result = await service.listCodes("partner-1");

      expect(result.codes[0]?.remaining).toBe(0);
    });
  });

  describe("getStats", () => {
    it("defaults to the last 30 Moscow days and fills empty days with zeros", async () => {
      const result = await service.getStats("partner-1", "promo-1", {}, NOW);

      expect(result.from).toBe("2026-09-10");
      expect(result.to).toBe("2026-10-09");
      expect(result.daily).toHaveLength(30);
      expect(result.daily.every((day) => day.count === 0)).toBe(true);
      expect(result.total).toBe(0);
    });

    it("queries paid orders by Moscow day boundaries converted to UTC", async () => {
      await service.getStats("partner-1", "promo-1", { from: "2026-10-01", to: "2026-10-07" }, NOW);

      expect(orders.listPaidAtForPromo).toHaveBeenCalledWith(
        "promo-1",
        "2026-09-30T21:00:00.000Z",
        "2026-10-07T21:00:00.000Z",
      );
    });

    it("buckets payments by Moscow day: 21:30 UTC counts towards the next day", async () => {
      orders.listPaidAtForPromo.mockResolvedValue([
        "2026-10-01T10:00:00.000Z",
        "2026-10-01T21:30:00.000Z",
        "2026-10-02T05:00:00.000Z",
      ]);

      const result = await service.getStats(
        "partner-1",
        "promo-1",
        { from: "2026-10-01", to: "2026-10-03" },
        NOW,
      );

      expect(result.daily).toEqual([
        { count: 1, date: "2026-10-01" },
        { count: 2, date: "2026-10-02" },
        { count: 0, date: "2026-10-03" },
      ]);
      expect(result.total).toBe(3);
    });

    it("looks the code up scoped to the partner", async () => {
      await service.getStats("partner-1", "promo-1", {}, NOW);

      expect(promoCodes.getByIdForPartner).toHaveBeenCalledWith("promo-1", "partner-1");
    });

    it("answers 404 for a code of another partner or a missing one", async () => {
      promoCodes.getByIdForPartner.mockResolvedValue(null);

      await expect(service.getStats("partner-2", "promo-1", {}, NOW)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(orders.listPaidAtForPromo).not.toHaveBeenCalled();
    });

    it.each([
      [{ from: "2026-10-05", to: "2026-10-01" }],
      [{ from: "2025-01-01", to: "2026-10-01" }],
      [{ from: "2026-02-31" }],
      [{ to: "09.10.2026" }],
    ])("rejects invalid period %j", async (query) => {
      await expect(service.getStats("partner-1", "promo-1", query, NOW)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(orders.listPaidAtForPromo).not.toHaveBeenCalled();
    });

    it("accepts a full 365-day period", async () => {
      const result = await service.getStats(
        "partner-1",
        "promo-1",
        { from: "2025-10-10", to: "2026-10-09" },
        NOW,
      );

      expect(result.daily).toHaveLength(365);
    });
  });
});
