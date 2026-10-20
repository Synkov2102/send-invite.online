"use client";

import { usePathname } from "next/navigation";

// Guests of published invitations and screenshot pages are not product traffic.
const untrackedPathPrefixes = ["/invite/", "/templates/capture/"];

export function AnalyticsGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (untrackedPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return children;
}
