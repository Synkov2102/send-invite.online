import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

  if (sessionToken) {
    try {
      await fetch(`${getServerApiBaseUrl()}/api/auth/logout`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        method: "POST",
      });
    } catch {
      // The local cookie is cleared even if the backend is unavailable.
    }
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.delete(authSessionCookieName);

  return response;
}
