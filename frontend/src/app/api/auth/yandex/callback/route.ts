import { NextRequest, NextResponse } from "next/server";
import {
  authSessionCookieName,
  getAuthCookieOptions,
  isSafeReturnPath,
} from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

const stateCookieName = "yandex_oauth_state";
const verifierCookieName = "yandex_oauth_code_verifier";
const returnToCookieName = "yandex_oauth_return_to";

type AuthSessionResponse = {
  expiresAt?: string;
  token?: string;
};

function getRedirectUri(request: NextRequest) {
  return (
    process.env.YANDEX_REDIRECT_URI ||
    new URL("/api/auth/yandex/callback", request.url).toString()
  );
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete(stateCookieName);
  response.cookies.delete(verifierCookieName);
  response.cookies.delete(returnToCookieName);
}

function getErrorRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error)}`, request.url));
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = request.cookies;
  const expectedState = cookieStore.get(stateCookieName)?.value;
  const codeVerifier = cookieStore.get(verifierCookieName)?.value;
  const returnToCookie = cookieStore.get(returnToCookieName)?.value ?? "/";
  const returnTo = isSafeReturnPath(returnToCookie) ? returnToCookie : "/";

  if (error) {
    const response = getErrorRedirect(request, error);
    clearOAuthCookies(response);
    return response;
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    const response = getErrorRedirect(request, "invalid_oauth_state");
    clearOAuthCookies(response);
    return response;
  }

  try {
    const authResponse = await fetch(`${getServerApiBaseUrl()}/api/auth/yandex/callback`, {
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri: getRedirectUri(request),
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!authResponse.ok) {
      throw new Error(`Backend auth failed with ${authResponse.status}`);
    }

    const session = (await authResponse.json()) as AuthSessionResponse;

    if (!session.token || !session.expiresAt) {
      throw new Error("Backend auth response is incomplete.");
    }

    const response = NextResponse.redirect(new URL(returnTo, request.url));
    const expiresAt = new Date(session.expiresAt);
    const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    response.cookies.set(authSessionCookieName, session.token, getAuthCookieOptions(maxAge));
    clearOAuthCookies(response);

    return response;
  } catch {
    const response = getErrorRedirect(request, "yandex_auth_failed");
    clearOAuthCookies(response);
    return response;
  }
}
