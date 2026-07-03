"use client";

import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function PaymentStatus({ failed = false, orderId }: PaymentStatusProps) {
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let timeout: number | undefined;

    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/payments/orders/${encodeURIComponent(orderId)}`,
          { cache: "no-store" },
        );
        const result = (await response.json()) as OrderState & { error?: string };

        if (!response.ok) {
          throw new Error(result.error ?? "Не удалось проверить платеж.");
        }

        if (!active) {
          return;
        }

        setOrder(result);
        setError(null);
        attempts += 1;

        if (result.status !== "paid" && attempts < 15) {
          timeout = window.setTimeout(loadStatus, 2000);
        }
      } catch (statusError) {
        if (active) {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "Не удалось проверить платеж.",
          );
        }
      }
    }

    void loadStatus();

    return () => {
      active = false;
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [failed, orderId]);

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
      <h1>{error ? "Нужна повторная проверка" : "Почти готово"}</h1>
      <p>
        {error ??
          "Robokassa уже вернула вас на сайт. Ждём защищённое серверное подтверждение оплаты."}
      </p>
      <div className="payment-actions">
        <Link className="marketing-button marketing-button--ghost" href="/dashboard">
          В личный кабинет
        </Link>
      </div>
    </section>
  );
}
