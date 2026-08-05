import { z } from "zod";
import { createTypeGuard } from "./zod-helpers";

/** Wire shape of `GET /api/payments/pricing`, shared by the store and every page that shows a price. */
export const sitePricingSchema = z.object({
  currentPriceRub: z.number().positive(),
  originalPriceRub: z.number().positive().nullable(),
});

export type SitePricing = z.infer<typeof sitePricingSchema>;

export const isSitePricing = createTypeGuard(sitePricingSchema);
