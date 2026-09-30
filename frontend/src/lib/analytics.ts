import { YANDEX_METRIKA_ID } from "@/components/yandex-metrika";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ym !== "function") {
    return false;
  }

  if (params) {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, params);
  } else {
    window.ym(YANDEX_METRIKA_ID, "reachGoal", goal);
  }
  return true;
}

export function trackGoalOnceWhenReady(
  sentKey: string,
  goal: string,
  params: Record<string, unknown>,
) {
  let timeout: number | undefined;
  let attempts = 0;

  function send() {
    if (window.sessionStorage.getItem(sentKey)) return;
    attempts += 1;
    // Mark only after handing the event to Metrika (or its initialization queue).
    if (trackGoal(goal, params)) {
      window.sessionStorage.setItem(sentKey, "1");
    } else if (attempts < 60) {
      timeout = window.setTimeout(send, 1000);
    }
  }

  send();
  return () => window.clearTimeout(timeout);
}
