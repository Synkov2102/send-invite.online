export type PromoPreviewResult = {
  amount: string;
  discountAmount: string;
  error?: string;
  originalAmount: string;
  promoCode: string;
};

export type CheckoutOrder = {
  amount: string;
  discountAmount?: string;
  id: string;
  originalAmount?: string;
  promoCode?: string | null;
  siteId: string;
  siteUrl?: string | null;
  status: "pending" | "paid" | "cancelled";
};

export type CheckoutResult = {
  action?: string;
  error?: string;
  fields?: Record<string, string>;
  free?: boolean;
  order?: CheckoutOrder;
};

export async function previewPromoCode(promoCode: string) {
  const response = await fetch("/api/payments/promo/preview", {
    body: JSON.stringify({ promoCode }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = (await response.json()) as PromoPreviewResult & { error?: string };

  return {
    ok: response.ok && typeof result.amount === "string" && typeof result.promoCode === "string",
    result,
    status: response.status,
  };
}
