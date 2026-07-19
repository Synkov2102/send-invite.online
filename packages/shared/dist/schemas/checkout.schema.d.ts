import { z } from "zod";
export declare const promoCodeInputSchema: z.ZodString;
export declare const promoPreviewBodySchema: z.ZodObject<{
    promoCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    promoCode: string;
}, {
    promoCode: string;
}>;
export declare const checkoutBodySchema: z.ZodObject<{
    promoCode: z.ZodOptional<z.ZodString>;
    site: z.ZodOptional<z.ZodUnknown>;
    siteId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    promoCode?: string | undefined;
    site?: unknown;
    siteId?: string | undefined;
}, {
    promoCode?: string | undefined;
    site?: unknown;
    siteId?: string | undefined;
}>;
export type PromoPreviewBody = z.infer<typeof promoPreviewBodySchema>;
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
export declare function parsePromoPreviewBody(value: unknown): {
    error: string;
    ok: false;
    payload?: undefined;
} | {
    ok: true;
    payload: {
        promoCode: string;
    };
    error?: undefined;
};
export declare function parseCheckoutBody(value: unknown): {
    error: string;
    ok: false;
    payload?: undefined;
} | {
    ok: true;
    payload: {
        promoCode: string | undefined;
        site: unknown;
        siteId: string | undefined;
    };
    error?: undefined;
};
