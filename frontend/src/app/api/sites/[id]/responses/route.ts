import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { type InviteResponseData } from "@/lib/backend-api";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}/responses`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Не удалось загрузить ответы." },
        { status: response.status },
      );
    }

    const data = (await response.json()) as InviteResponseData;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Сервис ответов временно недоступен." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  }

  const { id } = await params;
  const responseId = request.nextUrl.searchParams.get("responseId");
  const target = responseId
    ? `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}/responses/${encodeURIComponent(responseId)}`
    : `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}/responses`;

  try {
    const response = await fetch(target, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Не удалось удалить ответы." },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Сервис ответов временно недоступен." }, { status: 502 });
  }
}
