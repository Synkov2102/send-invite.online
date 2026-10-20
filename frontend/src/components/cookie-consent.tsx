"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import styles from "./cookie-consent.module.css";

type NoticeState = "seen" | "unknown" | null;

const STORAGE_KEY = "invite.cookieNoticeSeen";
const listeners = new Set<() => void>();
// Fallback when storage is blocked: the choice still applies until reload.
let memorySeen = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): NoticeState {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "seen" || memorySeen ? "seen" : null;
  } catch {
    return memorySeen ? "seen" : null;
  }
}

// Wait for hydration before showing the notice.
function getServerSnapshot(): NoticeState {
  return "unknown";
}

function dismiss() {
  memorySeen = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "seen");
  } catch {}
  listeners.forEach((listener) => listener());
}

function useCookieNotice() {
  return useSyncExternalStore<NoticeState>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}

export default function CookieConsent() {
  if (useCookieNotice() !== null) {
    return null;
  }

  return (
    <div className={styles.bar} role="region" aria-label="Уведомление о cookie">
      <p>
        Мы используем технический cookie-файл сессии для входа и
        аналитические cookie «Яндекс.Метрики», Google Analytics и Top.Mail.Ru для
        статистики посещаемости. Подробнее — в{" "}
        <Link href="/privacy">политике обработки персональных данных</Link>.
      </p>
      <div className={styles.actions}>
        <button className={styles.button} onClick={dismiss} type="button">
          Понятно
        </button>
      </div>
    </div>
  );
}
