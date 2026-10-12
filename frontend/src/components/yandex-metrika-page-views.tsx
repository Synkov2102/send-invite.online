"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

export function YandexMetrikaPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = window.location.href;
    const referrer = previousUrl.current;
    previousUrl.current = url;

    // Initialization sends the first view; client navigation needs an explicit hit.
    if (referrer && referrer !== url) {
      trackPageView(url, referrer);
    }
  }, [pathname, searchParams]);

  return null;
}
