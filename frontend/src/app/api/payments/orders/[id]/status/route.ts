import { NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/payments/orders/[id]/status">,
) {
  const { id } = await context.params;

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/payments/orders/${encodeURIComponent(id)}/status`,
      { cache: "no-store" },
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
