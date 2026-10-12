import { TOP_MAILRU_COUNTER_ID } from "@/components/top-mailru-counter";
import { YANDEX_METRIKA_ID } from "@/components/yandex-metrika";

declare global {
  interface Window {
    _tmr?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
  }
}

// Google Analytics and Top.Mail.Ru count history changes themselves; Metrika needs explicit hits.
export function trackPageView(url: string, referrer: string) {
  window.ym?.(YANDEX_METRIKA_ID, "hit", url, {
    referer: referrer,
    title: document.title,
  });
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
  window.gtag?.("event", goal, params);
  window._tmr?.push({ id: TOP_MAILRU_COUNTER_ID, type: "reachGoal", goal });
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
    // Mark only after handing the event to the counters (or their initialization queues).
    if (trackGoal(goal, params)) {
      window.sessionStorage.setItem(sentKey, "1");
    } else if (attempts < 60) {
      timeout = window.setTimeout(send, 1000);
    }
  }

  send();
  return () => window.clearTimeout(timeout);
}
