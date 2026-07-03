import "server-only";

import { getServerApiBaseUrl } from "@/lib/backend-api";

export async function confirmRobokassaSuccessRedirect(input: {
  invId: string;
  orderId: string;
  outSum: string;
  signature: string;
}) {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/payments/robokassa/success`, {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function readRobokassaSearchParam(
  query: Record<string, string | string[] | undefined>,
  ...keys: string[]
) {
  for (const key of keys) {
    const direct = query[key];

    if (typeof direct === "string" && direct.trim()) {
      return direct.trim();
    }

    if (Array.isArray(direct) && typeof direct[0] === "string" && direct[0].trim()) {
      return direct[0].trim();
    }
  }

  const wanted = new Set(keys.map((key) => key.toLowerCase()));

  for (const [key, value] of Object.entries(query)) {
    if (!wanted.has(key.toLowerCase())) {
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      return value[0].trim();
    }
  }

  return null;
}
