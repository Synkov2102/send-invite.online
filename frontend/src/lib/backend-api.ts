import { isPublishedInviteSite, type PublishedInviteSite } from "@/lib/invite-site-types";

const defaultApiBaseUrl = "http://localhost:3001";

export function getServerApiBaseUrl() {
  return (
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    defaultApiBaseUrl
  ).replace(/\/$/, "");
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
  isPublished: boolean;
  rsvpEnabled: boolean;
  responseCount: number;
  templateId: string;
  url: string;
};

export type ManagedInviteSite = PublishedInviteSite & {
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
