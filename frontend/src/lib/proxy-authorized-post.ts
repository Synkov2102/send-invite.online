import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getForwardedForHeaders } from "@/lib/forwarded-for";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

/**
 * Forwards a POST to Nest with the session cookie turned into a Bearer token.
 *
 * A plain rewrite would do for most calls, but these routes need their own 401 and 502
 * wording in Russian, so they stay explicit handlers.
 */
export async function proxyAuthorizedPost(
  request: NextRequest,
  options: {
    path: string;
    unauthorizedError: string;
    unavailableError: string;
  },
) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: options.unauthorizedError }, { status: 401 });
  }

  try {
    const response = await fetch(`${getServerApiBaseUrl()}${options.path}`, {
      body: await request.text(),
      cache: "no-store",
      headers: {
        ...getForwardedForHeaders(request),
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      method: "POST",
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
      status: response.status,
    });
  } catch {
    return NextResponse.json({ error: options.unavailableError }, { status: 502 });
  }
}
