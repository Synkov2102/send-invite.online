import type { NextRequest } from "next/server";
import { getRequestUrl } from "@/lib/request-origin";

export function getYandexRedirectUri(request: NextRequest) {
  const fromEnv = process.env.YANDEX_REDIRECT_URI?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return getRequestUrl(request, "/api/auth/yandex/callback").toString().replace(/\/$/, "");
}
