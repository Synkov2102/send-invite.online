import type { CreateInviteSitePayload } from "@invite/shared";

type SiteMutationResult = {
  error?: string;
  id?: string;
  url?: string;
};

export async function saveInviteSite(payload: CreateInviteSitePayload, siteId?: string) {
  const response = await fetch(
    siteId ? `/dashboard/actions/sites/${encodeURIComponent(siteId)}` : "/api/sites",
    {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: siteId ? "PATCH" : "POST",
    },
  );

  const result = (await response.json()) as SiteMutationResult;

  return {
    ok: response.ok && typeof result.url === "string",
    result,
    status: response.status,
  };
}

export async function fetchInviteResponses(siteId: string) {
  const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/responses`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load responses (${response.status})`);
  }

  return response.json();
}
