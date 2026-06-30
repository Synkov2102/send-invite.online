/**
 * Каталог шаблонов — единая точка регистрации.
 *
 * Чтобы добавить шаблон на существующем движке:
 * 1. Добавьте объект в `inviteTemplateCatalog` ниже.
 * 2. Укажите `kind` (alpine | aqua | silk | vanilla) и `editorReady: true`.
 * 3. Положите скриншот в frontend/public/images/templates/.
 *
 * Чтобы добавить новый движок рендера:
 * 1. Создайте папку frontend/src/invitation-templates/<kind>/.
 * 2. Добавьте kind в TemplateKind и loader в invitation-templates/registry.ts.
 */
import type { InviteState } from "./invite-state";

export type CoverType = "rings" | "arch" | "wave";

export type TemplateKind = "alpine" | "aqua" | "silk" | "vanilla";

export type InviteTemplate = {
  id: string;
  name: string;
  description: string;
  coverType: CoverType;
  defaultPaletteId: string;
  recommendedPaletteIds: readonly string[];
  tags: string[];
  screenshot: string;
  preview: {
    background: string;
    surface: string;
    ink: string;
    accent: string;
  };
};

export type InviteTemplateDefinition = InviteTemplate & {
  /** Какой React-движок рисует шаблон. */
  kind: TemplateKind;
  /** Показывать в каталоге и открывать в редакторе. */
  editorReady: boolean;
  /** Демо-тексты при первом открытии в редакторе (необязательно). */
  editorPreset?: Partial<InviteState>;
};

const vanillaEditorPreset: Partial<InviteState> = {
  bride: "Катя",
  groom: "Миша",
  date: "2027-11-20",
  time: "16:30",
  city: "Павловск",
  venue: "замке БИП",
  address: "Мариинская ул., 4",
  lead:
    "С огромным волнением и радостью мы приглашаем вас разделить с нами этот особенный день — нашу свадьбу. Это будет незабываемое событие, и мы хотим, чтобы вы стали его частью.",
  dressCode:
    "Для нас главное — ваше присутствие. Будем рады, если в вашем образе появятся оттенки нашей свадебной палитры.",
  dressCodeColors: ["#f6b8d0", "#c48693", "#f4dfbd", "#c77b3a", "#8d9a72"],
  schedule: [
    { time: "15:30", title: "Сбор гостей", description: "Игристое, лёгкие закуски и общение" },
    { time: "16:00", title: "Выездная регистрация", description: "Самый трогательный момент дня" },
    { time: "16:30", title: "Начало торжества", description: "Ужин, танцы и развлечения" },
    { time: "00:00", title: "Завершение торжества", description: "Объятия и яркие впечатления" },
  ],
  rsvpDate: "2027-10-15",
  paletteId: "vanilla",
};

const aquaEditorPreset: Partial<InviteState> = {
  bride: "Марина",
  groom: "Артём",
  city: "Сочи",
  venue: "Прибрежная вилла",
  address: "Набережная, 1",
  lead:
    "Под шум волн и тёплый закат мы приглашаем вас разделить с нами самый счастливый день. Будет море, музыка и бесконечная любовь.",
  dressCodeColors: ["#eafcff", "#7fd0d6", "#159aa6", "#0b3a44", "#e7d3a8"],
  paletteId: "aqua",
};

const silkEditorPreset: Partial<InviteState> = {
  bride: "Анна",
  groom: "Максим",
  date: "2026-05-05",
  time: "15:00",
  city: "Москва",
  venue: "Golden Hall",
  address: "ул. 1 Мая, 118",
  lead:
    "Один день в этом году будет для нас особенным, и мы хотим провести его в кругу близких и друзей. С большим удовольствием приглашаем вас на знаменательный праздник - нашу свадьбу.",
  dressCode:
    "Нам будет особенно приятно видеть вас в нарядах цветовой гаммы нашей свадьбы.",
  dressCodeColors: ["#b9a78f", "#a9aaa5", "#f4f0e5", "#e7dccd"],
  schedule: [
    { time: "15:00", title: "Регистрация", description: "Торжественная церемония" },
    { time: "16:00", title: "Фуршет", description: "Легкое общение и поздравления" },
    { time: "16:30", title: "Банкет", description: "Праздничный ужин" },
  ],
  rsvpText: "Ваши ответы очень помогут нам при организации свадьбы.",
  rsvpDate: "2026-04-20",
  paletteId: "silk",
};

export const inviteTemplateCatalog: InviteTemplateDefinition[] = [
  {
    id: "alpine-rings",
    name: "Альпийские кольца",
    description: "Обложка с 3D-кольцами и спокойной горной палитрой.",
    coverType: "rings",
    kind: "alpine",
    editorReady: true,
    defaultPaletteId: "alpine",
    recommendedPaletteIds: ["alpine", "pine", "granite", "frost", "dawn", "pearl"],
    tags: ["3D", "минимализм"],
    screenshot: "/images/templates/alpine-rings.png",
    preview: {
      background: "#dfe8e7",
      surface: "#f7fbf8",
      ink: "#26383a",
      accent: "#46767a",
    },
  },
  {
    id: "lagoon-wave",
    name: "Лагуна",
    description: "Живой водный фон, матовые стеклянные секции и морская палитра.",
    coverType: "wave",
    kind: "aqua",
    editorReady: true,
    editorPreset: aquaEditorPreset,
    defaultPaletteId: "aqua",
    recommendedPaletteIds: [
      "aqua",
      "deep-ocean",
      "aquamarine",
      "glacier",
      "sea-mist",
      "mint-shore",
      "fjord",
    ],
    tags: ["анимация", "вода"],
    screenshot: "/images/templates/lagoon-wave.png",
    preview: {
      background: "#0e3a44",
      surface: "#eafaf9",
      ink: "#0b2a33",
      accent: "#16a3ad",
    },
  },
  {
    id: "vanilla-arch",
    name: "Vanilla wedding",
    description: "Розово-оранжевое приглашение с пластинкой, GIF-коллажем и облачными секциями.",
    coverType: "arch",
    kind: "vanilla",
    editorReady: true,
    editorPreset: vanillaEditorPreset,
    defaultPaletteId: "vanilla",
    recommendedPaletteIds: ["vanilla", "lavender", "clay", "pearl", "champagne"],
    tags: ["фото", "дневная свадьба"],
    screenshot: "/images/templates/vanilla-arch.png",
    preview: {
      background: "#f7d9e7",
      surface: "#f7f8f5",
      ink: "#49434d",
      accent: "#f47a23",
    },
  },
  {
    id: "silk-monogram",
    name: "Silk monogram",
    description: "Классическое приглашение с шелковым фоном, черно-белыми фото и монограммой пары.",
    coverType: "arch",
    kind: "silk",
    editorReady: true,
    editorPreset: silkEditorPreset,
    defaultPaletteId: "silk",
    recommendedPaletteIds: ["silk", "pearl", "graphite", "champagne", "nocturne"],
    tags: ["фото", "классика"],
    screenshot: "/images/templates/silk-monogram-screen.png",
    preview: {
      background: "#d5c7bd",
      surface: "#fffefd",
      ink: "#171514",
      accent: "#b9a78f",
    },
  },
];

const templateDefinitionById = new Map(
  inviteTemplateCatalog.map((template) => [template.id, template]),
);

export function toPublicTemplate(definition: InviteTemplateDefinition): InviteTemplate {
  return {
    coverType: definition.coverType,
    defaultPaletteId: definition.defaultPaletteId,
    recommendedPaletteIds: definition.recommendedPaletteIds,
    description: definition.description,
    id: definition.id,
    name: definition.name,
    preview: definition.preview,
    screenshot: definition.screenshot,
    tags: definition.tags,
  };
}

export function getTemplateDefinition(id: string | null | undefined) {
  if (!id) {
    return inviteTemplateCatalog[0];
  }

  return templateDefinitionById.get(id) ?? inviteTemplateCatalog[0];
}

export function getTemplateKind(templateId: string): TemplateKind {
  return getTemplateDefinition(templateId).kind;
}

export function getInviteTemplateName(templateId: string) {
  return getTemplateDefinition(templateId).name;
}

export function isEditorReadyTemplate(templateId: string) {
  return getTemplateDefinition(templateId).editorReady;
}

export function getEditorReadyTemplates() {
  return inviteTemplateCatalog
    .filter((template) => template.editorReady)
    .map(toPublicTemplate);
}

export function getEditorPreset(templateId: string) {
  return getTemplateDefinition(templateId).editorPreset;
}

export function isWideTemplateKind(kind: TemplateKind) {
  return kind !== "alpine";
}

export const defaultInviteTemplates: InviteTemplate[] =
  inviteTemplateCatalog.map(toPublicTemplate);

export function getInviteTemplate(id: string | null | undefined): InviteTemplate {
  return toPublicTemplate(getTemplateDefinition(id));
}

export function isInviteTemplate(value: unknown): value is InviteTemplate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const template = value as Record<string, unknown>;
  const preview = template.preview as Record<string, unknown> | null | undefined;

  return (
    typeof template.defaultPaletteId === "string" &&
    Array.isArray(template.recommendedPaletteIds) &&
    template.recommendedPaletteIds.length > 0 &&
    template.recommendedPaletteIds.every((paletteId) => typeof paletteId === "string") &&
    template.recommendedPaletteIds.includes(template.defaultPaletteId) &&
    template.recommendedPaletteIds[0] === template.defaultPaletteId &&
    typeof template.description === "string" &&
    (template.coverType === "arch" ||
      template.coverType === "rings" ||
      template.coverType === "wave") &&
    typeof template.id === "string" &&
    typeof template.name === "string" &&
    typeof template.screenshot === "string" &&
    Array.isArray(template.tags) &&
    template.tags.every((tag) => typeof tag === "string") &&
    typeof preview === "object" &&
    preview !== null &&
    !Array.isArray(preview) &&
    typeof preview.accent === "string" &&
    typeof preview.background === "string" &&
    typeof preview.ink === "string" &&
    typeof preview.surface === "string"
  );
}
