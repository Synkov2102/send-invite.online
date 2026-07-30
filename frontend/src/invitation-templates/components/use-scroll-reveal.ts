"use client";

import { useEffect, useRef } from "react";

/**
 * Показывает элементы с `data-reveal` по мере прокрутки. Скрытое состояние шаблон
 * включает только по `data-animate="on"` на корне, поэтому без скрипта и при
 * `prefers-reduced-motion` приглашение остаётся полностью видимым.
 *
 * `revision` — данные приглашения: в редакторе секции появляются и исчезают,
 * при смене контента наблюдатель пересобирается.
 */
export function useScrollReveal(revision: unknown) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    root.dataset.animate = "on";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const node of root.querySelectorAll("[data-reveal]:not([data-revealed])")) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [revision]);

  return rootRef;
}
