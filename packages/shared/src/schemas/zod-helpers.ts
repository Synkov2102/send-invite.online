import { z } from "zod";

export function boundedString(max: number) {
  return z.string().max(max);
}

export function mediaUrlString(max: number) {
  return z.string().refine((value) => value.startsWith("data:") || value.length <= max, {
    message: "Invalid media URL length.",
  });
}

export function createTypeGuard<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return (value: unknown): value is z.infer<TSchema> => schema.safeParse(value).success;
}
