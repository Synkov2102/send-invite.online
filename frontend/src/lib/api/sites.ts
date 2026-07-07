import type { CreateInviteSitePayload } from "@/lib/invite-site-types";

type SiteMutationResult = {
  error?: string;
  id?: string;
  url?: string;
};

type CheckoutResult = {
  action?: string;
  error?: string;
  fields?: Record<string, string>;
  order?: {
    amount: string;
    id: string;
    siteId: string;
    status: "pending";
  };
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

export async function startInviteSiteCheckout(
  payload: CreateInviteSitePayload,
  siteId?: string,
) {
  const response = await fetch("/api/payments/checkout", {
    body: JSON.stringify({ site: payload, siteId }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = (await response.json()) as CheckoutResult;

  return {
    ok:
      response.ok &&
      typeof result.action === "string" &&
      Boolean(result.fields) &&
      typeof result.order?.id === "string",
    result,
    status: response.status,
  };
}

export function submitRobokassaForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.action = action;
  form.method = "POST";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.name = name;
    input.type = "hidden";
    input.value = value;
    form.append(input);
  }

  document.body.append(form);
  form.submit();
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
