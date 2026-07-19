/**
 * Каталог шаблонов — единая точка регистрации.
 *
 * Чтобы добавить шаблон на существующем движке:
 * 1. Добавьте объект в `inviteTemplateCatalog` ниже.
 * 2. Укажите `kind` (alpine | aqua | clarity | minimal | silk | electric) и `editorReady: true`.
 * 3. Положите скриншот в frontend/public/images/templates/ и mobile-версию `*-mobile.png`
 *    (можно собрать: `node frontend/scripts/capture-template-screenshots.mjs` при запущенном frontend).
 *
 * Чтобы добавить новый движок рендера:
 * 1. Создайте папку frontend/src/invitation-templates/<kind>/.
 * 2. Добавьте kind в TemplateKind и loader в invitation-templates/registry.ts.
 */
import type { InviteState } from "./invite-state";
import type { CoverType, InviteTemplate } from "./schemas/invite-template.schema";

export type { CoverType, InviteTemplate };
export { isInviteTemplate } from "./schemas/invite-template.schema";

export type TemplateKind = "alpine" | "aqua" | "clarity" | "editorial" | "electric" | "minimal" | "silk";

export type InviteTemplateDefinition = InviteTemplate & {
  /** Какой React-движок рисует шаблон. */
  kind: TemplateKind;
  /** Показывать в каталоге и открывать в редакторе. */
  editorReady: boolean;
  /** Демо-тексты при первом открытии в редакторе (необязательно). */
  editorPreset?: Partial<InviteState>;
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
  showGroupChat: true,
  groupChatUrl: "https://t.me/+lagoon-guests",
  groupChatText:
    "Общий чат гостей у воды: координация трансфера, новости дня и тёплые фото с праздника.",
  showAdditionalInfo: true,
  additionalInfo:
    "До площадки удобнее добираться такси или шаттлом от отеля. Парковка у виллы ограничена — лучше без машины. Если остаётесь на ночь, напишите нам заранее.",
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
  showGroupChat: true,
  groupChatUrl: "https://t.me/+silk-guests",
  groupChatText:
    "Общий чат гостей: детали дня, размещение и тёплые новости перед торжеством.",
  showAdditionalInfo: true,
  additionalInfo:
    "Просим подтвердить присутствие заранее. Если планируете остаться в городе на ночь — напишите нам, подскажем отели рядом с площадкой.",
  rsvpText: "Ваши ответы очень помогут нам при организации свадьбы.",
  rsvpDate: "2026-04-20",
  paletteId: "silk",
};

const clarityEditorPreset: Partial<InviteState> = {
  bride: "Маша",
  groom: "Саша",
  date: "2026-06-26",
  time: "15:00",
  city: "Москва",
  venue: "Svoy Hamovniki",
  address: "ул. Льва Толстого, 23",
  lead:
    "Это всё потому, что два человека влюбились. С радостью приглашаем вас разделить с нами самый трогательный и важный момент нашей жизни.",
  dressCode:
    "Мы очень трепетно готовим наше торжество и будем благодарны, если вы поддержите его цветовую гамму и стилистику в своих образах.",
  dressCodeColors: ["#d9dfeb", "#f4f1e5", "#817017", "#49413f"],
  schedule: [
    { time: "15:00", title: "Сбор гостей", description: "Общение с гостями и праздничный фуршет" },
    { time: "15:30", title: "Церемония", description: "Пожалуйста, не стесняйтесь проявлять ваши искренние эмоции" },
    { time: "16:30", title: "Банкет", description: "Время танцев, веселья, ваших поздравлений и вкусной еды" },
  ],
  showGroupChat: true,
  groupChatUrl: "https://t.me/+clarity-guests",
  groupChatText:
    "В чате — тайминг дня, логистика и короткие обновления. Пишите сюда, если появятся вопросы до свадьбы.",
  showAdditionalInfo: true,
  additionalInfo:
    "Парковка во дворе комплекса. Если остаётесь в городе на ночь — напишите нам, подскажем отели в пешей доступности.",
  rsvpText:
    "Пожалуйста, подтвердите ваше присутствие. Ответы помогут нам внимательно подготовить этот день.",
  rsvpDate: "2026-06-01",
  paletteId: "clarity",
};

const minimalEditorPreset: Partial<InviteState> = {
  bride: "Анна",
  groom: "Михаил",
  date: "2026-08-22",
  time: "16:00",
  city: "Москва",
  venue: "Усадьба Муравьёвых-Апостолов",
  address: "Старая Басманная ул., 23/9с1",
  lead:
    "Совсем скоро наступит день, который мы хотим разделить с самыми близкими. Будем счастливы видеть вас рядом и вместе прожить эту красивую историю.",
  dressCode:
    "Для нас главное — ваше присутствие. Будем рады, если в образах появятся спокойные природные и молочные оттенки.",
  dressCodeColors: ["#f4efe6", "#d7c7b2", "#9d8270", "#6f7667", "#3f453e"],
  schedule: [
    { time: "15:30", title: "Сбор гостей", description: "Приветственный бокал и первые встречи" },
    { time: "16:00", title: "Церемония", description: "Самый важный момент этого дня" },
    { time: "17:00", title: "Ужин", description: "Тёплый вечер, музыка и танцы" },
  ],
  showGroupChat: true,
  groupChatUrl: "https://t.me/+minimal-guests",
  groupChatText:
    "В общем чате — мягкие напоминания о дне, логистика и ответы на вопросы без спешки.",
  showAdditionalInfo: true,
  additionalInfo:
    "Если планируете остаться в городе на ночь, напишите нам — подскажем спокойные отели рядом с усадьбой. Парковка во дворе ограничена.",
  rsvpDate: "2026-07-22",
  paletteId: "porcelain",
};

const electricEditorPreset: Partial<InviteState> = {
  bride: "Лера",
  groom: "Макс",
  date: "2027-07-17",
  time: "16:00",
  city: "Москва",
  venue: "LOFT HALL",
  address: "ул. Ленинская Слобода, 26",
  lead:
    "Мы решили устроить день, в котором будет много цвета, громкой музыки, объятий и любимых людей. Будем счастливы разделить его с вами.",
  dressCode:
    "Поддержите настроение праздника яркой деталью или соберите образ в цветах нашей палитры.",
  dressCodeColors: ["#fff600", "#5824ff", "#ff5c35", "#111111", "#fffaf0"],
  schedule: [
    { time: "15:30", title: "Встречаемся", description: "Приветственный бар и первые фотографии" },
    { time: "16:00", title: "Церемония", description: "Самая важная часть нашего дня" },
    { time: "17:00", title: "Ужин", description: "Тосты, разговоры и праздничный стол" },
    { time: "20:00", title: "Танцы", description: "Музыка громче, каблуки — в сторону" },
  ],
  showGroupChat: true,
  groupChatUrl: "https://t.me/+electric-guests",
  groupChatText:
    "Чат гостей: тайминг, плейлист и срочные апдейты. Пишите туда — ответим быстро.",
  showAdditionalInfo: true,
  additionalInfo:
    "Парковка у лофта платная. Если остаётесь в городе — напишите, кинем пару отелей рядом.",
  rsvpDate: "2027-06-17",
  paletteId: "electric-lemon",
};

const editorialEditorPreset: Partial<InviteState> = {
  bride: "Елизавета",
  groom: "Максим",
  date: "2027-04-10",
  time: "16:00",
  city: "Санкт-Петербург",
  venue: "Галерея на Неве",
  address: "Английская наб., 28",
  lead: "С любовью и радостью приглашаем вас разделить с нами этот особенный день. Будем счастливы видеть рядом самых близких.",
  dressCode:
    "Будем благодарны, если в своих образах вы поддержите спокойную гамму нашего праздника.",
  dressCodeColors: ["#ded0cb", "#48647c", "#0d0b0d"],
  schedule: [
    { time: "16:00", title: "Сбор гостей", description: "Приветственный бокал и первые встречи" },
    { time: "16:30", title: "Церемония", description: "Самый важный момент этого дня" },
    { time: "17:30", title: "Ужин", description: "Поздравления, музыка и разговоры" },
    { time: "20:00", title: "Фотосессия", description: "Поймаем мягкий вечерний свет" },
    { time: "21:00", title: "Финал", description: "Торт, танцы и объятия" },
  ],
  showGroupChat: true,
  groupChatUrl: "https://t.me/+editorial-guests",
  groupChatText:
    "В общем чате гостей будут новости дня, детали трансфера и фотографии после праздника.",
  showAdditionalInfo: true,
  additionalInfo:
    "После свадьбы мы отправимся в путешествие. Если вы захотите сделать подарок, будем рады вкладу в наши будущие впечатления вместо цветов.",
  rsvpText:
    "Пожалуйста, подтвердите присутствие. Ваши ответы помогут нам внимательно подготовить этот день.",
  rsvpDate: "2027-03-15",
  paletteId: "ivory-noir",
};

const alpineEditorPreset: Partial<InviteState> = {
  showGroupChat: true,
  groupChatUrl: "https://t.me/+invite-guests",
  groupChatText:
    "Присоединяйтесь к общему чату гостей — там будут новости, координация и ответы на вопросы.",
  showAdditionalInfo: true,
  additionalInfo:
    "Если планируете остаться на ночь, напишите нам заранее — подскажем варианты проживания рядом с площадкой. Парковка бесплатная.",
};

export const inviteTemplateCatalog: InviteTemplateDefinition[] = [
  {
    id: "alpine-rings",
    name: "Кольца",
    description: "Обложка с 3D-кольцами и спокойной горной палитрой.",
    coverType: "rings",
    kind: "alpine",
    editorReady: true,
    editorPreset: alpineEditorPreset,
    defaultPaletteId: "alpine",
    recommendedPaletteIds: [
      "alpine",
      "pine",
      "granite",
      "frost",
      "dawn",
      "pearl",
      "alpine-twilight",
      "alpine-lilac",
      "alpine-berry",
      "alpine-terracotta",
    ],
    tags: ["3D", "минимализм"],
    screenshot: "/images/templates/alpine-rings-mobile.png",
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
    screenshot: "/images/templates/lagoon-wave-mobile.png",
    preview: {
      background: "#0e3a44",
      surface: "#eafaf9",
      ink: "#0b2a33",
      accent: "#16a3ad",
    },
  },
  {
    id: "silk-monogram",
    name: "Шёлк",
    description: "Классическое приглашение с шелковым фоном, черно-белыми фото и монограммой пары.",
    coverType: "arch",
    kind: "silk",
    editorReady: true,
    editorPreset: silkEditorPreset,
    defaultPaletteId: "silk",
    recommendedPaletteIds: ["silk", "pearl", "graphite", "champagne", "nocturne"],
    tags: ["фото", "классика"],
    screenshot: "/images/templates/silk-monogram-mobile.png",
    preview: {
      background: "#d5c7bd",
      surface: "#fffefd",
      ink: "#171514",
      accent: "#b9a78f",
    },
  },
  {
    id: "clarity-editorial",
    name: "Ясность",
    description: "Минималистичное приглашение с журнальной типографикой, крупной фотографией и ясной композицией.",
    coverType: "arch",
    kind: "clarity",
    editorReady: true,
    editorPreset: clarityEditorPreset,
    defaultPaletteId: "clarity",
    recommendedPaletteIds: ["clarity", "graphite", "pearl", "silk", "nocturne"],
    tags: ["фото", "editorial"],
    screenshot: "/images/templates/clarity-editorial-mobile.png",
    preview: {
      background: "#b8b4aa",
      surface: "#f5f3e9",
      ink: "#302f2c",
      accent: "#817017",
    },
  },
  {
    id: "electric-vows",
    name: "Неон",
    description: "Яркое плакатное приглашение с контрастной типографикой, цветными полями и дерзкой журнальной сеткой.",
    coverType: "arch",
    kind: "electric",
    editorReady: true,
    editorPreset: electricEditorPreset,
    defaultPaletteId: "electric-lemon",
    recommendedPaletteIds: [
      "electric-lemon",
      "ultraviolet",
      "electric-lime",
      "signal-orange",
      "electric-cobalt",
      "hot-pink",
      "mint-noir",
      "cherry-flash",
      "sky-coral",
      "lavender-pop",
    ],
    tags: ["яркий", "editorial"],
    screenshot: "/images/templates/electric-vows-mobile.png",
    preview: {
      background: "#fff600",
      surface: "#fffaf0",
      ink: "#0a0a0a",
      accent: "#5824ff",
    },
  },
  {
    id: "minimal-paper",
    name: "Бумага",
    description: "Фарфорово-синее приглашение с рукописной типографикой, воздушной вёрсткой и авторской line-art иллюстрацией.",
    coverType: "arch",
    kind: "minimal",
    editorReady: true,
    editorPreset: minimalEditorPreset,
    defaultPaletteId: "porcelain",
    recommendedPaletteIds: [
      "porcelain",
      "paper-herbarium",
      "paper-terracotta",
      "paper-burgundy",
      "paper-lavender",
      "paper-midnight",
      "paper-peach-sage",
      "paper-mocha",
      "paper-mint-bronze",
      "paper-noir-blush",
    ],
    tags: ["минимализм", "бумага"],
    screenshot: "/images/templates/minimal-paper-mobile.png",
    preview: {
      background: "#d9e0e5",
      surface: "#f7f3ea",
      ink: "#26394c",
      accent: "#466f96",
    },
  },
  {
    id: "editorial-vow",
    name: "Галерея",
    description:
      "Контрастное приглашение с тёплой бумагой, чёрными деталями, крупной антиквой и атмосферной фотосерией.",
    coverType: "arch",
    kind: "editorial",
    editorReady: true,
    editorPreset: editorialEditorPreset,
    defaultPaletteId: "ivory-noir",
    recommendedPaletteIds: [
      "ivory-noir",
      "editorial-oxblood",
      "editorial-midnight",
      "editorial-forest",
      "editorial-terracotta",
      "editorial-plum",
      "editorial-mocha",
      "editorial-dusty-rose",
      "editorial-slate",
      "editorial-sepia",
    ],
    tags: ["фото", "editorial"],
    screenshot: "/images/templates/editorial-vow-mobile.png",
    preview: {
      background: "#09090b",
      surface: "#f6f1e9",
      ink: "#121113",
      accent: "#48647c",
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
