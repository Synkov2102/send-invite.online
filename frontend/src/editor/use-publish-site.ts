"use client";

import { receiptEmailSchema } from "@invite/shared";
import type { CreateInviteSitePayload } from "@/lib/invite-site-types";
import { saveInviteSite, startInviteSiteCheckout, submitRobokassaForm } from "@/lib/api/sites";
import type { InviteState } from "@/lib/invite-state";
import type { InviteTemplate } from "@/lib/invite-templates";
import type { InvitePalette } from "@/lib/invite-theme";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildLoginUrl, getEditorReturnTo } from "./lib/editor-auth-redirect";
import type { AppliedPromo } from "./use-promo-code";
import type { getEditorStepErrors } from "./validation";

type UsePublishSiteArgs = {
  allErrors: string[];
  appliedPromo: AppliedPromo | null;
  effectiveInvite: InviteState;
  goToStepWithErrors: (index: number) => void;
  isAuthenticated: boolean;
  isPublishing: boolean;
  palette: InvitePalette;
  promoCodeInput: string;
  requiresPayment: boolean;
  requiresReceiptEmail: boolean;
  setIsPublishing: (value: boolean) => void;
  siteId?: string;
  stepErrors: ReturnType<typeof getEditorStepErrors>;
  template: InviteTemplate;
};

export function usePublishSite({
  allErrors,
  appliedPromo,
  effectiveInvite,
  goToStepWithErrors,
  isAuthenticated,
  isPublishing,
  palette,
  promoCodeInput,
  requiresPayment,
  requiresReceiptEmail,
  setIsPublishing,
  siteId,
  stepErrors,
  template,
}: UsePublishSiteArgs) {
  const router = useRouter();
  const [acceptedPurchaseTerms, setAcceptedPurchaseTerms] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [receiptEmail, setReceiptEmail] = useState("");

  async function publishSite() {
    if (isPublishing) {
      return;
    }

    if (allErrors.length > 0) {
      const firstInvalidStep = stepErrors.findIndex((errors) => errors.length > 0);
      goToStepWithErrors(firstInvalidStep < 0 ? 0 : firstInvalidStep);
      return;
    }

    const returnTo = getEditorReturnTo(siteId, template.id);

    if (!isAuthenticated) {
      router.push(buildLoginUrl(returnTo));
      return;
    }

    if (requiresPayment && !acceptedPurchaseTerms) {
      setPublishError("Подтвердите согласие с офертой и условиями оплаты.");
      return;
    }

    if (
      requiresPayment &&
      promoCodeInput.trim() &&
      (!appliedPromo || appliedPromo.promoCode !== promoCodeInput.trim().toUpperCase())
    ) {
      setPublishError("Сначала нажмите «Применить», чтобы активировать промокод.");
      return;
    }

    if (requiresReceiptEmail && !receiptEmailSchema.safeParse(receiptEmail).success) {
      setPublishError("Укажите email — на него придёт чек об оплате.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    const payload: CreateInviteSitePayload = {
      invite: effectiveInvite,
      palette,
      templateId: template.id,
    };

    try {
      if (requiresPayment) {
        const { ok, result, status } = await startInviteSiteCheckout(
          payload,
          siteId,
          appliedPromo?.promoCode,
          requiresReceiptEmail ? receiptEmail.trim() : undefined,
        );

        if (status === 401) {
          router.push(buildLoginUrl(returnTo));
          return;
        }

        if (!ok) {
          throw new Error(result.error ?? "Не удалось перейти к оплате.");
        }

        if (result.free) {
          router.push(result.order?.siteUrl ?? "/dashboard");
          return;
        }

        if (!result.action || !result.fields) {
          throw new Error(result.error ?? "Не удалось перейти к оплате.");
        }

        submitRobokassaForm(result.action, result.fields);
        return;
      }

      const { ok, result, status } = await saveInviteSite(payload, siteId);

      if (status === 401) {
        router.push(buildLoginUrl(returnTo));
        return;
      }

      if (!ok || typeof result.url !== "string") {
        throw new Error(
          result.error ??
            (siteId ? "Не удалось сохранить изменения." : "Не удалось создать сайт."),
        );
      }

      router.push("/dashboard");
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : requiresPayment
            ? "Не удалось перейти к оплате."
            : "Не удалось сохранить изменения.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return {
    acceptedPurchaseTerms,
    publishError,
    publishSite,
    receiptEmail,
    setAcceptedPurchaseTerms,
    setReceiptEmail,
  };
}
