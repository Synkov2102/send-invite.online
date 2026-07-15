const sessionCookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "invite_session";

export function getBearerToken(authorization: string | undefined): string {
  const [type, token] = authorization?.split(" ") ?? [];

  return type?.toLowerCase() === "bearer" ? (token ?? "") : "";
}

/**
 * Resolves the session token from Bearer and/or the invite session cookie.
 * Browser calls that hit Nest via Next rewrites often send only the cookie;
 * server-side and BFF calls send Bearer. Prefer Bearer when both are present.
 */
export function getSessionToken(authorization?: string, cookieHeader?: string) {
  const bearerToken = getBearerToken(authorization);

  if (bearerToken) {
    return bearerToken;
  }

  if (!cookieHeader) {
    return "";
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");

    if (name === sessionCookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return "";
}
