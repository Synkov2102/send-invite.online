import type { NextRequest } from "next/server";

const localHostnames = new Set(["0.0.0.0", "127.0.0.1", "::1"]);

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

function normalizeHost(host: string) {
  try {
    const parsed = new URL(`http://${host}`);
    const hostname = parsed.hostname.replace(/^\[|\]$/g, "");

    if (!localHostnames.has(hostname)) {
      return host;
    }

    return parsed.port ? `localhost:${parsed.port}` : "localhost";
  } catch {
    return host;
  }
}

export function getRequestOrigin(request: NextRequest) {
  const configuredOrigin = process.env.FRONTEND_ORIGIN?.replace(/\/$/, "");

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const forwardedHost = getFirstHeaderValue(request.headers.get("x-forwarded-host"));
  const forwardedProtocol = getFirstHeaderValue(request.headers.get("x-forwarded-proto"));
  const host = normalizeHost(forwardedHost || request.headers.get("host") || request.nextUrl.host);
  const protocol =
    forwardedProtocol ||
    (host.startsWith("localhost") ? "http" : request.nextUrl.protocol.replace(":", ""));

  return `${protocol}://${host}`;
}

export function getRequestUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, getRequestOrigin(request));
}
