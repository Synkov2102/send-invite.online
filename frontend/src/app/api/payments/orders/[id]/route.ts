import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/payments/orders/[id]">,
) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/payments/orders/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    );

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Не удалось проверить статус платежа." },
      { status: 502 },
    );
  }
}
