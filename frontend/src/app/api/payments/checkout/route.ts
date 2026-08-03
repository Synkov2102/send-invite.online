import type { NextRequest } from "next/server";
import { proxyAuthorizedPost } from "@/lib/proxy-authorized-post";

export async function POST(request: NextRequest) {
  return proxyAuthorizedPost(request, {
    path: "/api/payments/checkout",
    unauthorizedError: "Войдите в аккаунт, чтобы перейти к оплате.",
    unavailableError: "Платёжный сервис временно недоступен.",
  });
}
