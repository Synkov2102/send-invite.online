import { z } from "zod";
import { PROMO_CODE_MAX_LENGTH } from "../promo";

export const promoCodeInputSchema = z
  .string()
  .trim()
  .min(2, "Введите промокод.")
  .max(PROMO_CODE_MAX_LENGTH, "Слишком длинный промокод.");

export const promoPreviewBodySchema = z.object({
  promoCode: promoCodeInputSchema,
});

export const checkoutBodySchema = z.object({
  promoCode: promoCodeInputSchema.optional(),
  site: z.unknown().optional(),
  siteId: z.string().trim().min(1).optional(),
});

export type PromoPreviewBody = z.infer<typeof promoPreviewBodySchema>;
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

export function parsePromoPreviewBody(value: unknown) {
  const result = promoPreviewBodySchema.safeParse(value);

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Некорректный промокод.",
      ok: false as const,
    };
  }

  return { ok: true as const, payload: result.data };
}

export function parseCheckoutBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Некорректные данные заказа.", ok: false as const };
  }

  const record = value as Record<string, unknown>;
  const promoRaw = record.promoCode;
  const promoCode =
    typeof promoRaw === "string" && promoRaw.trim() ? promoRaw.trim() : undefined;
  const siteIdRaw = record.siteId;
  const siteId =
    typeof siteIdRaw === "string" && siteIdRaw.trim() ? siteIdRaw.trim() : undefined;

  if (promoCode !== undefined) {
    const promoResult = promoCodeInputSchema.safeParse(promoCode);

    if (!promoResult.success) {
      return {
        error: promoResult.error.issues[0]?.message ?? "Некорректный промокод.",
        ok: false as const,
      };
    }

    return {
      ok: true as const,
      payload: {
        promoCode: promoResult.data,
        site: record.site,
        siteId,
      },
    };
  }

  return {
    ok: true as const,
    payload: {
      promoCode: undefined as string | undefined,
      site: record.site,
      siteId,
    },
  };
}
