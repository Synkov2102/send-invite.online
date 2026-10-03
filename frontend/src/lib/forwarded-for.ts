import "server-only";

import { headers } from "next/headers";

/**
 * Route Handlers call Nest with their own `fetch`, so the visitor IP is lost
 * unless X-Forwarded-For is passed along. Nest trusts it (`trust proxy`) for
 * throttling and promo abuse logging. Without it every server-side call shares
 * the frontend container's IP — one throttle bucket for the whole site.
 */
export function getForwardedForHeaders(request: Request): Record<string, string> {
  return toForwardedForHeaders(request.headers.get("x-forwarded-for"));
}

/** Same for Server Components, which have no Request object. */
export async function getIncomingForwardedForHeaders(): Promise<Record<string, string>> {
  return toForwardedForHeaders((await headers()).get("x-forwarded-for"));
}

function toForwardedForHeaders(value: string | null): Record<string, string> {
  const forwardedFor = value?.trim();

  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
