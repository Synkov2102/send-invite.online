"use client";

import { previewPromoCode } from "@/lib/api/payments";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildLoginUrl, getEditorReturnTo } from "./lib/editor-auth-redirect";

export type AppliedPromo = {
  amount: string;
  discountAmount: string;
  originalAmount: string;
  promoCode: string;
};

type UsePromoCodeArgs = {
  isAuthenticated: boolean;
  requiresPayment: boolean;
  siteId?: string;
  templateId: string;
};

export function usePromoCode({
  isAuthenticated,
  requiresPayment,
  siteId,
  templateId,
}: UsePromoCodeArgs) {
  const router = useRouter();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  async function applyPromoCode() {
    if (isApplyingPromo || !requiresPayment) {
      return;
    }

    const code = promoCodeInput.trim();

    if (!code) {
      setPromoError("Введите промокод.");
      return;
    }

    const returnTo = getEditorReturnTo(siteId, templateId);

    if (!isAuthenticated) {
      router.push(buildLoginUrl(returnTo));
      return;
    }

    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      const { ok, result, status } = await previewPromoCode(code);

      if (status === 401) {
        router.push(buildLoginUrl(returnTo));
        return;
      }

      if (!ok) {
        setAppliedPromo(null);
        setPromoError(result.error ?? "Промокод недействителен или уже недоступен.");
        return;
      }

      setAppliedPromo({
        amount: result.amount,
        discountAmount: result.discountAmount,
        originalAmount: result.originalAmount,
        promoCode: result.promoCode,
      });
      setPromoCodeInput(result.promoCode);
    } catch {
      setAppliedPromo(null);
      setPromoError("Не удалось проверить промокод.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  function clearPromoCode() {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError(null);
  }

  return {
    appliedPromo,
    applyPromoCode,
    clearPromoCode,
    isApplyingPromo,
    promoCodeInput,
    promoError,
    setPromoCodeInput,
  };
}
