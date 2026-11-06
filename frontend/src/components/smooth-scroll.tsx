"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Редактор — рабочий инструмент со своими панелями прокрутки, там оставляем нативный скролл.
const NATIVE_SCROLL_PREFIXES = ["/editor"];

export function SmoothScroll() {
  const pathname = usePathname();
  const disabled = NATIVE_SCROLL_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (disabled) return;

    // Тач остаётся нативным (syncTouch: false): инерция iOS/Android лучше любой эмуляции.
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 0.9,
      anchors: { offset: -24 },
      allowNestedScroll: true,
      autoToggle: true,
      autoRaf: true,
      stopInertiaOnNavigate: true,
    });

    return () => lenis.destroy();
  }, [disabled]);

  return null;
}
