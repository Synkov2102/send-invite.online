import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const canonicalHostname = "send-invite.online";
const legacyHostname = `www.${canonicalHostname}`;
const localHostname = "localhost";
const localAliases = new Set(["0.0.0.0", "127.0.0.1", "::1"]);

function parseHostname(host: string | null) {
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
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const externalHostname = parseHostname(forwardedHost || request.headers.get("host"));

  if (externalHostname === legacyHostname) {
    const destination = request.nextUrl.clone();
    destination.hostname = canonicalHostname;
    destination.port = "";
    destination.protocol = "https:";

    return NextResponse.redirect(destination, 308);
  }

  // Only the browser-set Host header identifies a real "visited via
  // 0.0.0.0/127.0.0.1" case. Next sets x-forwarded-host to the server's own
  // bind address on its internal self-fetches (e.g. the image optimizer
  // fetching a local /public image), and trusting it here would redirect
  // that internal request into an empty response — breaking image
  // optimization whenever the server binds to 0.0.0.0, as it does in Docker.
  const directHostname = parseHostname(request.headers.get("host"));

  if (directHostname && localAliases.has(directHostname)) {
    const destination = request.nextUrl.clone();
    destination.hostname = localHostname;

    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}
