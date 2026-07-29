"use client";

import type { CreateInviteSitePayload } from "@/lib/invite-site-types";
import { previewPromoCode } from "@/lib/api/payments";
import {
  saveInviteSite,
  startInviteSiteCheckout,
  submitRobokassaForm,
} from "@/lib/api/sites";
import { getListPromoPricing } from "@/lib/commerce";
import {
  getTemplateKind,
} from "@/lib/invite-templates";
import type {
  InviteRsvpQuestion,
  InviteScheduleItem,
  InviteState,
} from "@/lib/invite-state";
import { normalizeInviteState } from "@/lib/invite-state";
import {
  alpineImages,
  aquaImages,
  chapterImages,
  chromeImages,
  clarityImages,
  createRingColor,
  crimsonImages,
  defaultCustomPalette,
  electricImages,
  getTemplatePalettes,
  hexToRgba,
  inviteImages,
  minimalImages,
  resolveTemplatePaletteId,
  silkImages,
  type InvitePalette,
} from "@/lib/invite-theme";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prepareImageUpload } from "./lib/prepare-image-upload";
import { themeFields, editorStepIds, editorSteps } from "./constants";
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

const leaveEditorMessage =
  "Есть несохраненные изменения. Выйти из редактора без сохранения?";

export type AppliedPromo = {
  amount: string;
  discountAmount: string;
  originalAmount: string;
  promoCode: string;
};

export function useInvitationBuilder({
  initialInvite,
  initialIsFullscreenPreview = false,
  initialIsPaid = false,
  initialPalette,
  initialPaletteId,
  initialStep = 0,
  isAuthenticated,
  siteId,
  template,
}: InvitationBuilderProps) {
  const router = useRouter();
  const templateKind = getTemplateKind(template.id);
  const isWideTemplate = templateKind !== "alpine";
  const [initialDraft, setInitialDraft] = useState<ReturnType<typeof readEditorDraft>>(null);

  const [invite, setInvite] = useState<InviteState>(
    () => {
      const resolvedInvite = initialInvite
        ? normalizeInviteState(initialInvite)
        : getInitialInvite(template);

      return initialPaletteId
        ? {
            ...resolvedInvite,
            paletteId: resolveTemplatePaletteId(template, initialPaletteId),
          }
        : resolvedInvite;
    },
  );
  const [customPalette, setCustomPalette] = useState<InvitePalette>(
    () => initialPalette ?? defaultCustomPalette,
  );
  const [hasLocalMusic, setHasLocalMusic] = useState(false);
  const [activeStep, setActiveStep] = useState(initialStep);
  const [visitedSteps, setVisitedSteps] = useState(() => new Set<number>([initialStep]));
  const [visibleValidationStep, setVisibleValidationStep] = useState<number | null>(null);
  const [paletteMode, setPaletteMode] = useState<"custom" | "presets">("presets");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(initialIsFullscreenPreview);
  const [isTemplateEntryPreview, setIsTemplateEntryPreview] = useState(initialIsFullscreenPreview);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isPublishing, setIsPublishing] = useState(false);
  const [acceptedPurchaseTerms, setAcceptedPurchaseTerms] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const requiresPayment = !siteId || !initialIsPaid;
  const checkoutPricing = appliedPromo ?? getListPromoPricing();

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
  const templateImages =
    templateKind === "alpine"
      ? alpineImages
      : templateKind === "aqua"
        ? aquaImages
        : templateKind === "chrome"
          ? chromeImages
          : templateKind === "crimson"
            ? crimsonImages
            : templateKind === "silk"
              ? silkImages
              : templateKind === "electric"
                ? electricImages
                : templateKind === "minimal"
                  ? minimalImages
                  : templateKind === "clarity"
                    ? clarityImages
                    : templateKind === "chapter"
                      ? chapterImages
                      : inviteImages;
  const coverImage = effectiveInvite.coverImageUrl || templateImages.cover;
  const portraitImage = effectiveInvite.portraitImageUrl || templateImages.portrait;
  const venueImage = effectiveInvite.venueImageUrl || templateImages.venue;
  const ringColor = useMemo(
    () => createRingColor(effectiveInvite.ringMetal),
    [effectiveInvite.ringMetal],
  );
  const currentEditorSnapshot = useMemo(
    () =>
      JSON.stringify({
        customPalette,
        hasLocalMusic,
        invite: effectiveInvite,
      }),
    [customPalette, effectiveInvite, hasLocalMusic],
  );
  const [lastSafeEditorSnapshot, setLastSafeEditorSnapshot] = useState(currentEditorSnapshot);
  const hasHistoryGuardRef = useRef(false);
  const ignoreNextPopStateRef = useRef(false);
  const shouldWarnBeforeLeaveRef = useRef(false);
  const activeStepRef = useRef(initialStep);
  const isFullscreenPreviewRef = useRef(initialIsFullscreenPreview);
  const hasRingControls = template.coverType === "rings";
  const stepErrors = useMemo(() => getEditorStepErrors(effectiveInvite), [effectiveInvite]);
  const allErrors = stepErrors.slice(0, 3).flat();
  const hasUnsavedChanges = lastSafeEditorSnapshot !== currentEditorSnapshot;
  const shouldWarnBeforeLeave = !isPublishing && hasUnsavedChanges;

  function confirmLeaveEditor() {
    if (!shouldWarnBeforeLeave) {
      return true;
    }

    return window.confirm(leaveEditorMessage);
  }

  const updateEditorUrl = useCallback(
    (step: number, preview: boolean, mode: "push" | "replace") => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", editorStepIds[step] ?? editorStepIds[0]);

      if (preview) {
        url.searchParams.set("preview", "1");
      } else {
        url.searchParams.delete("preview");
      }

      window.history[`${mode}State`](
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: false,
          editorPreviewEntry: preview && mode === "push",
          editorView: true,
        },
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    },
    [],
  );

  function openStep(index: number) {
    if (index !== activeStepRef.current || isFullscreenPreviewRef.current) {
      updateEditorUrl(index, false, "push");
    }

    activeStepRef.current = index;
    isFullscreenPreviewRef.current = false;
    setActiveStep(index);
    setIsFullscreenPreview(false);
    setIsTemplateEntryPreview(false);
    setVisitedSteps((current) => new Set(current).add(index));
    setVisibleValidationStep(null);

    if (window.matchMedia("(max-width: 899px)").matches) {
      window.scrollTo({ top: 0 });
    }
  }

  const setFullscreenPreview = useCallback(
    (nextValue: boolean) => {
      if (nextValue === isFullscreenPreviewRef.current) {
        return;
      }

      if (!nextValue) {
        setIsTemplateEntryPreview(false);
      }

      if (!nextValue && window.history.state?.editorPreviewEntry) {
        window.history.back();
        return;
      }

      updateEditorUrl(activeStepRef.current, nextValue, nextValue ? "push" : "replace");
      isFullscreenPreviewRef.current = nextValue;
      setIsFullscreenPreview(nextValue);
    },
    [updateEditorUrl],
  );

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

  async function selectImageFile(
    field: "coverImageUrl" | "portraitImageUrl" | "venueImageUrl",
    file: File | undefined,
  ) {
    if (!file) {
      return;
    }

    try {
      const dataUrl = await prepareImageUpload(file);
      setPhotoError(null);
      updateInvite(field, dataUrl);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";

      if (reason === "size") {
        setPhotoError("Фото должно быть меньше 8 МБ.");
        return;
      }

      if (reason === "heic") {
        setPhotoError(
          "Этот формат не открылся в браузере. Сохраните фото как JPG в галерее и загрузите снова.",
        );
        return;
      }

      if (reason === "type") {
        setPhotoError("Поддерживаются JPG, PNG, WEBP, GIF и HEIC.");
        return;
      }

      setPhotoError("Не удалось обработать фото. Попробуйте другой файл.");
    }
  }

  function resetImage(field: "coverImageUrl" | "portraitImageUrl" | "venueImageUrl") {
    setPhotoError(null);
    updateInvite(field, "");
  }

  useEffect(() => {
    if (siteId) {
      return;
    }

    const draft = readEditorDraft(template.id);

    if (!draft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const normalizedDraftInvite = normalizeInviteState(draft.invite);
      const inviteFromDraft = initialPaletteId
        ? {
            ...normalizedDraftInvite,
            paletteId: resolveTemplatePaletteId(template, initialPaletteId),
          }
        : normalizedDraftInvite;
      setInitialDraft(draft);
      setInvite(inviteFromDraft);
      setCustomPalette(draft.customPalette);
      setHasLocalMusic(draft.hasLocalMusic);
      setPaletteMode(inviteFromDraft.paletteId === "custom" ? "custom" : "presets");
      setLastSafeEditorSnapshot(
        JSON.stringify({
          customPalette: draft.customPalette,
          hasLocalMusic: draft.hasLocalMusic,
          invite: inviteFromDraft,
        }),
      );
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [initialPaletteId, siteId, template]);

  async function applyPromoCode() {
    if (isApplyingPromo || !requiresPayment) {
      return;
    }

    const code = promoCodeInput.trim();

    if (!code) {
      setPromoError("Введите промокод.");
      return;
    }

    const returnTo = siteId
      ? `/editor?site=${encodeURIComponent(siteId)}&template=${encodeURIComponent(template.id)}`
      : `/editor?template=${encodeURIComponent(template.id)}`;

    if (!isAuthenticated) {
      router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      const { ok, result, status } = await previewPromoCode(code);

      if (status === 401) {
        router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
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

    if (
      requiresPayment &&
      promoCodeInput.trim() &&
      (!appliedPromo || appliedPromo.promoCode !== promoCodeInput.trim().toUpperCase())
    ) {
      setPublishError("Сначала нажмите «Применить», чтобы активировать промокод.");
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
        );

        if (status === 401) {
          router.push(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
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

    const snapshot = currentEditorSnapshot;
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
      if (didSave) {
        setLastSafeEditorSnapshot(snapshot);
      }
      setSaveStatus(didSave ? "saved" : "error");
    }, 450);

    return () => {
      window.clearTimeout(savingTimeout);
      window.clearTimeout(timeout);
    };
  }, [customPalette, currentEditorSnapshot, effectiveInvite, hasLocalMusic, siteId, template.id]);

  useEffect(() => {
    shouldWarnBeforeLeaveRef.current = shouldWarnBeforeLeave;
  }, [shouldWarnBeforeLeave]);

  useEffect(() => {
    updateEditorUrl(activeStepRef.current, isFullscreenPreviewRef.current, "replace");
  }, [updateEditorUrl]);

  useEffect(() => {
    if (!shouldWarnBeforeLeave) {
      return;
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [shouldWarnBeforeLeave]);

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }

      const url = new URL(window.location.href);

      if (url.pathname === "/editor") {
        if (event.state?.editorLeaveGuard && !shouldWarnBeforeLeaveRef.current) {
          window.history.back();
          return;
        }

        const stepId = url.searchParams.get("step");
        const nextStep = Math.max(0, editorStepIds.findIndex((item) => item === stepId));
        const nextPreview = url.searchParams.get("preview") === "1";
        const didStepChange = nextStep !== activeStepRef.current;

        activeStepRef.current = nextStep;
        isFullscreenPreviewRef.current = nextPreview;
        setActiveStep(nextStep);
        setIsFullscreenPreview(nextPreview);
        if (!nextPreview) {
          setIsTemplateEntryPreview(false);
        }
        setVisitedSteps((current) => new Set(current).add(nextStep));
        setVisibleValidationStep(null);

        if (didStepChange && window.matchMedia("(max-width: 899px)").matches) {
          window.scrollTo({ top: 0 });
        }
        return;
      }

      if (!shouldWarnBeforeLeaveRef.current) {
        return;
      }

      if (window.confirm(leaveEditorMessage)) {
        shouldWarnBeforeLeaveRef.current = false;
        hasHistoryGuardRef.current = false;
        window.history.back();
        return;
      }

      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: true,
        },
        "",
        window.location.href,
      );
      hasHistoryGuardRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (shouldWarnBeforeLeave && !hasHistoryGuardRef.current) {
      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          editorLeaveGuard: true,
        },
        "",
        window.location.href,
      );
      hasHistoryGuardRef.current = true;
      return;
    }

    if (!shouldWarnBeforeLeave && hasHistoryGuardRef.current && !isPublishing) {
      hasHistoryGuardRef.current = false;

      if (window.history.state?.editorLeaveGuard) {
        ignoreNextPopStateRef.current = true;
        window.history.back();
      }
    }
  }, [isPublishing, shouldWarnBeforeLeave]);

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
        setFullscreenPreview(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreenPreview, setFullscreenPreview]);

  return {
    acceptedPurchaseTerms,
    activeStep,
    allErrors,
    appliedPromo,
    applyPromoCode,
    checkoutPricing,
    clearPromoCode,
    continueToNextStep,
    coverImage,
    confirmLeaveEditor,
    customPalette,
    effectiveInvite,
    hasRingControls,
    invite,
    isApplyingPromo,
    isFullscreenPreview,
    isPublishing,
    isTemplateEntryPreview,
    isWideTemplate,
    openStep,
    palette,
    paletteMode,
    palettes,
    photoError,
    portraitImage,
    previewDevice,
    promoCodeInput,
    promoError,
    publishError,
    publishSite,
    requiresPayment,
    resolvedPaletteId,
    ringColor,
    saveStatus,
    setAcceptedPurchaseTerms,
    setIsFullscreenPreview: setFullscreenPreview,
    setPaletteMode,
    setPreviewDevice,
    setPromoCodeInput,
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
