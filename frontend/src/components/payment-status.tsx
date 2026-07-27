"use client";

import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { trackGoal } from "@/lib/analytics";

type OrderState = {
  amount: string;
  id: string;
  paidAt: string | null;
  siteId: string;
  siteUrl: string | null;
  status: "pending" | "paid";
};

type PaymentStatusProps = {
  failed?: boolean;
  orderId: string;
};

const FAST_POLL_ATTEMPTS = 60;
const FAST_POLL_INTERVAL_MS = 2000;
const SLOW_POLL_ATTEMPTS = 30;
const SLOW_POLL_INTERVAL_MS = 10_000;
const MAX_ERROR_RETRIES = 5;

async function fetchOrderStatus(orderId: string) {
  const response = await fetch(
    `/api/payments/orders/${encodeURIComponent(orderId)}/status`,
    { cache: "no-store", credentials: "same-origin" },
  );
  const result = (await response.json()) as OrderState & { error?: string };

  if (!response.ok) {
    throw new Error(result.error ?? "Не удалось проверить платеж.");
  }

  return result;
}

export default function PaymentStatus({ failed = false, orderId }: PaymentStatusProps) {
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setTimedOut(false);
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let errorRetries = 0;
    let timeout: number | undefined;

    async function loadStatus() {
      try {
        const result = await fetchOrderStatus(orderId);

        if (!active) {
          return;
        }

        setOrder(result);
        setError(null);
        errorRetries = 0;
        attempts += 1;

        if (result.status === "paid") {
          return;
        }

        const useSlowPoll = attempts > FAST_POLL_ATTEMPTS;
        const maxAttempts = FAST_POLL_ATTEMPTS + SLOW_POLL_ATTEMPTS;

        if (attempts >= maxAttempts) {
          setTimedOut(true);
          return;
        }

        if (useSlowPoll && attempts === FAST_POLL_ATTEMPTS + 1) {
          setTimedOut(true);
        }

        const interval = useSlowPoll ? SLOW_POLL_INTERVAL_MS : FAST_POLL_INTERVAL_MS;
        timeout = window.setTimeout(loadStatus, interval);
      } catch (statusError) {
        if (!active) {
          return;
        }

        errorRetries += 1;

        if (errorRetries < MAX_ERROR_RETRIES) {
          timeout = window.setTimeout(loadStatus, FAST_POLL_INTERVAL_MS);
          return;
        }

        setError(
          statusError instanceof Error
            ? statusError.message
            : "Не удалось проверить платеж.",
        );
      }
    }

    void loadStatus();

    return () => {
      active = false;
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [failed, orderId, refreshKey]);

  useEffect(() => {
    if (order?.status !== "paid") {
      return;
    }

    const sentKey = `payment_goal_sent:${orderId}`;
    if (window.sessionStorage.getItem(sentKey)) {
      return;
    }

    trackGoal("payment_success", { currency: "RUB", order_price: Number(order.amount) });
    window.sessionStorage.setItem(sentKey, "1");
  }, [order, orderId]);

  if (order?.status === "paid") {
    return (
      <section className="payment-panel is-success">
        <CheckCircle2 aria-hidden size={34} />
        <p className="marketing-eyebrow">Оплата подтверждена</p>
        <h1>Сайт опубликован</h1>
        <p>Платёж получен, а приглашение уже доступно гостям по публичной ссылке.</p>
        <div className="payment-actions">
          <Link className="marketing-button marketing-button--primary" href={order.siteUrl ?? "/dashboard"}>
            Открыть приглашение
          </Link>
          <Link className="marketing-button marketing-button--ghost" href="/dashboard">
            В личный кабинет
          </Link>
        </div>
      </section>
    );
  }

  if (failed) {
    return (
      <section className="payment-panel is-failed">
        <XCircle aria-hidden size={34} />
        <p className="marketing-eyebrow">Оплата не завершена</p>
        <h1>Списание не произошло</h1>
        <p>Черновик сохранён. Вернитесь в редактор, проверьте данные и повторите оплату.</p>
        <div className="payment-actions">
          <Link
            className="marketing-button marketing-button--primary"
            href={order?.siteId ? `/editor?site=${encodeURIComponent(order.siteId)}` : "/dashboard"}
          >
            Повторить оплату
          </Link>
          <Link className="marketing-button marketing-button--ghost" href="/dashboard">
            В личный кабинет
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-panel is-pending">
      {error ? <RefreshCw aria-hidden size={34} /> : <Clock3 aria-hidden size={34} />}
      <p className="marketing-eyebrow">Проверяем платёж</p>
      <h1>
        {error
          ? "Нужна повторная проверка"
          : timedOut
            ? "Подтверждение задерживается"
            : "Почти готово"}
      </h1>
      <p>
        {error ??
          (timedOut
            ? "Оплата в Robokassa прошла, но серверное подтверждение ещё не пришло. Мы продолжаем проверку. Если сайт не появится в личном кабинете, напишите в поддержку."
            : "Robokassa уже вернула вас на сайт. Ждём защищённое серверное подтверждение оплаты.")}
      </p>
      <div className="payment-actions">
        {(error || timedOut) && (
          <button className="marketing-button marketing-button--primary" onClick={retry} type="button">
            Проверить снова
          </button>
        )}
        <Link className="marketing-button marketing-button--ghost" href="/dashboard">
          В личный кабинет
        </Link>
      </div>
    </section>
  );
}
