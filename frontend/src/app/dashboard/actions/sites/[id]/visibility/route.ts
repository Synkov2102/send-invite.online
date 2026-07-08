import { NextRequest, NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getRequestUrl } from "@/lib/request-origin";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/dashboard/actions/sites/[id]/visibility">,
) {
  const sessionToken = request.cookies.get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(getRequestUrl(request, "/auth?returnTo=%2Fdashboard"));
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const isPublished = formData.get("isPublished") === "true";
  const response = await fetch(
    `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}/visibility`,
    {
      body: JSON.stringify({ isPublished }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  if (!response.ok) {
    return NextResponse.redirect(getRequestUrl(request, "/dashboard?error=visibility"));
  }

  return NextResponse.redirect(getRequestUrl(request, "/dashboard"));
}
