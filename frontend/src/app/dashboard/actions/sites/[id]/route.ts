import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function PATCH(
  request: Request,
  context: RouteContext<"/dashboard/actions/sites/[id]">,
) {
  const sessionToken = (await cookies()).get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}`,
      {
        body: await request.text(),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": request.headers.get("content-type") ?? "application/json",
        },
        method: "PATCH",
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
      { error: "Сервис обновления временно недоступен." },
      { status: 502 },
    );
  }
}
