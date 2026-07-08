import { NextRequest, NextResponse } from "next/server";
import {
  authSessionCookieName,
  getAuthCookieOptions,
  isSafeReturnPath,
} from "@/lib/auth";
import { getRequestUrl } from "@/lib/request-origin";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";
import { getYandexRedirectUri } from "@/lib/yandex-oauth";

const stateCookieName = "yandex_oauth_state";
const verifierCookieName = "yandex_oauth_code_verifier";
const returnToCookieName = "yandex_oauth_return_to";

type AuthSessionResponse = {
  expiresAt?: string;
  token?: string;
};

type BackendErrorResponse = {
  message?: string | string[];
};

function clearOAuthCookies(response: NextResponse) {
  response.cookies.delete(stateCookieName);
  response.cookies.delete(verifierCookieName);
  response.cookies.delete(returnToCookieName);
}

function getErrorRedirect(request: NextRequest, error: string) {
  return NextResponse.redirect(
    getRequestUrl(request, `/auth?error=${encodeURIComponent(error)}`),
  );
}

function getBackendErrorCode(status: number, message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("redirect uri is not allowed")) {
    return "redirect_uri_not_allowed";
  }

  if (normalized.includes("invalid pkce code verifier")) {
    return "missing_code_verifier";
  }

  if (normalized.includes("yandex_client_id is not configured")) {
    return "missing_yandex_config";
  }

  if (normalized.includes("yandex_client_secret is not configured")) {
    return "missing_yandex_config";
  }

  if (status === 401 || normalized.includes("yandex authorization failed")) {
    return "yandex_token_exchange_failed";
  }

  return "yandex_auth_failed";
}

function getBackendErrorMessage(payload: BackendErrorResponse | null) {
  const message = payload?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message ?? "";
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

  if (!codeVerifier || codeVerifier.length < 43) {
    const response = getErrorRedirect(request, "missing_code_verifier");
    clearOAuthCookies(response);
    return response;
  }

  try {
    const authResponse = await fetch(`${getServerApiBaseUrl()}/api/auth/yandex/callback`, {
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri: getYandexRedirectUri(request),
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!authResponse.ok) {
      const errorPayload = (await authResponse.json().catch(() => null)) as BackendErrorResponse | null;
      const errorCode = getBackendErrorCode(
        authResponse.status,
        getBackendErrorMessage(errorPayload),
      );

      throw new Error(errorCode);
    }

    const session = (await authResponse.json()) as AuthSessionResponse;

    if (!session.token || !session.expiresAt) {
      throw new Error("yandex_auth_failed");
    }

    const response = NextResponse.redirect(getRequestUrl(request, returnTo));
    const expiresAt = new Date(session.expiresAt);
    const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

    response.cookies.set(
      authSessionCookieName,
      session.token,
      getAuthCookieOptions(request, maxAge),
    );
    clearOAuthCookies(response);

    return response;
  } catch (caughtError) {
    const knownErrors = new Set([
      "backend_unreachable",
      "missing_code_verifier",
      "missing_yandex_config",
      "redirect_uri_not_allowed",
      "yandex_auth_failed",
      "yandex_token_exchange_failed",
    ]);
    const errorCode =
      caughtError instanceof Error && knownErrors.has(caughtError.message)
        ? caughtError.message
        : caughtError instanceof Error &&
            (caughtError.message.includes("fetch failed") ||
              caughtError.message.includes("ECONNREFUSED"))
          ? "backend_unreachable"
          : "yandex_auth_failed";
    const response = getErrorRedirect(request, errorCode);
    clearOAuthCookies(response);
    return response;
  }
}
