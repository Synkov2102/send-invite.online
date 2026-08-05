import { z } from "zod";
/** Wire shape of `GET /api/payments/pricing`, shared by the store and every page that shows a price. */
export declare const sitePricingSchema: z.ZodObject<{
    currentPriceRub: z.ZodNumber;
    originalPriceRub: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currentPriceRub: number;
    originalPriceRub: number | null;
}, {
    currentPriceRub: number;
    originalPriceRub: number | null;
}>;
export type SitePricing = z.infer<typeof sitePricingSchema>;
export declare const isSitePricing: (value: unknown) => value is {
    currentPriceRub: number;
    originalPriceRub: number | null;
};
