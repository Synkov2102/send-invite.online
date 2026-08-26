"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import styles from "./cookie-consent.module.css";

const STORAGE_KEY = "invite.cookieConsent.seen";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === null;
}

function getServerSnapshot() {
  return false;
}

function dismiss() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((listener) => listener());
}

export default function CookieConsent() {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.bar} role="region" aria-label="Уведомление о cookie">
      <p>
        Сайт использует технический cookie-файл сессии для входа и аналитические
        cookie «Яндекс.Метрики» для статистики посещаемости. Подробнее — в{" "}
        <Link href="/privacy">политике обработки персональных данных</Link>.
      </p>
      <button className={styles.button} onClick={dismiss} type="button">
        Понятно
      </button>
    </div>
  );
}
