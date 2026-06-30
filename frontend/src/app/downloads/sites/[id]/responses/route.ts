import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function GET(
  request: Request,
  context: RouteContext<"/downloads/sites/[id]/responses">,
) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionToken =
    (await cookies()).get(authSessionCookieName)?.value ??
    cookieHeader
      .split(";")
      .map((item) => item.trim().split("="))
      .find(([name]) => name === authSessionCookieName)
      ?.slice(1)
      .join("=");

  if (!sessionToken) {
    return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}/responses/export`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Не удалось сформировать Excel-файл." },
        { status: response.status },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Disposition":
          response.headers.get("content-disposition") ??
          `attachment; filename="rsvp-${id}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Сервис выгрузки временно недоступен." },
      { status: 502 },
    );
  }
}
