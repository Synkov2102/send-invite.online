import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const canonicalHostname = "send-invite.online";
const legacyHostname = `www.${canonicalHostname}`;
const localHostname = "localhost";
const localAliases = new Set(["0.0.0.0", "127.0.0.1", "::1"]);

function getRequestHostname(request: NextRequest) {
  // No real Host/X-Forwarded-Host header means this isn't a browser request —
  // e.g. Next's internal self-fetch for local image optimization, which has
  // no header and would otherwise fall back to nextUrl's 0.0.0.0 bind address
  // and get redirected into an empty response. Skip host rewriting for those.
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");

  if (!host) {
    return null;
  }

  try {
    return new URL(`http://${host}`).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const requestHostname = getRequestHostname(request);

  if (requestHostname === legacyHostname) {
    const destination = request.nextUrl.clone();
    destination.hostname = canonicalHostname;
    destination.port = "";
    destination.protocol = "https:";

    return NextResponse.redirect(destination, 308);
  }

  if (requestHostname && localAliases.has(requestHostname)) {
    const destination = request.nextUrl.clone();
    destination.hostname = localHostname;

    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}
