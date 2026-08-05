import type { NextRequest } from "next/server";
import { proxyAuthorizedPost } from "@/lib/proxy-authorized-post";

export async function POST(request: NextRequest) {
  return proxyAuthorizedPost(request, {
    path: "/api/sites",
    unauthorizedError: "Войдите в аккаунт, чтобы создать сайт.",
    unavailableError: "Сервис создания сайтов временно недоступен.",
  });
}
