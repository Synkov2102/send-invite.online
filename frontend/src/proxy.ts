import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const canonicalHostname = "send-invite.online";
const legacyHostname = `www.${canonicalHostname}`;
const localHostname = "localhost";
const localAliases = new Set(["0.0.0.0", "127.0.0.1", "::1"]);

function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;

  try {
    return new URL(`http://${host}`).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    return request.nextUrl.hostname.toLowerCase();
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
