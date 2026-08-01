import "server-only";

import { INVITE_SITE_PRICE_RUB } from "@invite/shared";
import { isPublishedInviteSite, type PublishedInviteSite } from "@/lib/invite-site-types";
import { getServerApiBaseUrl } from "@/lib/server-api-base-url";

export { getServerApiBaseUrl };

export type InviteSitePricing = {
  currentPriceRub: number;
  originalPriceRub: number | null;
};

const fallbackPricing: InviteSitePricing = {
  currentPriceRub: INVITE_SITE_PRICE_RUB,
  originalPriceRub: null,
};

function isInviteSitePricing(value: unknown): value is InviteSitePricing {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as InviteSitePricing).currentPriceRub === "number" &&
    ((value as InviteSitePricing).originalPriceRub === null ||
      typeof (value as InviteSitePricing).originalPriceRub === "number")
  );
}

/** Revalidated periodically so a price change via the CLI script shows up without a redeploy. */
export async function getInviteSitePricing(): Promise<InviteSitePricing> {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/payments/pricing`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return fallbackPricing;
    }

    const pricing: unknown = await response.json();

    return isInviteSitePricing(pricing) ? pricing : fallbackPricing;
  } catch {
    return fallbackPricing;
  }
}

export async function getPublishedInviteSite(id: string): Promise<PublishedInviteSite | null> {
  try {
    const response = await fetch(
      `${getServerApiBaseUrl()}/api/sites/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const site: unknown = await response.json();

    return isPublishedInviteSite(site) ? site : null;
  } catch {
    return null;
  }
}

export type OwnedInviteSite = {
  bride: string;
  createdAt: string;
  date: string;
  groom: string;
  id: string;
  isPaid: boolean;
  isPublished: boolean;
  rsvpEnabled: boolean;
  responseCount: number;
  templateId: string;
  url: string;
};

export type ManagedInviteSite = PublishedInviteSite & {
  isPaid: boolean;
  isPublished: boolean;
};

export type InviteResponseData = {
  questions: string[];
  responses: Array<{
    answers: Array<{
      question: string;
      questionIndex: number;
      values: string[];
    }>;
    createdAt: string;
    guestName: string;
    id: string;
    updatedAt: string;
  }>;
  site: {
    bride: string;
    date: string;
    groom: string;
    id: string;
  };
};

async function fetchAuthorizedJson<T>(path: string, sessionToken: string): Promise<T> {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getOwnedInviteSites(sessionToken: string) {
  const data = await fetchAuthorizedJson<{ sites: OwnedInviteSite[] }>(
    "/api/sites/mine",
    sessionToken,
  );

  return data.sites;
}

export function getInviteResponses(siteId: string, sessionToken: string) {
  return fetchAuthorizedJson<InviteResponseData>(
    `/api/sites/${encodeURIComponent(siteId)}/responses`,
    sessionToken,
  );
}

export function getManagedInviteSite(siteId: string, sessionToken: string) {
  return fetchAuthorizedJson<ManagedInviteSite>(
    `/api/sites/${encodeURIComponent(siteId)}/manage`,
    sessionToken,
  );
}
