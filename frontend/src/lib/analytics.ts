import { YANDEX_METRIKA_ID } from "@/components/yandex-metrika";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }

  if (params) {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, params);
  } else {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal);
  }
}
