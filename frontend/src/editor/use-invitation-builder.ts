"use client";

import { buildListPricing } from "@invite/shared";
import { isWideTemplateKind } from "@/lib/invite-templates";
import { getListPromoPricing, type InviteSitePricing } from "@/lib/commerce";
import { useMemo, useState } from "react";
import { useEditorNavigation } from "./use-editor-navigation";
import { useInviteEditorState } from "./use-invite-editor-state";
import { usePromoCode } from "./use-promo-code";
import { usePublishSite } from "./use-publish-site";
import type { InvitationBuilderProps } from "./types";
import { getEditorStepErrors } from "./validation";

export type { AppliedPromo } from "./use-promo-code";

export function useInvitationBuilder({
  accountEmail,
  initialInvite,
  initialIsFullscreenPreview = false,
  initialIsPaid = false,
  initialPalette,
  initialPaletteId,
  initialPricing,
  initialStep = 0,
  isAuthenticated,
  siteId,
  template,
}: InvitationBuilderProps) {
  const inviteState = useInviteEditorState({
    initialInvite,
    initialPalette,
    initialPaletteId,
    siteId,
    template,
  });

  const [isPublishing, setIsPublishing] = useState(false);

  const stepErrors = useMemo(
    () => getEditorStepErrors(inviteState.effectiveInvite),
    [inviteState.effectiveInvite],
  );
  const allErrors = stepErrors.slice(0, 3).flat();

  // Кнопка «Опубликовать» сама показывает результат публикации — предупреждать об
  // уходе со страницы в этот момент не нужно, даже если черновик формально «грязный».
  const shouldWarnBeforeLeave = !isPublishing && inviteState.hasUnsavedChanges;

  const navigation = useEditorNavigation({
    initialIsFullscreenPreview,
    initialStep,
    isPublishing,
    shouldWarnBeforeLeave,
    stepErrors,
  });

  const requiresPayment = !siteId || !initialIsPaid;
  const sitePricing: InviteSitePricing = initialPricing ?? {
    currentPriceRub: Number(getListPromoPricing().amount),
    originalPriceRub: null,
  };

  const promo = usePromoCode({
    isAuthenticated,
    requiresPayment,
    siteId,
    templateId: template.id,
  });

  const checkoutPricing = promo.appliedPromo ?? buildListPricing(sitePricing.currentPriceRub);
  // Robokassa не сформирует чек без адреса, а по бесплатному промокоду чека нет.
  // До входа почта аккаунта неизвестна — там пользователя всё равно ждёт логин.
  const requiresReceiptEmail =
    isAuthenticated &&
    requiresPayment &&
    !accountEmail?.trim() &&
    Number(checkoutPricing.amount) > 0;

  const publish = usePublishSite({
    allErrors,
    appliedPromo: promo.appliedPromo,
    effectiveInvite: inviteState.effectiveInvite,
    goToStepWithErrors: navigation.goToStepWithErrors,
    isAuthenticated,
    isPublishing,
    palette: inviteState.palette,
    promoCodeInput: promo.promoCodeInput,
    requiresPayment,
    requiresReceiptEmail,
    setIsPublishing,
    siteId,
    stepErrors,
    template,
  });

  const hasRingControls = template.coverType === "rings";
  const isWideTemplate = isWideTemplateKind(inviteState.templateKind);

  return {
    acceptedPurchaseTerms: publish.acceptedPurchaseTerms,
    activeStep: navigation.activeStep,
    allErrors,
    appliedPromo: promo.appliedPromo,
    applyPromoCode: promo.applyPromoCode,
    checkoutPricing,
    clearPromoCode: promo.clearPromoCode,
    continueToNextStep: navigation.continueToNextStep,
    coverImage: inviteState.coverImage,
    confirmLeaveEditor: navigation.confirmLeaveEditor,
    customPalette: inviteState.customPalette,
    effectiveInvite: inviteState.effectiveInvite,
    hasRingControls,
    invite: inviteState.invite,
    isApplyingPromo: promo.isApplyingPromo,
    isFullscreenPreview: navigation.isFullscreenPreview,
    isPublishing,
    isTemplateEntryPreview: navigation.isTemplateEntryPreview,
    isWideTemplate,
    openStep: navigation.openStep,
    palette: inviteState.palette,
    paletteMode: inviteState.paletteMode,
    palettes: inviteState.palettes,
    photoError: inviteState.photoError,
    portraitImage: inviteState.portraitImage,
    previewDevice: navigation.previewDevice,
    promoCodeInput: promo.promoCodeInput,
    promoError: promo.promoError,
    publishError: publish.publishError,
    publishSite: publish.publishSite,
    receiptEmail: publish.receiptEmail,
    requiresPayment,
    requiresReceiptEmail,
    resolvedPaletteId: inviteState.resolvedPaletteId,
    ringColor: inviteState.ringColor,
    saveStatus: inviteState.saveStatus,
    setAcceptedPurchaseTerms: publish.setAcceptedPurchaseTerms,
    setIsFullscreenPreview: navigation.setFullscreenPreview,
    setPaletteMode: inviteState.setPaletteMode,
    setPreviewDevice: navigation.setPreviewDevice,
    setPromoCodeInput: promo.setPromoCodeInput,
    setReceiptEmail: publish.setReceiptEmail,
    siteId,
    sitePricing,
    stepErrors,
    template,
    templateKind: inviteState.templateKind,
    venueImage: inviteState.venueImage,
    visibleValidationStep: navigation.visibleValidationStep,
    visitedSteps: navigation.visitedSteps,
    addDressCodeColor: inviteState.addDressCodeColor,
    addRsvpOption: inviteState.addRsvpOption,
    addRsvpQuestion: inviteState.addRsvpQuestion,
    addScheduleItem: inviteState.addScheduleItem,
    customizeSelectedPalette: inviteState.customizeSelectedPalette,
    removeDressCodeColor: inviteState.removeDressCodeColor,
    removeRsvpOption: inviteState.removeRsvpOption,
    removeRsvpQuestion: inviteState.removeRsvpQuestion,
    removeScheduleItem: inviteState.removeScheduleItem,
    resetImage: inviteState.resetImage,
    selectImageFile: inviteState.selectImageFile,
    selectMusicFile: inviteState.selectMusicFile,
    selectPalette: inviteState.selectPalette,
    updateCustomPalette: inviteState.updateCustomPalette,
    updateDressCodeColor: inviteState.updateDressCodeColor,
    updateInvite: inviteState.updateInvite,
    updateRsvpOption: inviteState.updateRsvpOption,
    updateRsvpQuestion: inviteState.updateRsvpQuestion,
    updateScheduleItem: inviteState.updateScheduleItem,
  };
}

export type InvitationBuilderController = ReturnType<typeof useInvitationBuilder>;
