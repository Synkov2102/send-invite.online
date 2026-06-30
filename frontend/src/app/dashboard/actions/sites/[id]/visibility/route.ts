import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authSessionCookieName } from "@/lib/auth";
import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function POST(
  request: Request,
  context: RouteContext<"/dashboard/actions/sites/[id]/visibility">,
) {
  const sessionToken = (await cookies()).get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth?returnTo=%2Fdashboard", request.url));
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
    return NextResponse.redirect(new URL("/dashboard?error=visibility", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
