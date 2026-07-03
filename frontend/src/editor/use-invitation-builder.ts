"use client";

import type { CreateInviteSitePayload } from "@/lib/invite-site-types";
import {
  saveInviteSite,
  startInviteSiteCheckout,
  submitRobokassaForm,
} from "@/lib/api/sites";
import {
  getTemplateKind,
  type InviteRsvpQuestion,
  type InviteScheduleItem,
  type InviteState,
} from "@invite/shared";
import {
  createRingColor,
  defaultCustomPalette,
  getTemplatePalettes,
  hexToRgba,
  inviteImages,
  silkImages,
  type InvitePalette,
} from "@/lib/invite-theme";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { imageUploadTypes, maxImageUploadBytes, themeFields, editorSteps } from "./constants";
import {
  isLocalMusicSource,
  readEditorDraft,
  readLocalMusic,
  saveEditorDraft,
  saveLocalMusic,
} from "./editor-draft";
import { getInitialInvite } from "./template-presets";
import type { InvitationBuilderProps, SaveStatus } from "./types";
import { getEditorStepErrors } from "./validation";

export function useInvitationBuilder({
  initialInvite,
  initialIsPaid = false,
  initialPalette,
  isAuthenticated,
  siteId,
  template,
}: InvitationBuilderProps) {
  const router = useRouter();
  const templateKind = getTemplateKind(template.id);
  const isWideTemplate = templateKind !== "alpine";
  const [initialDraft] = useState(() =>
    siteId ? null : readEditorDraft(template.id),
  );

  const [invite, setInvite] = useState<InviteState>(
    () => initialInvite ?? initialDraft?.invite ?? getInitialInvite(template),
  );
  const [customPalette, setCustomPalette] = useState<InvitePalette>(
    () => initialPalette ?? initialDraft?.customPalette ?? defaultCustomPalette,
  );
  const [hasLocalMusic, setHasLocalMusic] = useState(
    () => initialDraft?.hasLocalMusic ?? false,
  );
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState(() => new Set<number>([0]));
  const [visibleValidationStep, setVisibleValidationStep] = useState<number | null>(null);
  const [paletteMode, setPaletteMode] = useState<"custom" | "presets">("presets");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isPublishing, setIsPublishing] = useState(false);
  const [acceptedPurchaseTerms, setAcceptedPurchaseTerms] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const requiresPayment = !siteId || !initialIsPaid;

  const palettes = useMemo(() => getTemplatePalettes(template.id), [template.id]);
  const templatePalette = palettes.find((item) => item.id === invite.paletteId);
  const resolvedPaletteId =
    invite.paletteId === "custom" || templatePalette ? invite.paletteId : template.defaultPaletteId;
  const effectiveInvite = useMemo(
    () => (resolvedPaletteId === invite.paletteId ? invite : { ...invite, paletteId: resolvedPaletteId }),
    [invite, resolvedPaletteId],
  );
  const palette =
    resolvedPaletteId === "custom"
      ? customPalette
      : templatePalette ?? palettes.find((item) => item.id === resolvedPaletteId) ?? palettes[0];
  const templateImages = templateKind === "silk" ? silkImages : inviteImages;
  const coverImage = effectiveInvite.coverImageUrl || templateImages.cover;
  const portraitImage = effectiveInvite.portraitImageUrl || templateImages.portrait;
  const venueImage = effectiveInvite.venueImageUrl || templateImages.venue;
  const ringColor = useMemo(
    () => createRingColor(effectiveInvite.ringMetal),
    [effectiveInvite.ringMetal],
  );
  const hasRingControls = template.coverType === "rings";
  const stepErrors = useMemo(() => getEditorStepErrors(effectiveInvite), [effectiveInvite]);
  const allErrors = stepErrors.slice(0, 3).flat();

  function openStep(index: number) {
    setActiveStep(index);
    setVisitedSteps((current) => new Set(current).add(index));
    setVisibleValidationStep(null);
  }

  function continueToNextStep() {
    if (stepErrors[activeStep].length > 0) {
      setVisibleValidationStep(activeStep);
      return;
    }

    openStep(Math.min(activeStep + 1, editorSteps.length - 1));
  }

  function updateInvite<Field extends keyof InviteState>(field: Field, value: InviteState[Field]) {
    setInvite((current) => ({ ...current, [field]: value }));

    if (field === "musicUrl") {
      setHasLocalMusic(typeof value === "string" && isLocalMusicSource(value));
    }
  }

  function addDressCodeColor() {
    setInvite((current) => ({
      ...current,
      dressCodeColors:
        current.dressCodeColors.length < 8
          ? [...current.dressCodeColors, palette.accent]
          : current.dressCodeColors,
    }));
  }

  function updateDressCodeColor(index: number, value: string) {
    setInvite((current) => ({
      ...current,
      dressCodeColors: current.dressCodeColors.map((color, itemIndex) =>
        itemIndex === index ? value : color,
      ),
    }));
  }

  function removeDressCodeColor(index: number) {
    setInvite((current) => ({
      ...current,
      dressCodeColors:
        current.dressCodeColors.length > 1
          ? current.dressCodeColors.filter((_, itemIndex) => itemIndex !== index)
          : current.dressCodeColors,
    }));
  }

  function addScheduleItem() {
    setInvite((current) => ({
      ...current,
      schedule:
        current.schedule.length < 10
          ? [...current.schedule, { time: "18:00", title: "Новый пункт", description: "" }]
          : current.schedule,
    }));
  }

  function updateScheduleItem<Field extends keyof InviteScheduleItem>(
    index: number,
    field: Field,
    value: InviteScheduleItem[Field],
  ) {
    setInvite((current) => ({
      ...current,
      schedule: current.schedule.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeScheduleItem(index: number) {
    setInvite((current) => ({
      ...current,
      schedule:
        current.schedule.length > 1
          ? current.schedule.filter((_, itemIndex) => itemIndex !== index)
          : current.schedule,
    }));
  }

  function addRsvpQuestion() {
    setInvite((current) => ({
      ...current,
      rsvpQuestions:
        current.rsvpQuestions.length < 8
          ? [
              ...current.rsvpQuestions,
              { title: "Новый вопрос", type: "single", options: ["Вариант 1", "Вариант 2"] },
            ]
          : current.rsvpQuestions,
    }));
  }

  function updateRsvpQuestion<Field extends keyof InviteRsvpQuestion>(
    index: number,
    field: Field,
    value: InviteRsvpQuestion[Field],
  ) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: current.rsvpQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  function removeRsvpQuestion(index: number) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: current.rsvpQuestions.filter((_, questionIndex) => questionIndex !== index),
    }));
  }

  function addRsvpOption(questionIndex: number) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: current.rsvpQuestions.map((question, index) =>
        index === questionIndex && question.options.length < 8
          ? { ...question, options: [...question.options, `Вариант ${question.options.length + 1}`] }
          : question,
      ),
    }));
  }

  function updateRsvpOption(questionIndex: number, optionIndex: number, value: string) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: current.rsvpQuestions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option, itemIndex) =>
                itemIndex === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    }));
  }

  function removeRsvpOption(questionIndex: number, optionIndex: number) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: current.rsvpQuestions.map((question, index) =>
        index === questionIndex && question.options.length > 2
          ? {
              ...question,
              options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex),
            }
          : question,
      ),
    }));
  }

  function selectPalette(paletteId: string) {
    setInvite((current) => ({ ...current, paletteId }));
  }

  function customizeSelectedPalette() {
    setCustomPalette({
      ...palette,
      id: "custom",
      label: "Своя",
      mood: `На основе «${palette.label}»`,
    });
    setInvite((current) => ({ ...current, paletteId: "custom" }));
    setPaletteMode("custom");
  }

  function updateCustomPalette(
    field: (typeof themeFields)[number]["field"],
    value: string,
  ) {
    setCustomPalette((current) => {
      const base =
        invite.paletteId === "custom"
          ? current
          : {
              ...palette,
              id: "custom",
              label: "Своя",
              mood: `На основе «${palette.label}»`,
            };
      const next = { ...base, [field]: value };

      if (field === "surface") {
        next.veil = hexToRgba(value, 0.84);
      }

      return next;
    });
    setInvite((current) => ({ ...current, paletteId: "custom" }));
  }

  function selectMusicFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setInvite((current) => ({
        ...current,
        musicEnabled: true,
        musicTitle: file.name.replace(/\.[^.]+$/, ""),
        musicUrl: reader.result as string,
      }));
      setHasLocalMusic(true);
      void saveLocalMusic(reader.result);
    });
    reader.readAsDataURL(file);
  }

  function selectImageFile(
    field: "coverImageUrl" | "portraitImageUrl" | "venueImageUrl",
    file: File | undefined,
  ) {
    if (!file) {
      return;
    }

    if (!imageUploadTypes.includes(file.type)) {
      setPhotoError("Поддерживаются только JPG, PNG, WEBP и GIF.");
      return;
    }

    if (file.size > maxImageUploadBytes) {
      setPhotoError("Фото должно быть меньше 8 МБ.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setPhotoError(null);
      updateInvite(field, reader.result);
    });
    reader.readAsDataURL(file);
  }

  function resetImage(field: "coverImageUrl" | "portraitImageUrl" | "venueImageUrl") {
    setPhotoError(null);
    updateInvite(field, "");
  }

  async function publishSite() {
    if (isPublishing) {
      return;
    }

    if (allErrors.length > 0) {
      const firstInvalidStep = stepErrors.findIndex((errors) => errors.length > 0);
      openStep(firstInvalidStep < 0 ? 0 : firstInvalidStep);
      setVisibleValidationStep(firstInvalidStep < 0 ? 0 : firstInvalidStep);
      return;
    }

    const returnTo = siteId
      ? `/editor?site=${encodeURIComponent(siteId)}&template=${encodeURIComponent(template.id)}`
      : `/editor?template=${encodeURIComponent(template.id)}`;

    if (!isAuthenticated) {
      router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (requiresPayment && !acceptedPurchaseTerms) {
      setPublishError("Подтвердите согласие с офертой и условиями оплаты.");
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
        const { ok, result, status } = await startInviteSiteCheckout(payload, siteId);

        if (status === 401) {
          router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }

        if (!ok || !result.action || !result.fields) {
          throw new Error(result.error ?? "Не удалось перейти к оплате.");
        }

        submitRobokassaForm(result.action, result.fields);
        return;
      }

      const { ok, result, status } = await saveInviteSite(payload, siteId);

      if (status === 401) {
        router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
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

  useEffect(() => {
    if (siteId) {
      return;
    }

    const savingTimeout = window.setTimeout(() => setSaveStatus("saving"), 0);
    const timeout = window.setTimeout(() => {
      const didSave = saveEditorDraft(
        {
          customPalette,
          hasLocalMusic,
          invite: effectiveInvite,
          version: 2,
        },
        template.id,
      );
      setSaveStatus(didSave ? "saved" : "error");
    }, 450);

    return () => {
      window.clearTimeout(savingTimeout);
      window.clearTimeout(timeout);
    };
  }, [customPalette, effectiveInvite, hasLocalMusic, siteId, template.id]);

  useEffect(() => {
    if (!initialDraft?.hasLocalMusic || initialDraft.invite.musicUrl) {
      return;
    }

    let isActive = true;

    void readLocalMusic().then((musicUrl) => {
      if (!isActive) {
        return;
      }

      if (musicUrl) {
        setInvite((current) => ({ ...current, musicUrl }));
      } else {
        setHasLocalMusic(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [initialDraft]);

  useEffect(() => {
    if (!isFullscreenPreview) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreenPreview(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreenPreview]);

  return {
    acceptedPurchaseTerms,
    activeStep,
    allErrors,
    continueToNextStep,
    coverImage,
    customPalette,
    effectiveInvite,
    hasRingControls,
    invite,
    isFullscreenPreview,
    isPublishing,
    isWideTemplate,
    mobileView,
    openStep,
    palette,
    paletteMode,
    palettes,
    photoError,
    portraitImage,
    previewDevice,
    publishError,
    publishSite,
    requiresPayment,
    resolvedPaletteId,
    ringColor,
    saveStatus,
    setAcceptedPurchaseTerms,
    setIsFullscreenPreview,
    setMobileView,
    setPaletteMode,
    setPreviewDevice,
    siteId,
    stepErrors,
    template,
    templateKind,
    venueImage,
    visibleValidationStep,
    visitedSteps,
    addDressCodeColor,
    addRsvpOption,
    addRsvpQuestion,
    addScheduleItem,
    customizeSelectedPalette,
    removeDressCodeColor,
    removeRsvpOption,
    removeRsvpQuestion,
    removeScheduleItem,
    resetImage,
    selectImageFile,
    selectMusicFile,
    selectPalette,
    updateCustomPalette,
    updateDressCodeColor,
    updateInvite,
    updateRsvpOption,
    updateRsvpQuestion,
    updateScheduleItem,
  };
}

export type InvitationBuilderController = ReturnType<typeof useInvitationBuilder>;
