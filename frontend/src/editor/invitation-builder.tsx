"use client";

import { Button } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  ExternalLink,
  Heart,
  ImagePlus,
  Maximize2,
  MapPin,
  Minimize2,
  Monitor,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import type { InviteTemplate } from "@/lib/invite-templates";
import type { CreateInviteSitePayload } from "@/lib/invite-site-types";
import { saveInviteSite } from "@/lib/api/sites";
import { InviteSiteRenderer } from "@/components/invite-site-renderer";
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
  type InviteVars,
} from "@/lib/invite-theme";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FieldGroup, MobilePreviewFrame, TextAreaField, TextInput } from "./components";
import {
  readEditorDraft,
  readLocalMusic,
  saveEditorDraft,
  saveLocalMusic,
  isLocalMusicSource,
} from "./editor-draft";
import { getInitialInvite } from "./template-presets";
import { getYandexMapsUrl } from "@/lib/invite-map";

const maxImageUploadBytes = 8 * 1024 * 1024;
const imageUploadTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type { InviteState, InviteVars };

const editorSteps = [
  {
    title: "Содержание",
    description: "Пара, дата и место",
    icon: Heart,
  },
  {
    title: "Программа",
    description: "Расписание и дресс-код",
    icon: CalendarDays,
  },
  {
    title: "Гости",
    description: "Анкета подтверждения",
    icon: Users,
  },
  {
    title: "Медиа",
    description: "Фотографии и музыка",
    icon: ImagePlus,
  },
  {
    title: "Дизайн",
    description: "Шаблон и палитра",
    icon: Palette,
  },
  {
    title: "Публикация",
    description: "Проверка и запуск",
    icon: Send,
  },
] as const;

type SaveStatus = "error" | "saved" | "saving";

function getEditorStepErrors(invite: InviteState) {
  const basicErrors = [
    !invite.groom.trim() ? "Укажите имя жениха" : null,
    !invite.bride.trim() ? "Укажите имя невесты" : null,
    !invite.date ? "Укажите дату события" : null,
    !invite.time ? "Укажите время события" : null,
    !invite.city.trim() ? "Укажите город" : null,
    !invite.venue.trim() ? "Укажите площадку" : null,
    !invite.address.trim() ? "Укажите адрес" : null,
    invite.mapUrl?.trim() && !getYandexMapsUrl(invite.mapUrl)
      ? "Добавьте корректную ссылку на место в Яндекс Картах"
      : null,
  ].filter((error): error is string => Boolean(error));
  const scheduleErrors = invite.schedule.some(
    (item) => !item.time || !item.title.trim(),
  )
    ? ["Заполните время и название каждого события"]
    : [];
  const guestErrors = !invite.showRsvp
    ? []
    : [
        !invite.rsvpDate ? "Укажите срок ответа гостей" : null,
        invite.rsvpQuestions.length === 0 ? "Добавьте хотя бы один вопрос" : null,
        invite.rsvpQuestions.some(
          (question) =>
            !question.title.trim() ||
            question.options.length < 2 ||
            question.options.some((option) => !option.trim()),
        )
          ? "Заполните вопросы и добавьте минимум два варианта ответа"
          : null,
      ].filter((error): error is string => Boolean(error));

  return [basicErrors, scheduleErrors, guestErrors, [], [], []] as const;
}

const themeFields: Array<{
  field: keyof Pick<
    InvitePalette,
    "background" | "surface" | "ink" | "muted" | "photoText" | "accent" | "line"
  >;
  label: string;
  description: string;
}> = [
  { field: "background", label: "Фон", description: "Основной цвет страницы" },
  { field: "surface", label: "Панели", description: "Секции и формы" },
  { field: "ink", label: "Основной текст", description: "Заголовки и важные детали" },
  { field: "muted", label: "Вторичный текст", description: "Подписи и пояснения" },
  { field: "photoText", label: "Текст на фото", description: "Текст поверх изображений" },
  { field: "accent", label: "Акцент", description: "Кнопки и выделения" },
  { field: "line", label: "Линии", description: "Границы и разделители" },
];


type InvitationBuilderProps = {
  initialInvite?: InviteState;
  initialPalette?: InvitePalette;
  isAuthenticated: boolean;
  siteId?: string;
  template: InviteTemplate;
};

export default function InvitationBuilder({
  initialInvite,
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
  const [publishError, setPublishError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

    setIsPublishing(true);
    setPublishError(null);

    const payload: CreateInviteSitePayload = {
      invite: effectiveInvite,
      palette,
      templateId: template.id,
    };

    try {
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

      router.push(siteId ? "/dashboard" : result.url);
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : siteId
            ? "Не удалось сохранить изменения."
            : "Не удалось создать сайт.",
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

  function renderInvitation() {
    return (
      <InviteSiteRenderer
        asMain={false}
        className={`published-site published-site--${templateKind}`}
        invite={effectiveInvite}
        palette={palette}
        siteId={siteId}
        template={template}
      />
    );
  }

  return (
    <main className="editor-shell">
      {isFullscreenPreview ? (
        <section className="fullscreen-preview" aria-label="Полноэкранный предпросмотр">
          <div className="fullscreen-preview__toolbar">
            <div>
              <Eye aria-hidden size={14} />
              <span>Так приглашение увидят гости</span>
            </div>
            <div className="fullscreen-preview__actions">
              <Button
                className="fullscreen-preview__action fullscreen-preview__action--close"
                onClick={() => setIsFullscreenPreview(false)}
                type="button"
                variant="primary"
              >
                <Minimize2 aria-hidden size={15} />
                <span>Вернуться в редактор</span>
              </Button>
            </div>
          </div>
          <div
            className={`fullscreen-preview__page ${
              isWideTemplate
                ? "fullscreen-preview__page--wide"
                : "fullscreen-preview__page--alpine"
            }`}
          >
            {renderInvitation()}
          </div>
        </section>
      ) : (
      <div className={`editor-layout ${mobileView === "preview" ? "is-mobile-preview" : ""}`}>
        <aside className="editor-sidebar">
          <div className="editor-sidebar__topbar">
            <Link className="editor-back" href="/templates">
              <ArrowLeft aria-hidden size={15} />
              Шаблоны
            </Link>
            <Link aria-label="На главную" className="editor-brand" href="/">
              <Heart aria-hidden size={14} />
              Invite
            </Link>
            <span
              aria-live="polite"
              className={`editor-save-status is-${saveStatus}`}
            >
              {siteId ? (
                <><Save aria-hidden size={13} /> Сохранение вручную</>
              ) : saveStatus === "saving" ? (
                <><Save aria-hidden size={13} /> Сохраняем…</>
              ) : saveStatus === "error" ? (
                <><AlertCircle aria-hidden size={13} /> Не сохранено</>
              ) : (
                <><Check aria-hidden size={13} /> Сохранено</>
              )}
            </span>
            <button
              className="editor-preview-jump"
              onClick={() => setMobileView("preview")}
              type="button"
            >
              <Eye aria-hidden size={14} />
              Предпросмотр
            </button>
          </div>

          <div className="editor-sidebar__intro">
            <div className="editor-sidebar__kicker">
              <Sparkles aria-hidden size={13} />
              Редактор приглашения
            </div>
            <h1>{template.name}</h1>
            <p>{template.description}</p>
          </div>

          <nav aria-label="Этапы создания приглашения" className="editor-steps">
            {editorSteps.map((step, index) => {
              const StepIcon = step.icon;

              return (
                <button
                  aria-current={activeStep === index ? "step" : undefined}
                  className={`editor-step ${activeStep === index ? "is-active" : ""} ${
                    visitedSteps.has(index) && stepErrors[index].length === 0 && index < 5
                      ? "is-complete"
                      : ""
                  } ${
                    visibleValidationStep === index && stepErrors[index].length > 0
                      ? "has-error"
                      : ""
                  }`}
                  key={step.title}
                  onClick={() => openStep(index)}
                  type="button"
                >
                  <span className="editor-step__icon">
                    {visitedSteps.has(index) && stepErrors[index].length === 0 && index < 5 ? (
                      <Check aria-hidden size={15} />
                    ) : (
                      <StepIcon aria-hidden size={15} />
                    )}
                  </span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.description}</small>
                  </span>
                  <span className="editor-step__number">{index + 1}</span>
                </button>
              );
            })}
          </nav>

          <div className="editor-form">
            <section className={activeStep === 0 ? "editor-step-panel is-active" : "editor-step-panel"}>
            <FieldGroup title="Пара">
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  label="Жених"
                  value={invite.groom}
                  onChange={(value) => updateInvite("groom", value)}
                />
                <TextInput
                  label="Невеста"
                  value={invite.bride}
                  onChange={(value) => updateInvite("bride", value)}
                />
              </div>
              <TextAreaField
                label="Текст приглашения"
                value={invite.lead}
                onChange={(value) => updateInvite("lead", value)}
              />
            </FieldGroup>

            <FieldGroup title="Событие">
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  label="Дата"
                  type="date"
                  value={invite.date}
                  onChange={(value) => updateInvite("date", value)}
                />
                <TextInput
                  label="Время"
                  type="time"
                  value={invite.time}
                  onChange={(value) => updateInvite("time", value)}
                />
              </div>
              <TextInput
                label="Город"
                value={invite.city}
                onChange={(value) => updateInvite("city", value)}
              />
              <TextInput
                label="Площадка"
                value={invite.venue}
                onChange={(value) => updateInvite("venue", value)}
              />
              <TextInput
                label="Адрес"
                value={invite.address}
                onChange={(value) => updateInvite("address", value)}
              />
              <div className="editor-map-field">
                <div className="editor-map-field__heading">
                  <MapPin aria-hidden size={17} />
                  <div>
                    <strong>Точка на Яндекс Картах</strong>
                    <span>Необязательно</span>
                  </div>
                </div>
                <TextInput
                  label="Ссылка на место"
                  value={invite.mapUrl ?? ""}
                  onChange={(value) => updateInvite("mapUrl", value)}
                />
                <p>
                  Откройте место в Яндекс Картах, нажмите «Поделиться» и вставьте
                  полученную ссылку.
                </p>
                {getYandexMapsUrl(invite.mapUrl) ? (
                  <a
                    href={getYandexMapsUrl(invite.mapUrl) ?? undefined}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden size={14} />
                    Проверить точку
                  </a>
                ) : null}
              </div>
            </FieldGroup>
            </section>

            <section className={activeStep === 1 ? "editor-step-panel is-active" : "editor-step-panel"}>
            <FieldGroup title="Расписание">
              <div className="editor-schedule">
                {invite.schedule.map((item, index) => (
                  <div className="editor-schedule__item" key={`schedule-${index}`}>
                    <div className="editor-schedule__item-head">
                      <span>Событие {index + 1}</span>
                      <Button
                        aria-label={`Удалить событие ${index + 1}`}
                        className="editor-dress-code__remove"
                        isDisabled={invite.schedule.length <= 1}
                        onClick={() => removeScheduleItem(index)}
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden size={13} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-[92px_1fr] gap-2">
                      <TextInput
                        label="Время"
                        type="time"
                        value={item.time}
                        onChange={(value) => updateScheduleItem(index, "time", value)}
                      />
                      <TextInput
                        label="Название"
                        value={item.title}
                        onChange={(value) => updateScheduleItem(index, "title", value)}
                      />
                    </div>
                    <TextInput
                      label="Описание"
                      value={item.description}
                      onChange={(value) => updateScheduleItem(index, "description", value)}
                    />
                  </div>
                ))}
                <Button
                  className="editor-schedule__add"
                  isDisabled={invite.schedule.length >= 10}
                  onClick={addScheduleItem}
                  type="button"
                  variant="outline"
                >
                  <Plus aria-hidden size={14} />
                  Добавить событие
                </Button>
              </div>
            </FieldGroup>

            <FieldGroup title="Дресс-код">
              <TextAreaField
                label="Текст для гостей"
                value={invite.dressCode}
                onChange={(value) => updateInvite("dressCode", value)}
              />
              <div className="editor-dress-code">
                <div className="editor-dress-code__head">
                  <div>
                    <p>Цвета палитры</p>
                    <span>Выберите до восьми оттенков, которые увидят гости</span>
                  </div>
                  <Button
                    className="editor-dress-code__add"
                    isDisabled={invite.dressCodeColors.length >= 8}
                    onClick={addDressCodeColor}
                    type="button"
                    variant="outline"
                  >
                    <Plus aria-hidden size={14} />
                    Добавить
                  </Button>
                </div>
                <div className="editor-dress-code__colors">
                  {invite.dressCodeColors.map((color, index) => (
                    <div className="editor-dress-code__color" key={`dress-color-${index}`}>
                      <label>
                        <input
                          aria-label={`Цвет дресс-кода ${index + 1}`}
                          onChange={(event) => updateDressCodeColor(index, event.target.value)}
                          type="color"
                          value={color}
                        />
                      </label>
                      <code>{color}</code>
                      <Button
                        aria-label={`Удалить цвет ${index + 1}`}
                        className="editor-dress-code__remove"
                        isDisabled={invite.dressCodeColors.length <= 1}
                        onClick={() => removeDressCodeColor(index)}
                        type="button"
                        variant="outline"
                      >
                        <Trash2 aria-hidden size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </FieldGroup>
            </section>

            <section className={activeStep === 2 ? "editor-step-panel is-active" : "editor-step-panel"}>
            <FieldGroup title="Гости">
              <label className="editor-toggle">
                <span>
                  <strong>Форма подтверждения</strong>
                  <small>Гости смогут сообщить, придут ли они</small>
                </span>
                <input
                  checked={invite.showRsvp}
                  onChange={(event) => updateInvite("showRsvp", event.target.checked)}
                  type="checkbox"
                />
              </label>
              {invite.showRsvp ? (
                <>
                  <TextInput
                    label="RSVP до"
                    type="date"
                    value={invite.rsvpDate}
                    onChange={(value) => updateInvite("rsvpDate", value)}
                  />
                  <TextAreaField
                    label="Текст перед формой"
                    value={invite.rsvpText}
                    onChange={(value) => updateInvite("rsvpText", value)}
                  />
                  <div className="editor-form-builder">
                    <div className="editor-form-builder__head">
                      <div>
                        <p>Вопросы анкеты</p>
                        <span>Поле имени добавляется автоматически</span>
                      </div>
                      <Button
                        className="editor-dress-code__add"
                        isDisabled={invite.rsvpQuestions.length >= 8}
                        onClick={addRsvpQuestion}
                        type="button"
                        variant="outline"
                      >
                        <Plus aria-hidden size={14} />
                        Вопрос
                      </Button>
                    </div>
                    {invite.rsvpQuestions.map((question, questionIndex) => (
                      <div className="editor-question" key={`rsvp-question-${questionIndex}`}>
                        <div className="editor-question__head">
                          <span>Вопрос {questionIndex + 1}</span>
                          <Button
                            aria-label={`Удалить вопрос ${questionIndex + 1}`}
                            className="editor-dress-code__remove"
                            onClick={() => removeRsvpQuestion(questionIndex)}
                            type="button"
                            variant="outline"
                          >
                            <Trash2 aria-hidden size={13} />
                          </Button>
                        </div>
                        <TextInput
                          label="Текст вопроса"
                          value={question.title}
                          onChange={(value) => updateRsvpQuestion(questionIndex, "title", value)}
                        />
                        <label className="editor-field">
                          <span className="editor-field__label">Тип ответа</span>
                          <select
                            className="editor-question__select"
                            onChange={(event) =>
                              updateRsvpQuestion(
                                questionIndex,
                                "type",
                                event.target.value as InviteRsvpQuestion["type"],
                              )
                            }
                            value={question.type}
                          >
                            <option value="single">Один вариант</option>
                            <option value="multiple">Несколько вариантов</option>
                          </select>
                        </label>
                        <div className="editor-question__options">
                          {question.options.map((option, optionIndex) => (
                            <div className="editor-question__option" key={`option-${optionIndex}`}>
                              <TextInput
                                label={`Вариант ${optionIndex + 1}`}
                                value={option}
                                onChange={(value) =>
                                  updateRsvpOption(questionIndex, optionIndex, value)
                                }
                              />
                              <Button
                                aria-label={`Удалить вариант ${optionIndex + 1}`}
                                className="editor-dress-code__remove"
                                isDisabled={question.options.length <= 2}
                                onClick={() => removeRsvpOption(questionIndex, optionIndex)}
                                type="button"
                                variant="outline"
                              >
                                <Trash2 aria-hidden size={13} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            className="editor-question__add-option"
                            isDisabled={question.options.length >= 8}
                            onClick={() => addRsvpOption(questionIndex)}
                            type="button"
                            variant="outline"
                          >
                            <Plus aria-hidden size={13} />
                            Добавить вариант
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </FieldGroup>
            </section>

            <section className={activeStep === 3 ? "editor-step-panel is-active" : "editor-step-panel"}>
            <FieldGroup title="Фото">
              <div className="editor-photo-grid">
                {[
                  {
                    description: "Первое фото пары в начале приглашения",
                    field: "coverImageUrl" as const,
                    label: "Фото пары 1",
                    src: coverImage,
                  },
                  {
                    description: "Второе фото пары для финального блока",
                    field: "portraitImageUrl" as const,
                    label: "Фото пары 2",
                    src: portraitImage,
                  },
                  {
                    description: "Фото площадки или места церемонии",
                    field: "venueImageUrl" as const,
                    label: "Фото места",
                    src: venueImage,
                  },
                ].map((item) => (
                  <div className="editor-photo-upload" key={item.field}>
                    <div
                      aria-hidden
                      className="editor-photo-upload__preview"
                      style={{ backgroundImage: `url(${item.src})` }}
                    />
                    <div className="editor-photo-upload__copy">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </div>
                    <div className="editor-photo-upload__actions">
                      <label className="editor-photo-upload__button">
                        <ImagePlus aria-hidden size={14} />
                        <span>Загрузить</span>
                        <input
                          accept={imageUploadTypes.join(",")}
                          onChange={(event) => {
                            selectImageFile(item.field, event.target.files?.[0]);
                            event.currentTarget.value = "";
                          }}
                          type="file"
                        />
                      </label>
                      <Button
                        aria-label={`Сбросить ${item.label.toLowerCase()}`}
                        className="editor-photo-upload__reset"
                        isDisabled={!invite[item.field]}
                        onClick={() => resetImage(item.field)}
                        type="button"
                        variant="outline"
                      >
                        <RotateCcw aria-hidden size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {photoError ? (
                <p className="editor-photo-error" role="alert">
                  {photoError}
                </p>
              ) : null}
              <p className="editor-music-note">
                JPG, PNG, WEBP или GIF до 8 МБ. При публикации фото будут сохранены в
                S3-хранилище.
              </p>
            </FieldGroup>

            <FieldGroup title="Музыка">
              <label className="editor-toggle">
                <span>
                  <strong>Музыка в приглашении</strong>
                  <small>Гость сам включает и отключает мелодию</small>
                </span>
                <input
                  checked={invite.musicEnabled}
                  onChange={(event) => updateInvite("musicEnabled", event.target.checked)}
                  type="checkbox"
                />
              </label>
              {invite.musicEnabled ? (
                <div className="editor-music-settings">
                  <TextInput
                    label="Название мелодии"
                    value={invite.musicTitle}
                    onChange={(value) => updateInvite("musicTitle", value)}
                  />
                  <TextInput
                    label="Прямая ссылка на аудиофайл"
                    value={invite.musicUrl.startsWith("data:") ? "" : invite.musicUrl}
                    onChange={(value) => updateInvite("musicUrl", value)}
                  />
                  <label className="editor-music-upload">
                    <span>Загрузить свой аудиофайл</span>
                    <small>MP3, WAV или OGG для предпросмотра</small>
                    <input
                      accept="audio/mpeg,audio/ogg,audio/wav,audio/x-wav"
                      onChange={(event) => selectMusicFile(event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                  {invite.musicUrl.startsWith("data:") ? (
                    <p className="editor-music-note">
                      Загруженный файл используется в предпросмотре. При публикации он будет
                      сохранен в S3-хранилище.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </FieldGroup>

            </section>

            <section className={activeStep === 4 ? "editor-step-panel is-active" : "editor-step-panel"}>
            <FieldGroup title="Палитра">
              <div className="editor-palette-mode" aria-label="Режим настройки палитры">
                <button
                  className={paletteMode === "presets" ? "is-active" : ""}
                  onClick={() => setPaletteMode("presets")}
                  type="button"
                >
                  Готовые
                </button>
                <button
                  className={paletteMode === "custom" ? "is-active" : ""}
                  onClick={() => setPaletteMode("custom")}
                  type="button"
                >
                  Своя палитра
                </button>
              </div>

              {paletteMode === "presets" ? (
              <div className="editor-palette-grid">
                {palettes.map((item) => (
                  <Button
                    className={`editor-palette ${
                      item.id === resolvedPaletteId
                        ? "is-selected"
                        : ""
                    }`}
                    key={item.id}
                    onClick={() => selectPalette(item.id)}
                    type="button"
                    variant="outline"
                  >
                    <span className="editor-palette__sample">
                      <span style={{ backgroundColor: item.background }} />
                      <span style={{ backgroundColor: item.surface }} />
                      <span style={{ backgroundColor: item.accent }} />
                      <span style={{ backgroundColor: item.ink }} />
                    </span>
                    <span className="editor-palette__copy">
                      <span>
                        <strong>{item.label}</strong>
                        {item.id === resolvedPaletteId ? <Check aria-hidden size={15} /> : null}
                      </span>
                      <small>{item.mood}</small>
                    </span>
                  </Button>
                ))}
              </div>
              ) : (
              <div className="editor-color-studio">
                <div className="editor-color-studio__head">
                  <div>
                    <p>Своя палитра</p>
                    <span>
                      {resolvedPaletteId === "custom"
                        ? customPalette.mood
                        : `Настройте «${palette.label}» под себя`}
                    </span>
                  </div>
                  {resolvedPaletteId !== "custom" ? (
                    <Button
                      className="editor-color-studio__start"
                      onClick={customizeSelectedPalette}
                      type="button"
                      variant="outline"
                    >
                      <Palette aria-hidden size={14} />
                      Настроить
                    </Button>
                  ) : (
                    <span className="editor-color-studio__active">
                      <Check aria-hidden size={13} />
                      Своя тема
                    </span>
                  )}
                </div>

                <div
                  aria-hidden
                  className="editor-color-studio__preview"
                  style={{
                    backgroundColor:
                      resolvedPaletteId === "custom" ? customPalette.background : palette.background,
                    color: resolvedPaletteId === "custom" ? customPalette.ink : palette.ink,
                  }}
                >
                  <span
                    style={{
                      backgroundColor:
                        resolvedPaletteId === "custom" ? customPalette.surface : palette.surface,
                    }}
                  >
                    <i
                      style={{
                        backgroundColor:
                          resolvedPaletteId === "custom" ? customPalette.accent : palette.accent,
                      }}
                    />
                    <strong>А & М</strong>
                    <small>Сохраните дату</small>
                  </span>
                </div>

                <div className="editor-color-fields">
                  {themeFields.map((item) => {
                    const value =
                      resolvedPaletteId === "custom" ? customPalette[item.field] : palette[item.field];

                    return (
                      <label className="editor-color-field" key={item.field}>
                        <input
                          aria-label={item.label}
                          onChange={(event) => updateCustomPalette(item.field, event.target.value)}
                          type="color"
                          value={value}
                        />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <code>{value}</code>
                      </label>
                    );
                  })}
                </div>
              </div>
              )}

              {hasRingControls ? (
                <div className="editor-subpanel">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#343a36]">Металл колец</p>
                      <p className="text-xs text-[#72786f]">
                        Переведите оттенок от золота к серебру
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="h-9 w-9 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: ringColor }}
                    />
                  </div>
                  <label className="grid gap-2 text-sm text-[#53564c]">
                    <span className="flex items-center justify-between">
                      <span>Золото</span>
                      <span>Серебро</span>
                    </span>
                    <input
                      aria-label="Цвет металла колец"
                      className="h-2 w-full cursor-pointer accent-[#8b7960]"
                      max="100"
                      min="0"
                      onChange={(event) => updateInvite("ringMetal", event.target.value)}
                      type="range"
                      value={invite.ringMetal}
                    />
                    <span className="font-mono text-xs uppercase text-[#72786f]">
                      {ringColor}
                    </span>
                  </label>
                </div>
              ) : null}
            </FieldGroup>
            </section>

            <section className={activeStep === 5 ? "editor-step-panel is-active" : "editor-step-panel"}>
              <div className="editor-review">
                <div className="editor-review__heading">
                  <span className={allErrors.length === 0 ? "is-ready" : "has-errors"}>
                    {allErrors.length === 0 ? (
                      <CheckCircle2 aria-hidden size={18} />
                    ) : (
                      <AlertCircle aria-hidden size={18} />
                    )}
                  </span>
                  <div>
                    <h2>
                      {allErrors.length === 0
                        ? "Приглашение готово"
                        : "Нужно проверить данные"}
                    </h2>
                    <p>
                      {allErrors.length === 0
                        ? "Просмотрите приглашение глазами гостя и опубликуйте его."
                        : "Исправьте отмеченные разделы перед публикацией."}
                    </p>
                  </div>
                </div>

                <div className="editor-review__sections">
                  {editorSteps.slice(0, 5).map((step, index) => (
                    <button
                      className={stepErrors[index].length === 0 ? "is-complete" : "has-error"}
                      key={step.title}
                      onClick={() => openStep(index)}
                      type="button"
                    >
                      <span>
                        {stepErrors[index].length === 0 ? (
                          <Check aria-hidden size={15} />
                        ) : (
                          <AlertCircle aria-hidden size={15} />
                        )}
                      </span>
                      <strong>{step.title}</strong>
                      <small>
                        {stepErrors[index].length === 0
                          ? "Готово"
                          : stepErrors[index][0]}
                      </small>
                      <ArrowRight aria-hidden size={15} />
                    </button>
                  ))}
                </div>

                <Button
                  className="editor-review__preview"
                  onClick={() => setIsFullscreenPreview(true)}
                  type="button"
                  variant="outline"
                >
                  <Eye aria-hidden size={16} />
                  Посмотреть глазами гостя
                </Button>
              </div>
            </section>

            {visibleValidationStep === activeStep && stepErrors[activeStep].length > 0 ? (
              <div className="editor-validation-summary" role="alert">
                <strong>Проверьте этот раздел</strong>
                <ul>
                  {stepErrors[activeStep].map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {publishError && activeStep === editorSteps.length - 1 ? (
              <p className="editor-publish-error" role="alert">
                {publishError}
              </p>
            ) : null}

            <div className="editor-step-actions">
              <Button
                className="editor-step-actions__back"
                isDisabled={activeStep === 0}
                onClick={() => openStep(Math.max(0, activeStep - 1))}
                type="button"
                variant="outline"
              >
                <ChevronLeft aria-hidden size={16} />
                <span>Предыдущий</span>
              </Button>
              {activeStep < editorSteps.length - 1 ? (
                <Button
                  className="editor-step-actions__next"
                  onClick={continueToNextStep}
                  type="button"
                  variant="primary"
                >
                  Следующий
                  <ArrowRight aria-hidden size={16} />
                </Button>
              ) : (
                <Button
                  className="editor-step-actions__next"
                  isDisabled={isPublishing || allErrors.length > 0}
                  onClick={publishSite}
                  type="button"
                  variant="primary"
                >
                  {isPublishing
                    ? siteId
                      ? "Сохраняем"
                      : "Создаем сайт"
                    : siteId
                      ? "Сохранить изменения"
                      : "Создать сайт"}
                  <Sparkles aria-hidden size={16} />
                </Button>
              )}
            </div>
          </div>
        </aside>

        <section className="editor-preview" id="invite-preview">
          <div className="editor-preview__inner">
            <div className="editor-preview__toolbar">
              <div>
                <p><Eye aria-hidden size={14} /> Живой предпросмотр</p>
                <h2>
                  {invite.groom} & {invite.bride}
                </h2>
              </div>
              <div className="editor-preview__actions">
                <Button
                  className="editor-mobile-edit"
                  onClick={() => setMobileView("edit")}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeft aria-hidden size={15} />
                  К настройкам
                </Button>
                <div className="editor-device-switch" aria-label="Размер предпросмотра">
                  <Button
                    aria-label="Предпросмотр на компьютере"
                    className={previewDevice === "desktop" ? "is-selected" : ""}
                    onClick={() => setPreviewDevice("desktop")}
                    type="button"
                    variant="outline"
                  >
                    <Monitor aria-hidden size={14} />
                  </Button>
                  <Button
                    aria-label="Предпросмотр на телефоне"
                    className={previewDevice === "mobile" ? "is-selected" : ""}
                    onClick={() => setPreviewDevice("mobile")}
                    type="button"
                    variant="outline"
                  >
                    <Smartphone aria-hidden size={14} />
                  </Button>
                </div>
                <Button
                  className="editor-action editor-action--secondary editor-action--fullscreen"
                  onClick={() => setIsFullscreenPreview(true)}
                  type="button"
                  variant="outline"
                >
                  <Maximize2 aria-hidden size={15} />
                  <span>На весь экран</span>
                </Button>
              </div>
            </div>

            <div
              className={`editor-preview__canvas ${
                isWideTemplate
                  ? "editor-preview__canvas--vanilla"
                  : "editor-preview__canvas--alpine"
              } ${previewDevice === "mobile" ? "editor-preview__canvas--mobile" : ""} is-readonly`}
            >
              {previewDevice === "mobile" ? (
                <MobilePreviewFrame>{renderInvitation()}</MobilePreviewFrame>
              ) : (
                renderInvitation()
              )}
            </div>
          </div>
        </section>
      </div>
      )}
    </main>
  );
}
