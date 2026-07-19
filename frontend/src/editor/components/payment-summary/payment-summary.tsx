"use client";

import Link from "next/link";
import { formatRubPriceLabel } from "@/lib/commerce";
import { useEditor } from "../../editor-context";
import styles from "./payment-summary.module.css";

export function PaymentSummary() {
  const {
    acceptedPurchaseTerms,
    appliedPromo,
    applyPromoCode,
    checkoutPricing,
    clearPromoCode,
    isApplyingPromo,
    promoCodeInput,
    promoError,
    requiresPayment,
    setAcceptedPurchaseTerms,
    setPromoCodeInput,
  } = useEditor();

  if (!requiresPayment) {
    return null;
  }

  const hasDiscount = Number(checkoutPricing.discountAmount) > 0;
  const isFree = Number(checkoutPricing.amount) <= 0;
  const promoApplied =
    Boolean(appliedPromo) &&
    appliedPromo?.promoCode === promoCodeInput.trim().toUpperCase();

  return (
    <section className={styles.root} aria-label="Оплата публикации">
      <div className={styles.row}>
        <span>Создание и публикация одного сайта</span>
        <strong>{formatRubPriceLabel(checkoutPricing.amount)}</strong>
      </div>
      {hasDiscount ? (
        <div className={styles.discountRow}>
          <span>
            Промокод {appliedPromo?.promoCode}
            {" · "}
            скидка {formatRubPriceLabel(checkoutPricing.discountAmount)}
          </span>
          <span className={styles.originalPrice}>
            {formatRubPriceLabel(checkoutPricing.originalAmount)}
          </span>
        </div>
      ) : null}
      <p>
        {isFree
          ? "По этому промокоду публикация бесплатна — Robokassa не понадобится."
          : "Разовая оплата через Robokassa. После оплаты сайт публикуется автоматически, чек приходит на email."}
      </p>

      <div className={styles.promo}>
        <label className={styles.promoLabel} htmlFor="editor-promo-code">
          Промокод
        </label>
        <div className={styles.promoRow}>
          <input
            className={styles.promoInput}
            disabled={isApplyingPromo || promoApplied}
            id="editor-promo-code"
            onChange={(event) => setPromoCodeInput(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void applyPromoCode();
              }
            }}
            placeholder="Например, WEDDING10"
            readOnly={promoApplied}
            spellCheck={false}
            type="text"
            value={promoCodeInput}
          />
          {promoApplied ? (
            <button
              className={styles.promoButtonSecondary}
              onClick={clearPromoCode}
              type="button"
            >
              Сбросить
            </button>
          ) : (
            <button
              className={styles.promoButton}
              disabled={isApplyingPromo || !promoCodeInput.trim()}
              onClick={() => void applyPromoCode()}
              type="button"
            >
              {isApplyingPromo ? "Проверяем…" : "Применить"}
            </button>
          )}
        </div>
        {promoError ? (
          <p className={styles.promoError} role="alert">
            {promoError}
          </p>
        ) : null}
      </div>

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
