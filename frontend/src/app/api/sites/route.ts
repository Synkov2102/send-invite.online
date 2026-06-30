import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Войдите в аккаунт, чтобы создать сайт." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/sites`, {
      body: await request.text(),
      cache: "no-store",
      headers: {
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
    return NextResponse.json(
      { error: "Сервис создания сайтов временно недоступен." },
      { status: 502 },
    );
  }
}
