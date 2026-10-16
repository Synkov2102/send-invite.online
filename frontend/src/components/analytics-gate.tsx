"use client";

import { usePathname } from "next/navigation";
import { useCookieConsent } from "./cookie-consent";

// Guests of published invitations and screenshot pages are not product traffic.
const untrackedPathPrefixes = ["/invite/", "/templates/capture/"];

export function AnalyticsGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Analytics counters set cookies, so they load only after explicit consent (152-ФЗ).
  const consent = useCookieConsent();

  if (consent !== "all" || untrackedPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return children;
}
