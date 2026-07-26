import { z } from "zod";

export function boundedString(max: number) {
  return z.string().max(max);
}

/** Link rendered as an `href` — only http(s) to keep `javascript:`/`data:` out. */
export function httpUrlString(max: number) {
  return z.string().max(max).refine((value) => {
    if (!value) {
      return true;
    }

    try {
      const { protocol } = new URL(value);

      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Invalid link protocol." });
}

export function mediaUrlString(max: number) {
  return z.string().refine((value) => value.startsWith("data:") || value.length <= max, {
    message: "Invalid media URL length.",
  });
}

export function createTypeGuard<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return (value: unknown): value is z.infer<TSchema> => schema.safeParse(value).success;
}
