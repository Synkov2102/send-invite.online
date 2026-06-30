import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieOptions, isSafeReturnPath } from "@/lib/auth";

const stateCookieName = "yandex_oauth_state";
const verifierCookieName = "yandex_oauth_code_verifier";
const returnToCookieName = "yandex_oauth_return_to";

function base64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function getRedirectUri(request: NextRequest) {
  return (
    process.env.YANDEX_REDIRECT_URI ||
    new URL("/api/auth/yandex/callback", request.url).toString()
  );
}

export async function GET(request: NextRequest) {
  const clientId = process.env.YANDEX_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/auth?error=missing_yandex_config", request.url));
  }

  const state = base64Url(randomBytes(24));
  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());
  const returnToParam = request.nextUrl.searchParams.get("returnTo");
  const returnTo = isSafeReturnPath(returnToParam) && returnToParam ? returnToParam : "/";
  const authorizeUrl = new URL("https://oauth.yandex.com/authorize");

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", getRedirectUri(request));
  authorizeUrl.searchParams.set(
    "scope",
    process.env.YANDEX_AUTH_SCOPE ?? "login:info login:email login:avatar",
  );
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  const shortCookie = getAuthCookieOptions(10 * 60);

  response.cookies.set(stateCookieName, state, shortCookie);
  response.cookies.set(verifierCookieName, codeVerifier, shortCookie);
  response.cookies.set(returnToCookieName, returnTo, shortCookie);

  return response;
}
