import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export async function GET(
  request: NextRequest,
  context: RouteContext<"/downloads/sites/[id]/responses">,
) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

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
