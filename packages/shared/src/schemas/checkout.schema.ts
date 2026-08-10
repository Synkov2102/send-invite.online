import { z } from "zod";
import { PROMO_CODE_MAX_LENGTH } from "../promo";

export const promoCodeInputSchema = z
  .string()
  .trim()
  .min(2, "Введите промокод.")
  .max(PROMO_CODE_MAX_LENGTH, "Слишком длинный промокод.");

export const RECEIPT_EMAIL_MAX_LENGTH = 254;

/** Почта для фискального чека: нужна, когда в аккаунте её нет. */
export const receiptEmailSchema = z
  .string()
  .trim()
  .max(RECEIPT_EMAIL_MAX_LENGTH, "Слишком длинный адрес.")
  .email("Проверьте адрес — похоже, в нём опечатка.");

export const promoPreviewBodySchema = z.object({
  promoCode: promoCodeInputSchema,
});

export const checkoutBodySchema = z.object({
  email: receiptEmailSchema.optional(),
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
  const readOptional = (raw: unknown) =>
    typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
  const promoCode = readOptional(record.promoCode);
  const email = readOptional(record.email);
  const siteId = readOptional(record.siteId);

  if (promoCode !== undefined) {
    const promoResult = promoCodeInputSchema.safeParse(promoCode);

    if (!promoResult.success) {
      return {
        error: promoResult.error.issues[0]?.message ?? "Некорректный промокод.",
        ok: false as const,
      };
    }
  }

  if (email !== undefined) {
    const emailResult = receiptEmailSchema.safeParse(email);

    if (!emailResult.success) {
      return {
        error: emailResult.error.issues[0]?.message ?? "Некорректный email.",
        ok: false as const,
      };
    }
  }

  return {
    ok: true as const,
    payload: {
      email,
      promoCode,
      site: record.site,
      siteId,
    },
  };
}
