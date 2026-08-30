"use client";

import type { InviteTemplate } from "@/lib/invite-templates";
import { getTemplateKind } from "@/lib/invite-templates";
import type {
  InviteRsvpQuestion,
  InviteScheduleItem,
  InviteState,
} from "@/lib/invite-state";
import { normalizeInviteState } from "@/lib/invite-state";
import {
  createRingColor,
  defaultCustomPalette,
  getTemplatePalettes,
  hexToRgba,
  inviteImages,
  resolveTemplatePaletteId,
  templateImagesByKind,
  type InvitePalette,
} from "@/lib/invite-theme";
import { useEffect, useMemo, useState } from "react";
import { addToList, removeFromList, updateAt } from "./lib/list-field-utils";
import { prepareImageUpload } from "./lib/prepare-image-upload";
import { themeFields } from "./constants";
import {
  isLocalMusicSource,
  readEditorDraft,
  readLocalMusic,
  saveEditorDraft,
  saveLocalMusic,
} from "./editor-draft";
import { getTemplateMusicPreset, isTemplateDemoMusicUrl } from "./music-tracks";
import { getInitialInvite } from "./template-presets";
import type { SaveStatus } from "./types";

type UseInviteEditorStateArgs = {
  initialInvite?: InviteState;
  initialPalette?: InvitePalette;
  initialPaletteId?: string;
  siteId?: string;
  template: InviteTemplate;
};

export function useInviteEditorState({
  initialInvite,
  initialPalette,
  initialPaletteId,
  siteId,
  template,
}: UseInviteEditorStateArgs) {
  const [initialDraft, setInitialDraft] = useState<ReturnType<typeof readEditorDraft>>(null);
  const [invite, setInvite] = useState<InviteState>(() => {
    const resolvedInvite = initialInvite
      ? normalizeInviteState(initialInvite)
      : getInitialInvite(template);

    return initialPaletteId
      ? {
          ...resolvedInvite,
          paletteId: resolveTemplatePaletteId(template, initialPaletteId),
        }
      : resolvedInvite;
  });
  const [customPalette, setCustomPalette] = useState<InvitePalette>(
    () => initialPalette ?? defaultCustomPalette,
  );
  const [hasLocalMusic, setHasLocalMusic] = useState(false);
  const [paletteMode, setPaletteMode] = useState<"custom" | "presets">("presets");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const templateKind = getTemplateKind(template.id);
  const palettes = useMemo(() => getTemplatePalettes(template.id), [template.id]);
  const hasMatchingTemplatePalette = palettes.some((item) => item.id === invite.paletteId);
  const resolvedPaletteId =
    invite.paletteId === "custom" || hasMatchingTemplatePalette
      ? invite.paletteId
      : template.defaultPaletteId;
  const effectiveInvite = useMemo(
    () => (resolvedPaletteId === invite.paletteId ? invite : { ...invite, paletteId: resolvedPaletteId }),
    [invite, resolvedPaletteId],
  );
  const palette =
    resolvedPaletteId === "custom"
      ? customPalette
      : palettes.find((item) => item.id === resolvedPaletteId) ?? palettes[0];
  const templateImages = templateImagesByKind[templateKind] ?? inviteImages;
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
  const hasUnsavedChanges = lastSafeEditorSnapshot !== currentEditorSnapshot;

  function updateInvite<Field extends keyof InviteState>(field: Field, value: InviteState[Field]) {
    setInvite((current) => ({ ...current, [field]: value }));

    if (field === "musicUrl") {
      setHasLocalMusic(typeof value === "string" && isLocalMusicSource(value));
    }
  }

  function addDressCodeColor() {
    setInvite((current) => ({
      ...current,
      dressCodeColors: addToList(current.dressCodeColors, 8, palette.accent),
    }));
  }

  function updateDressCodeColor(index: number, value: string) {
    setInvite((current) => ({
      ...current,
      dressCodeColors: updateAt(current.dressCodeColors, index, () => value),
    }));
  }

  function removeDressCodeColor(index: number) {
    setInvite((current) => ({
      ...current,
      dressCodeColors: removeFromList(current.dressCodeColors, 1, index),
    }));
  }

  function addScheduleItem() {
    setInvite((current) => ({
      ...current,
      schedule: addToList(current.schedule, 10, {
        time: "18:00",
        title: "Новый пункт",
        description: "",
      }),
    }));
  }

  function updateScheduleItem<Field extends keyof InviteScheduleItem>(
    index: number,
    field: Field,
    value: InviteScheduleItem[Field],
  ) {
    setInvite((current) => ({
      ...current,
      schedule: updateAt(current.schedule, index, (item) => ({ ...item, [field]: value })),
    }));
  }

  function removeScheduleItem(index: number) {
    setInvite((current) => ({
      ...current,
      schedule: removeFromList(current.schedule, 1, index),
    }));
  }

  function addRsvpQuestion() {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: addToList(current.rsvpQuestions, 8, {
        title: "Новый вопрос",
        type: "single",
        options: ["Вариант 1", "Вариант 2"],
      }),
    }));
  }

  function updateRsvpQuestion<Field extends keyof InviteRsvpQuestion>(
    index: number,
    field: Field,
    value: InviteRsvpQuestion[Field],
  ) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: updateAt(current.rsvpQuestions, index, (question) => ({
        ...question,
        [field]: value,
      })),
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
      rsvpQuestions: updateAt(current.rsvpQuestions, questionIndex, (question) => ({
        ...question,
        options: addToList(question.options, 8, `Вариант ${question.options.length + 1}`),
      })),
    }));
  }

  function updateRsvpOption(questionIndex: number, optionIndex: number, value: string) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: updateAt(current.rsvpQuestions, questionIndex, (question) => ({
        ...question,
        options: updateAt(question.options, optionIndex, () => value),
      })),
    }));
  }

  function removeRsvpOption(questionIndex: number, optionIndex: number) {
    setInvite((current) => ({
      ...current,
      rsvpQuestions: updateAt(current.rsvpQuestions, questionIndex, (question) => ({
        ...question,
        options: removeFromList(question.options, 2, optionIndex),
      })),
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

    const draft = readEditorDraft();

    if (!draft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const normalizedDraftInvite = normalizeInviteState(draft.invite);
      // Демо-музыка принадлежит шаблону, а не черновику: иначе трек первого открытого
      // шаблона звучал бы на всех остальных. Свою загрузку и выбранный из библиотеки
      // трек не трогаем — заменяем только чужое демо.
      const inviteWithTemplateMusic =
        !draft.hasLocalMusic && isTemplateDemoMusicUrl(normalizedDraftInvite.musicUrl)
          ? {
              ...normalizedDraftInvite,
              ...getTemplateMusicPreset(template.id),
              // Пресет включает музыку — но если гость её выключил, это его выбор.
              musicEnabled: normalizedDraftInvite.musicEnabled,
            }
          : normalizedDraftInvite;
      const inviteFromDraft = initialPaletteId
        ? {
            ...inviteWithTemplateMusic,
            paletteId: resolveTemplatePaletteId(template, initialPaletteId),
          }
        : inviteWithTemplateMusic;
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

  useEffect(() => {
    if (siteId) {
      return;
    }

    const snapshot = currentEditorSnapshot;
    const savingTimeout = window.setTimeout(() => setSaveStatus("saving"), 0);
    const timeout = window.setTimeout(() => {
      const didSave = saveEditorDraft({
        customPalette,
        hasLocalMusic,
        invite: effectiveInvite,
        version: 2,
      });
      if (didSave) {
        setLastSafeEditorSnapshot(snapshot);
      }
      setSaveStatus(didSave ? "saved" : "error");
    }, 450);

    return () => {
      window.clearTimeout(savingTimeout);
      window.clearTimeout(timeout);
    };
  }, [customPalette, currentEditorSnapshot, effectiveInvite, hasLocalMusic, siteId]);

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

  return {
    addDressCodeColor,
    addRsvpOption,
    addRsvpQuestion,
    addScheduleItem,
    coverImage,
    customPalette,
    customizeSelectedPalette,
    effectiveInvite,
    hasUnsavedChanges,
    invite,
    palette,
    paletteMode,
    palettes,
    photoError,
    portraitImage,
    removeDressCodeColor,
    removeRsvpOption,
    removeRsvpQuestion,
    removeScheduleItem,
    resetImage,
    resolvedPaletteId,
    ringColor,
    saveStatus,
    selectImageFile,
    selectMusicFile,
    selectPalette,
    setPaletteMode,
    templateKind,
    updateCustomPalette,
    updateDressCodeColor,
    updateInvite,
    updateRsvpOption,
    updateRsvpQuestion,
    updateScheduleItem,
    venueImage,
  };
}
