import "server-only";

/**
 * Route Handlers call Nest with their own `fetch`, so the visitor IP is lost
 * unless X-Forwarded-For is passed along. Nest trusts it (`trust proxy`) for
 * throttling and promo abuse logging.
 */
export function getForwardedForHeaders(request: Request): Record<string, string> {
  const forwardedFor = request.headers.get("x-forwarded-for")?.trim();

  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
