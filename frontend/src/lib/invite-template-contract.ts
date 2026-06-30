import type { CSSProperties } from "react";
import type { CoverType } from "@/lib/invite-templates";
import type {
  InviteRsvpQuestion,
  InviteScheduleItem,
  InviteState,
} from "@/lib/invite-state";
import type { InviteSitePalette } from "@/lib/invite-site-types";
import type { InviteVars } from "@/lib/invite-theme";

export type InviteTemplateSectionId =
  | "hero"
  | "greeting"
  | "when"
  | "where"
  | "program"
  | "dress-code"
  | "rsvp"
  | "closing";

export type InviteFieldKind =
  | "string"
  | "date"
  | "time"
  | "boolean"
  | "hex-list"
  | "schedule"
  | "rsvp-questions"
  | "url"
  | "palette-id"
  | "ring-metal";

export type InviteTemplateFieldMeta = {
  /** Ключ в `InviteState`. */
  key: keyof InviteState;
  /** Логическая секция приглашения. */
  section: InviteTemplateSectionId;
  kind: InviteFieldKind;
  /** Подпись в редакторе. */
  label: string;
  /** Как поле используется в шаблоне. */
  usage: string;
  required: boolean;
  /** Ограничения редактора / валидации. */
  constraints?: string;
};

export type InviteTemplateSectionMeta = {
  id: InviteTemplateSectionId;
  title: string;
  description: string;
  /** Можно скрыть секцию целиком (например RSVP). */
  optional: boolean;
};

export const inviteTemplateSections: InviteTemplateSectionMeta[] = [
  {
    id: "hero",
    title: "Обложка",
    description: "Имена пары, дата и визуальный cover (фото, 3D-кольца или анимация).",
    optional: false,
  },
  {
    id: "greeting",
    title: "Приветствие",
    description: "Короткий текст-приглашение для гостей.",
    optional: false,
  },
  {
    id: "when",
    title: "Когда",
    description: "Дата, время начала и мини-календарь недели вокруг события.",
    optional: false,
  },
  {
    id: "where",
    title: "Где",
    description: "Площадка, адрес, город и фото локации.",
    optional: false,
  },
  {
    id: "program",
    title: "Программа",
    description: "Таймлайн дня: время, название и описание этапов.",
    optional: false,
  },
  {
    id: "dress-code",
    title: "Дресс-код",
    description: "Текст рекомендаций и палитра цветов для образов гостей.",
    optional: false,
  },
  {
    id: "rsvp",
    title: "RSVP",
    description: "Анкета гостя с дедлайном и настраиваемыми вопросами.",
    optional: true,
  },
  {
    id: "closing",
    title: "Финал",
    description: "Заключительный блок с портретом и повтором имён пары.",
    optional: false,
  },
];

export const inviteContentFields: InviteTemplateFieldMeta[] = [
  {
    key: "groom",
    section: "hero",
    kind: "string",
    label: "Жених",
    usage: "Имя на обложке, в финале и в `<title>` страницы.",
    required: true,
  },
  {
    key: "bride",
    section: "hero",
    kind: "string",
    label: "Невеста",
    usage: "Имя на обложке, в финале и в `<title>` страницы.",
    required: true,
  },
  {
    key: "date",
    section: "hero",
    kind: "date",
    label: "Дата",
    usage: "ISO `YYYY-MM-DD`. Форматировать через `formatDate`, `formatMonth`, `getCalendarDays`.",
    required: true,
    constraints: "Формат ISO date. Пустая строка → «дата уточняется».",
  },
  {
    key: "lead",
    section: "greeting",
    kind: "string",
    label: "Текст приглашения",
    usage: "Основной абзац после обращения к гостям.",
    required: true,
  },
  {
    key: "time",
    section: "when",
    kind: "time",
    label: "Время начала",
    usage: "Строка `HH:MM`, показывается как есть.",
    required: true,
  },
  {
    key: "venue",
    section: "where",
    kind: "string",
    label: "Площадка",
    usage: "Название места проведения.",
    required: true,
  },
  {
    key: "address",
    section: "where",
    kind: "string",
    label: "Адрес",
    usage: "Улица / ориентир. Часто выводится вместе с городом.",
    required: true,
  },
  {
    key: "city",
    section: "where",
    kind: "string",
    label: "Город",
    usage: "Город или регион.",
    required: true,
  },
  {
    key: "schedule",
    section: "program",
    kind: "schedule",
    label: "Программа дня",
    usage: "Массив `{ time, title, description }`. Минимум 1, максимум 10 пунктов.",
    required: true,
    constraints: "1–10 элементов. `description` может не отображаться в компактных шаблонах.",
  },
  {
    key: "dressCode",
    section: "dress-code",
    kind: "string",
    label: "Текст дресс-кода",
    usage: "Передать в `<InvitationDressCodeBlock text={...} />`.",
    required: true,
  },
  {
    key: "dressCodeColors",
    section: "dress-code",
    kind: "hex-list",
    label: "Цвета дресс-кода",
    usage: "Массив `#RRGGBB`. Передать в `<InvitationDressCodeBlock colors={...} />`.",
    required: true,
    constraints: "1–8 цветов.",
  },
  {
    key: "showRsvp",
    section: "rsvp",
    kind: "boolean",
    label: "Показывать RSVP",
    usage: "Если `false`, секцию RSVP не рендерить.",
    required: true,
  },
  {
    key: "rsvpDate",
    section: "rsvp",
    kind: "date",
    label: "Дедлайн RSVP",
    usage: "ISO date. Форматировать через `formatDate`.",
    required: false,
    constraints: "Имеет смысл только при `showRsvp === true`.",
  },
  {
    key: "rsvpText",
    section: "rsvp",
    kind: "string",
    label: "Текст RSVP",
    usage: "Вводный абзац анкеты.",
    required: false,
  },
  {
    key: "rsvpQuestions",
    section: "rsvp",
    kind: "rsvp-questions",
    label: "Вопросы RSVP",
    usage: "Массив `{ title, type: 'single' | 'multiple', options: string[] }`.",
    required: false,
    constraints: "0–8 вопросов. Каждый вопрос — минимум 2 варианта ответа.",
  },
  {
    key: "coverImageUrl",
    section: "hero",
    kind: "url",
    label: "Фото обложки",
    usage: "URL или `/api/sites/:id/images/cover`. Fallback: `inviteImages.cover`.",
    required: false,
  },
  {
    key: "portraitImageUrl",
    section: "closing",
    kind: "url",
    label: "Финальное фото",
    usage: "URL или `/api/sites/:id/images/portrait`. Fallback: `inviteImages.portrait`.",
    required: false,
  },
  {
    key: "venueImageUrl",
    section: "where",
    kind: "url",
    label: "Фото локации",
    usage: "URL или `/api/sites/:id/images/venue`. Fallback: `inviteImages.venue`.",
    required: false,
  },
  {
    key: "musicEnabled",
    section: "hero",
    kind: "boolean",
    label: "Фоновая музыка",
    usage: "Управляет `<InvitationMusicPlayer enabled={...} />`.",
    required: true,
  },
  {
    key: "musicTitle",
    section: "hero",
    kind: "string",
    label: "Название трека",
    usage: "Подпись в плеере.",
    required: false,
  },
  {
    key: "musicUrl",
    section: "hero",
    kind: "url",
    label: "URL музыки",
    usage: "Прямая ссылка или `/api/sites/:id/music`.",
    required: false,
  },
  {
    key: "ringMetal",
    section: "hero",
    kind: "ring-metal",
    label: "Оттенок колец",
    usage: "Строка `0`–`100`. Передаётся в `createRingColor()` для coverType `rings`.",
    required: false,
    constraints: "Только для шаблонов с 3D-кольцами.",
  },
  {
    key: "paletteId",
    section: "hero",
    kind: "palette-id",
    label: "Палитра",
    usage: "ID пресета в редакторе. В шаблон приходят готовые CSS-переменные через `inviteVars`.",
    required: true,
  },
];

export type InviteCalendarDay = {
  day: number;
  label: string;
  selected: boolean;
};

/** Данные, которые пользователь редактирует в конструкторе. */
export type InviteUserContent = InviteState;

/** Тема, которую шаблон получает через CSS custom properties. */
export type InviteTemplateTheme = InviteVars;

export type InviteTemplateMedia = {
  coverImage: string;
  portraitImage: string;
  venueImage: string;
};

export type InviteTemplateRuntime = {
  calendarDays: InviteCalendarDay[];
  ringColor: string;
};

/** Минимальный контракт props для React-шаблона приглашения. */
export type InviteTemplateProps = {
  invite: InviteUserContent;
  inviteVars: InviteTemplateTheme;
};

/** Расширение для шаблонов с обложкой-кольцами или фото-слотами. */
export type InviteTemplateWithMediaProps = InviteTemplateProps &
  InviteTemplateMedia &
  InviteTemplateRuntime & {
    coverType: CoverType;
  };

export type InviteSharedComponentVariant = "alpine" | "aqua" | "vanilla";

export const inviteCssVarContract: Array<{
  cssVar: keyof InviteVars;
  paletteKey: keyof InviteSitePalette;
  role: string;
}> = [
  { cssVar: "--invite-bg", paletteKey: "background", role: "Фон страницы" },
  { cssVar: "--invite-surface", paletteKey: "surface", role: "Карточки и панели" },
  { cssVar: "--invite-ink", paletteKey: "ink", role: "Основной текст" },
  { cssVar: "--invite-photo-text", paletteKey: "photoText", role: "Текст поверх фото" },
  { cssVar: "--invite-muted", paletteKey: "muted", role: "Вторичный текст" },
  { cssVar: "--invite-accent", paletteKey: "accent", role: "Акценты, иконки, CTA" },
  { cssVar: "--invite-line", paletteKey: "line", role: "Разделители, рамки" },
  { cssVar: "--invite-veil", paletteKey: "veil", role: "Полупрозрачные подложки" },
];

export const inviteSharedComponentsContract = {
  dressCode: {
    importPath: "@/invitation-templates/components",
    component: "InvitationDressCodeBlock",
    props: ["text", "colors", "variant?"],
    variants: ["alpine", "aqua", "vanilla"] as InviteSharedComponentVariant[],
  },
  rsvp: {
    importPath: "@/invitation-templates/components",
    component: "InvitationRsvpForm",
    props: ["text", "rsvpDate", "questions", "variant?"],
    variants: ["alpine", "aqua", "vanilla"] as InviteSharedComponentVariant[],
    renderWhen: "invite.showRsvp === true",
  },
  music: {
    importPath: "@/invitation-templates/components",
    component: "InvitationMusicPlayer",
    props: ["enabled", "title", "url"],
    renderWhen: "invite.musicEnabled === true",
  },
} as const;

export const inviteDateHelpersContract = {
  importPath: "@/lib/invite-date",
  functions: {
    formatDate: "14 сентября 2026 г.",
    formatMonth: "СЕНТЯБРЬ",
    getCalendarDays: "7 дней вокруг даты (±3), поле selected для дня события",
  },
} as const;

export const invitePaletteContract = {
  catalog: "frontend/src/lib/invite-palette-catalog.ts — глобальный каталог preset-палитр",
  templatePalettes:
    "frontend/src/lib/template-palettes.ts — recommendedPaletteIds шаблона → список для редактора",
  theme: "frontend/src/lib/invite-theme.ts — CSS-переменные и утилиты цвета",
} as const;

export const inviteTemplateFileContract = {
  directory: "frontend/src/invitation-templates/<slug>/",
  files: ["template.tsx", "template.module.css?", "index.ts"],
  indexExport: "export { default as <Name>Template } from './template';",
  registration: [
    "Добавить запись в `defaultInviteTemplates` (`frontend/src/lib/invite-templates.ts`) с `recommendedPaletteIds`.",
    "Подключить рендер в `invitation-builder.tsx` и `published-invite-site.tsx`.",
  ],
} as const;

function renderTypeScriptInviteState(): string {
  return `export type InviteScheduleItem = {
  description: string;
  time: string;
  title: string;
};

export type InviteRsvpQuestion = {
  options: string[];
  title: string;
  type: "multiple" | "single";
};

export type InviteState = {
  bride: string;
  groom: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  address: string;
  lead: string;
  dressCode: string;
  dressCodeColors: string[];
  schedule: InviteScheduleItem[];
  showRsvp: boolean;
  rsvpDate: string;
  rsvpText: string;
  rsvpQuestions: InviteRsvpQuestion[];
  paletteId: string;
  ringMetal: string;
  musicEnabled: boolean;
  musicTitle: string;
  musicUrl: string;
  coverImageUrl: string;
  portraitImageUrl: string;
  venueImageUrl: string;
};`;
}

function renderCssVarsTable(): string {
  return inviteCssVarContract
    .map((item) => `- \`${item.cssVar}\` ← palette.${item.paletteKey} — ${item.role}`)
    .join("\n");
}

function renderFieldsTable(): string {
  return inviteContentFields
    .map((field) => {
      const req = field.required ? "да" : "нет";
      const constraints = field.constraints ? ` (${field.constraints})` : "";
      return `- \`${field.key}\` [${field.section}] — ${field.label}. ${field.usage}${constraints}. Обязательно: ${req}.`;
    })
    .join("\n");
}

function renderSectionsList(): string {
  return inviteTemplateSections
    .map((section) => {
      const opt = section.optional ? "опциональная" : "обязательная";
      return `### ${section.title} (\`${section.id}\`, ${opt})\n${section.description}`;
    })
    .join("\n\n");
}

/** Промпт для LLM: сгенерировать новый визуальный шаблон приглашения. */
export function buildInviteTemplateGenerationPrompt(options?: {
  templateName?: string;
  coverType?: CoverType;
  visualDirection?: string;
}): string {
  const templateName = options?.templateName ?? "<название шаблона>";
  const coverType = options?.coverType ?? "arch";
  const visualDirection =
    options?.visualDirection ??
    "Современное свадебное приглашение на русском языке, mobile-first, спокойная типографика.";

  return `# Задача: сгенерировать шаблон свадебного приглашения

Ты создаёшь React-компонент шаблона для платформы **Invite**. Шаблон — это только визуальная оболочка: **весь пользовательский контент приходит из props**, его нельзя хардкодить.

## Стек и ограничения

- Next.js App Router, React 19, TypeScript.
- Стили: CSS Modules (\`template.module.css\`) и/или CSS custom properties из \`inviteVars\`.
- Анимации: \`framer-motion\` (как в существующих шаблонах).
- Иконки: \`lucide-react\`.
- Изображения: \`next/image\`; для runtime URL (\`data:\`, \`/api/\`) ставить \`unoptimized\`.
- Язык UI: русский. Локаль дат: \`ru-RU\`.
- Mobile-first, max-width оболочки ~520–640px по центру.
- Не добавляй бэкенд, API routes и изменения в MongoDB.

## Метаданные нового шаблона

- Название: **${templateName}**
- \`coverType\`: **${coverType}** (\`rings\` | \`arch\` | \`wave\`)
- Визуальное направление: ${visualDirection}

## Контракт пользовательских данных (\`invite: InviteState\`)

Пользователь настраивает поля в редакторе. Шаблон обязан отобразить все обязательные секции и корректно обработать опциональные.

\`\`\`ts
${renderTypeScriptInviteState()}
\`\`\`

### Секции приглашения

${renderSectionsList()}

### Поля и использование

${renderFieldsTable()}

## Контракт темы (\`inviteVars: InviteVars\`)

Палитра уже разрешена в CSS-переменные. Применяй их на корневом контейнере:

\`\`\`tsx
<article style={inviteVars}>...</article>
\`\`\`

Доступные переменные:

${renderCssVarsTable()}

Используй \`var(--invite-*)\` в CSS. Не хардкоди hex-цвета, кроме редких декоративных эффектов.

## Общие компоненты (обязательно переиспользовать)

1. **Дресс-код** — \`InvitationDressCodeBlock\` с props \`text\`, \`colors\`, \`variant\`.
2. **RSVP** — \`InvitationRsvpForm\` с props \`text\`, \`rsvpDate\`, \`questions\`, \`variant\`. Рендерить только если \`invite.showRsvp\`.
3. **Музыка** — \`InvitationMusicPlayer\` с props \`enabled\`, \`title\`, \`url\`.

Импорт: \`@/invitation-templates/components\`.

Выбери один \`variant\` (\`alpine\` | \`aqua\` | \`vanilla\`) или добавь стилизацию через CSS Modules вокруг этих блоков.

## Вспомогательные данные (передаёт оболочка, не пользователь)

\`\`\`ts
type InviteTemplateWithMediaProps = {
  invite: InviteState;
  inviteVars: InviteVars;
  coverType: CoverType;
  coverImage: string;
  portraitImage: string;
  venueImage: string;
  calendarDays: Array<{ day: number; label: string; selected: boolean }>;
  ringColor: string; // только для coverType === "rings"
};
\`\`\`

- Фото: \`coverImage = invite.coverImageUrl || inviteImages.cover\` (аналогично portrait/venue).
- Даты: \`formatDate\`, \`formatMonth\`, \`getCalendarDays\` из \`@/lib/invite-date\`.
- Кольца: \`createRingColor(invite.ringMetal)\` из \`@/lib/invite-theme\`.

## Структура файлов

\`\`\`
frontend/src/invitation-templates/<slug>/
  template.tsx
  template.module.css   # при необходимости
  index.ts              # export { default as <Name>Template } from "./template"
\`\`\`

После генерации нужно:
1. Добавить объект в \`defaultInviteTemplates\` (\`id\`, \`name\`, \`description\`, \`coverType\`, \`defaultPaletteId\`, \`recommendedPaletteIds\`, \`tags\`, \`screenshot\`, \`preview\`). Первая палитра в \`recommendedPaletteIds\` должна совпадать с \`defaultPaletteId\`.
2. Подключить компонент в \`invitation-builder.tsx\` и \`published-invite-site.tsx\`.

## Обязательный чеклист секций

- [ ] Hero: имена, дата, cover согласно \`coverType\`
- [ ] Greeting: \`invite.lead\`
- [ ] When: дата, время, календарь (\`calendarDays\`)
- [ ] Where: venue, address, city, \`venueImage\`
- [ ] Program: \`invite.schedule\` (time + title; description — по желанию)
- [ ] Dress code: shared block
- [ ] RSVP: shared block, только если \`showRsvp\`
- [ ] Closing: \`portraitImage\`, повтор имён
- [ ] Music player снаружи или внутри shell

## Что нельзя делать

- Не дублировать логику RSVP/дресс-кода/плеера с нуля, если можно использовать shared components.
- Не читать \`paletteId\` напрямую — только \`inviteVars\`.
- Не предполагать фиксированную длину \`schedule\` или \`rsvpQuestions\`.
- Не ломать доступность: alt у изображений, семантические \`section\`, читаемый контраст.

## Формат ответа

1. Краткое описание визуальной концепции (3–5 предложений).
2. Полный код \`template.tsx\`.
3. Полный код \`template.module.css\` (если нужен).
4. \`index.ts\`.
5. JSON-запись для \`defaultInviteTemplates\`.
6. Diff-фрагменты для регистрации в builder и published view.

Генерируй production-ready код без плейсхолдеров вроде \`// TODO\`.`;
}

/** Короткая версия промпта для вставки в чат. */
export function buildInviteTemplateGenerationPromptShort(): string {
  return buildInviteTemplateGenerationPrompt();
}

export type InviteTemplateContractSnapshot = {
  sections: InviteTemplateSectionMeta[];
  fields: InviteTemplateFieldMeta[];
  cssVars: typeof inviteCssVarContract;
  sharedComponents: typeof inviteSharedComponentsContract;
  inviteStateType: {
    scheduleItem: InviteScheduleItem;
    rsvpQuestion: InviteRsvpQuestion;
    state: InviteState;
  };
  templateProps: InviteTemplateProps;
  theme: InviteTemplateTheme;
};

export function getInviteTemplateContractSnapshot(): InviteTemplateContractSnapshot {
  return {
    sections: inviteTemplateSections,
    fields: inviteContentFields,
    cssVars: inviteCssVarContract,
    sharedComponents: inviteSharedComponentsContract,
    inviteStateType: {
      scheduleItem: { description: "", time: "16:30", title: "Сбор гостей" },
      rsvpQuestion: {
        title: "Сможете ли вы присутствовать?",
        type: "single",
        options: ["Да", "Нет"],
      },
      state: {} as InviteState,
    },
    templateProps: {
      invite: {} as InviteState,
      inviteVars: {} as InviteVars & CSSProperties,
    },
    theme: {} as InviteVars,
  };
}
