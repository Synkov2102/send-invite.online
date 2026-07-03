"use client";

import Link from "next/link";
import { formatInviteSitePrice } from "@/lib/commerce";
import { useEditor } from "../editor-context";

export function PaymentSummary() {
  const { acceptedPurchaseTerms, requiresPayment, setAcceptedPurchaseTerms } = useEditor();

  if (!requiresPayment) {
    return null;
  }

  return (
    <section className="editor-payment-summary" aria-label="Оплата публикации">
      <div>
        <span>Создание и публикация одного сайта</span>
        <strong>{formatInviteSitePrice()}</strong>
      </div>
      <p>
        Разовая оплата через Robokassa. После оплаты сайт публикуется
        автоматически, чек приходит на email.
      </p>
      <label>
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
