"use client";

import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";
import { useEditor } from "../../editor-context";
import styles from "./payment-summary.module.css";

export function PaymentSummary() {
  const { acceptedPurchaseTerms, requiresPayment, setAcceptedPurchaseTerms } = useEditor();

  if (!requiresPayment) {
    return null;
  }

  return (
    <section className={styles.root} aria-label="Оплата публикации">
      <div className={styles.row}>
        <span>Создание и публикация одного сайта</span>
        <strong>{formatInviteSitePrice()}</strong>
      </div>
      <p>
        Разовая оплата через Robokassa. После оплаты сайт публикуется
        автоматически, чек приходит на email.
      </p>
      <label className={styles.label}>
        <input
          checked={acceptedPurchaseTerms}
          onChange={(event) => setAcceptedPurchaseTerms(event.target.checked)}
          type="checkbox"
        />
        <span>
          Я принимаю <Link href="/offer" target="_blank">публичную оферту</Link>,
          условия <Link href="/payment-and-refund" target="_blank">оплаты и возврата</Link>
          {" "}и <Link href="/privacy" target="_blank">политику обработки данных</Link>.
        </span>
      </label>
    </section>
  );
}
