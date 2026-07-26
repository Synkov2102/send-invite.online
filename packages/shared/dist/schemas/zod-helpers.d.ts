import { z } from "zod";
export declare function boundedString(max: number): z.ZodString;
/** Link rendered as an `href` — only http(s) to keep `javascript:`/`data:` out. */
export declare function httpUrlString(max: number): z.ZodEffects<z.ZodString, string, string>;
export declare function mediaUrlString(max: number): z.ZodEffects<z.ZodString, string, string>;
export declare function createTypeGuard<TSchema extends z.ZodTypeAny>(schema: TSchema): (value: unknown) => value is z.infer<TSchema>;
