import type { InviteState } from "@/lib/invite-state";

/**
 * Стресс-данные для проверки раскладки шаблонов (`?fixture=`).
 * Используются только приватным capture-роутом и тестами `frontend/tests`.
 */

/** Слово без пробелов — переносить его можно только принудительно. */
const UNBREAKABLE = "Достопримечательностьвысокопревосходительство";

function repeatWords(word: string, length: number) {
  return `${word} `.repeat(Math.ceil(length / (word.length + 1))).slice(0, length).trim();
}

const minimal: Partial<InviteState> = {
  bride: "Я",
  groom: "О",
  city: "",
  venue: "Дом",
  address: "",
  mapUrl: "",
  lead: "",
  dressCode: "",
  dressCodeColors: ["#ffffff"],
  schedule: [{ time: "18:00", title: "Ужин", description: "" }],
  showGroupChat: false,
  groupChatUrl: "",
  groupChatText: "",
  showAdditionalInfo: false,
  additionalInfo: "",
  showRsvp: false,
  rsvpText: "",
  rsvpQuestions: [],
  musicEnabled: false,
  musicTitle: "",
  musicUrl: "",
};

const overflow: Partial<InviteState> = {
  bride: UNBREAKABLE,
  groom: UNBREAKABLE,
  city: UNBREAKABLE,
  venue: `${UNBREAKABLE} ${UNBREAKABLE}`,
  address: `улица ${UNBREAKABLE}, дом 1234567890, корпус 9876543210`,
  lead: `${UNBREAKABLE} ${repeatWords("бесконечное приветствие", 400)}`,
  dressCode: `${UNBREAKABLE} ${repeatWords("оттенки палитры", 300)}`,
  dressCodeColors: [
    "#ffffff",
    "#f4ece0",
    "#dcc7a8",
    "#b8503a",
    "#7c4230",
    "#2f2721",
    "#1b2b24",
    "#c2652f",
  ],
  schedule: Array.from({ length: 10 }, (_, index) => ({
    time: `${String(index + 8).padStart(2, "0")}:30`,
    title: `${UNBREAKABLE} ${index + 1}`,
    description: `${UNBREAKABLE} ${repeatWords("описание пункта программы", 180)}`,
  })),
  showGroupChat: true,
  groupChatUrl: `https://t.me/+${UNBREAKABLE}`,
  groupChatText: `${UNBREAKABLE} ${repeatWords("новости и координация", 300)}`,
  showAdditionalInfo: true,
  additionalInfo: `${UNBREAKABLE} ${repeatWords("важная деталь дня", 900)}`,
  showRsvp: true,
  rsvpText: `${UNBREAKABLE} ${repeatWords("подтвердите присутствие", 400)}`,
  rsvpQuestions: Array.from({ length: 8 }, (_, index) => ({
    title: `${UNBREAKABLE} — вопрос ${index + 1}`,
    type: index % 2 === 0 ? "single" : "multiple",
    options: Array.from({ length: 6 }, (__, option) => `${UNBREAKABLE} ${option + 1}`),
  })),
};

/** Верхняя граница схемы: столько данных ещё примет бэкенд. */
const limits: Partial<InviteState> = {
  bride: repeatWords("Александрина", 120),
  groom: repeatWords("Иннокентий", 120),
  city: repeatWords("Петропавловск", 120),
  venue: repeatWords("Загородный комплекс", 200),
  address: repeatWords("улица Длинная", 300),
  lead: repeatWords("Мы приглашаем вас", 2000),
  dressCode: repeatWords("Поддержите палитру", 500),
  dressCodeColors: Array.from({ length: 20 }, (_, index) =>
    index % 2 === 0 ? "#b8503a" : "#2f2721",
  ),
  schedule: Array.from({ length: 30 }, (_, index) => ({
    time: `${String(index % 24).padStart(2, "0")}:15`,
    title: repeatWords(`Событие ${index + 1}`, 120),
    description: repeatWords("Подробное описание пункта", 500),
  })),
  showGroupChat: true,
  groupChatText: repeatWords("Общий чат гостей", 500),
  showAdditionalInfo: true,
  additionalInfo: repeatWords("Дополнительная информация", 2000),
  showRsvp: true,
  rsvpText: repeatWords("Пожалуйста, ответьте", 2000),
  rsvpQuestions: Array.from({ length: 20 }, (_, index) => ({
    title: repeatWords(`Вопрос номер ${index + 1}`, 200),
    type: index % 2 === 0 ? "single" : "multiple",
    options: Array.from({ length: 20 }, (__, option) =>
      repeatWords(`Вариант ответа ${option + 1}`, 100),
    ),
  })),
};

export const captureFixtures = { limits, minimal, overflow } satisfies Record<
  string,
  Partial<InviteState>
>;

export type CaptureFixtureName = keyof typeof captureFixtures;

export function getCaptureFixture(name: string | undefined) {
  if (!name) {
    return undefined;
  }

  return captureFixtures[name as CaptureFixtureName];
}
