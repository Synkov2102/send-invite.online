"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import styles from "./cookie-consent.module.css";

type Consent = "all" | "necessary";

// New key: the old "seen" notice was not a consent, so everyone gets asked once.
const STORAGE_KEY = "invite.cookieConsent";
const listeners = new Set<() => void>();
// Fallback when storage is blocked: the choice still applies until reload.
let memoryConsent: Consent | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Consent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "all" || value === "necessary" ? value : memoryConsent;
  } catch {
    return memoryConsent;
  }
}

// Unknown on the server: analytics stays off and the banner waits for hydration.
function getServerSnapshot(): Consent | "unknown" {
  return "unknown";
}

function choose(consent: Consent) {
  memoryConsent = consent;
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useCookieConsent() {
  return useSyncExternalStore<Consent | "unknown" | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}

export default function CookieConsent() {
  if (useCookieConsent() !== null) {
    return null;
  }

  return (
    <div className={styles.bar} role="region" aria-label="Уведомление о cookie">
      <p>
        Мы используем технический cookie-файл сессии для входа, а с вашего согласия —
        аналитические cookie «Яндекс.Метрики», Google Analytics и Top.Mail.Ru для
        статистики посещаемости. Подробнее — в{" "}
        <Link href="/privacy">политике обработки персональных данных</Link>.
      </p>
      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          onClick={() => choose("necessary")}
          type="button"
        >
          Только необходимые
        </button>
        <button className={styles.button} onClick={() => choose("all")} type="button">
          Принять все
        </button>
      </div>
    </div>
  );
}
