import "server-only";

import { cookies } from "next/headers";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export const authSessionCookieName = "invite_session";

export type AuthUser = {
  avatarUrl: string | null;
  email: string | null;
  id: string;
  login: string;
  name: string;
  yandexId: string;
};

type SessionResponse = {
  user?: AuthUser;
};

export function getAuthCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function getAuthSessionToken() {
  return (await cookies()).get(authSessionCookieName)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sessionToken = await getAuthSessionToken();

  if (!sessionToken) {
    return null;
  }

  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/auth/session`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SessionResponse;

    return data.user ?? null;
  } catch {
    return null;
  }
}

export function isSafeReturnPath(value: string | null) {
  return Boolean(value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\"));
}
