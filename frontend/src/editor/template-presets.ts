import type { InviteTemplate } from "@invite/shared";
import { getTemplateDefinition } from "@invite/shared";
import type { InviteState } from "@/lib/invite-state";

export const defaultEditorInvite: InviteState = {
  bride: "Диана",
  groom: "Владлен",
  date: "2026-09-14",
  time: "16:30",
  city: "Алматы",
  venue: "Горная резиденция",
  address: "Долина у подножия гор",
  lead:
    "Приглашаем отпраздновать самое важное событие в нашей жизни - день свадьбы.",
  mapUrl: "",
  dressCode:
    "Будем рады, если вы поддержите атмосферу нашего праздника и выберете образ в оттенках свадебной палитры.",
  dressCodeColors: ["#fffaf0", "#9caf88", "#3a3d3f", "#f3d9b1"],
  schedule: [
    { time: "16:30", title: "Сбор гостей", description: "Знакомимся и встречаемся" },
    { time: "17:00", title: "Церемония", description: "Самый трогательный момент дня" },
    { time: "18:00", title: "Ужин", description: "Праздничный ужин и поздравления" },
    { time: "20:30", title: "Торт и танцы", description: "Время праздновать и танцевать" },
  ],
  showRsvp: true,
  rsvpDate: "2026-08-01",
  rsvpText:
    "Пожалуйста, заполните небольшую анкету. Ваши ответы помогут нам сделать праздник комфортным для каждого гостя.",
  rsvpQuestions: [
    {
      title: "Сможете ли вы присутствовать?",
      type: "single",
      options: ["Да, с удовольствием", "Буду с сопровождающим", "К сожалению, не смогу"],
    },
    {
      title: "Какие напитки вы предпочитаете?",
      type: "multiple",
      options: ["Игристое", "Вино", "Крепкие напитки", "Без алкоголя"],
    },
  ],
  paletteId: "alpine",
  ringMetal: "0",
  musicEnabled: true,
  musicTitle: "I Want You Back",
  musicUrl:
    "https://968f8970-1acf-4a3b-a3cc-475290d4d84e.selstorage.ru/Jackson%205%20-%20I%20Want%20You%20Back.mp3",
  coverImageUrl: "",
  portraitImageUrl: "",
  venueImageUrl: "",
};

export function getInitialInvite(template: InviteTemplate): InviteState {
  const definition = getTemplateDefinition(template.id);

  return {
    ...defaultEditorInvite,
    ...definition.editorPreset,
    paletteId: definition.defaultPaletteId,
  };
}
