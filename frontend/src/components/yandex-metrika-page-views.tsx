"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { YANDEX_METRIKA_ID } from "./yandex-metrika";

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
      window.ym?.(YANDEX_METRIKA_ID, "hit", url, {
        referer: referrer,
        title: document.title,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
