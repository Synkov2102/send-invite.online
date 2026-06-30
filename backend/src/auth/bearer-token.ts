const sessionCookieName = process.env.AUTH_SESSION_COOKIE_NAME ?? "invite_session";

export function getBearerToken(authorization: string | undefined): string {
  const [type, token] = authorization?.split(" ") ?? [];

  return type?.toLowerCase() === "bearer" ? (token ?? "") : "";
}

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
