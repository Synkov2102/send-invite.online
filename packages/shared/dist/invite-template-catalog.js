"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultInviteTemplates = exports.inviteTemplateCatalog = exports.isInviteTemplate = void 0;
exports.toPublicTemplate = toPublicTemplate;
exports.getTemplateDefinition = getTemplateDefinition;
exports.getTemplateKind = getTemplateKind;
exports.getInviteTemplateName = getInviteTemplateName;
exports.isEditorReadyTemplate = isEditorReadyTemplate;
exports.getEditorReadyTemplates = getEditorReadyTemplates;
exports.getEditorPreset = getEditorPreset;
exports.isWideTemplateKind = isWideTemplateKind;
exports.getInviteTemplate = getInviteTemplate;
var invite_template_schema_1 = require("./schemas/invite-template.schema");
Object.defineProperty(exports, "isInviteTemplate", { enumerable: true, get: function () { return invite_template_schema_1.isInviteTemplate; } });
const vanillaEditorPreset = {
    bride: "Катя",
    groom: "Миша",
    date: "2027-11-20",
    time: "16:30",
    city: "Павловск",
    venue: "замке БИП",
    address: "Мариинская ул., 4",
    lead: "С огромным волнением и радостью мы приглашаем вас разделить с нами этот особенный день — нашу свадьбу. Это будет незабываемое событие, и мы хотим, чтобы вы стали его частью.",
    dressCode: "Для нас главное — ваше присутствие. Будем рады, если в вашем образе появятся оттенки нашей свадебной палитры.",
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
const aquaEditorPreset = {
    bride: "Марина",
    groom: "Артём",
    city: "Сочи",
    venue: "Прибрежная вилла",
    address: "Набережная, 1",
    lead: "Под шум волн и тёплый закат мы приглашаем вас разделить с нами самый счастливый день. Будет море, музыка и бесконечная любовь.",
    dressCodeColors: ["#eafcff", "#7fd0d6", "#159aa6", "#0b3a44", "#e7d3a8"],
    paletteId: "aqua",
};
const silkEditorPreset = {
    bride: "Анна",
    groom: "Максим",
    date: "2026-05-05",
    time: "15:00",
    city: "Москва",
    venue: "Golden Hall",
    address: "ул. 1 Мая, 118",
    lead: "Один день в этом году будет для нас особенным, и мы хотим провести его в кругу близких и друзей. С большим удовольствием приглашаем вас на знаменательный праздник - нашу свадьбу.",
    dressCode: "Нам будет особенно приятно видеть вас в нарядах цветовой гаммы нашей свадьбы.",
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
const clarityEditorPreset = {
    bride: "Маша",
    groom: "Саша",
    date: "2026-06-26",
    time: "15:00",
    city: "Москва",
    venue: "Svoy Hamovniki",
    address: "ул. Льва Толстого, 23",
    lead: "Это всё потому, что два человека влюбились. С радостью приглашаем вас разделить с нами самый трогательный и важный момент нашей жизни.",
    dressCode: "Мы очень трепетно готовим наше торжество и будем благодарны, если вы поддержите его цветовую гамму и стилистику в своих образах.",
    dressCodeColors: ["#d9dfeb", "#f4f1e5", "#817017", "#49413f"],
    schedule: [
        { time: "15:00", title: "Сбор гостей", description: "Общение с гостями и праздничный фуршет" },
        { time: "15:30", title: "Церемония", description: "Пожалуйста, не стесняйтесь проявлять ваши искренние эмоции" },
        { time: "16:30", title: "Банкет", description: "Время танцев, веселья, ваших поздравлений и вкусной еды" },
    ],
    rsvpText: "Пожалуйста, подтвердите ваше присутствие. Ответы помогут нам внимательно подготовить этот день.",
    rsvpDate: "2026-06-01",
    paletteId: "clarity",
};
const minimalEditorPreset = {
    bride: "Анна",
    groom: "Михаил",
    date: "2026-08-22",
    time: "16:00",
    city: "Москва",
    venue: "Усадьба Муравьёвых-Апостолов",
    address: "Старая Басманная ул., 23/9с1",
    lead: "Совсем скоро наступит день, который мы хотим разделить с самыми близкими. Будем счастливы видеть вас рядом и вместе прожить эту красивую историю.",
    dressCode: "Для нас главное — ваше присутствие. Будем рады, если в образах появятся спокойные природные и молочные оттенки.",
    dressCodeColors: ["#f4efe6", "#d7c7b2", "#9d8270", "#6f7667", "#3f453e"],
    schedule: [
        { time: "15:30", title: "Сбор гостей", description: "Приветственный бокал и первые встречи" },
        { time: "16:00", title: "Церемония", description: "Самый важный момент этого дня" },
        { time: "17:00", title: "Ужин", description: "Тёплый вечер, музыка и танцы" },
    ],
    rsvpDate: "2026-07-22",
    paletteId: "porcelain",
};
const electricEditorPreset = {
    bride: "Лера",
    groom: "Макс",
    date: "2027-07-17",
    time: "16:00",
    city: "Москва",
    venue: "LOFT HALL",
    address: "ул. Ленинская Слобода, 26",
    lead: "Мы решили устроить день, в котором будет много цвета, громкой музыки, объятий и любимых людей. Будем счастливы разделить его с вами.",
    dressCode: "Поддержите настроение праздника яркой деталью или соберите образ в цветах нашей палитры.",
    dressCodeColors: ["#fff600", "#5824ff", "#ff5c35", "#111111", "#fffaf0"],
    schedule: [
        { time: "15:30", title: "Встречаемся", description: "Приветственный бар и первые фотографии" },
        { time: "16:00", title: "Церемония", description: "Самая важная часть нашего дня" },
        { time: "17:00", title: "Ужин", description: "Тосты, разговоры и праздничный стол" },
        { time: "20:00", title: "Танцы", description: "Музыка громче, каблуки — в сторону" },
    ],
    rsvpDate: "2027-06-17",
    paletteId: "electric-lemon",
};
exports.inviteTemplateCatalog = [
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
        screenshot: "/images/templates/vanilla-arch-mobile.png",
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
        name: "Clarity",
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
        name: "Electric vows",
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
        name: "Тихая история",
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
];
const templateDefinitionById = new Map(exports.inviteTemplateCatalog.map((template) => [template.id, template]));
function toPublicTemplate(definition) {
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
function getTemplateDefinition(id) {
    if (!id) {
        return exports.inviteTemplateCatalog[0];
    }
    return templateDefinitionById.get(id) ?? exports.inviteTemplateCatalog[0];
}
function getTemplateKind(templateId) {
    return getTemplateDefinition(templateId).kind;
}
function getInviteTemplateName(templateId) {
    return getTemplateDefinition(templateId).name;
}
function isEditorReadyTemplate(templateId) {
    return getTemplateDefinition(templateId).editorReady;
}
function getEditorReadyTemplates() {
    return exports.inviteTemplateCatalog
        .filter((template) => template.editorReady)
        .map(toPublicTemplate);
}
function getEditorPreset(templateId) {
    return getTemplateDefinition(templateId).editorPreset;
}
function isWideTemplateKind(kind) {
    return kind !== "alpine";
}
exports.defaultInviteTemplates = exports.inviteTemplateCatalog.map(toPublicTemplate);
function getInviteTemplate(id) {
    return toPublicTemplate(getTemplateDefinition(id));
}
