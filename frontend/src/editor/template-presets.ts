import type { InviteState } from "@/lib/invite-state";
import { normalizeInviteState } from "@/lib/invite-state";
import { getTemplateDefinition } from "@/lib/invite-templates";
import type { InviteTemplate } from "@/lib/invite-templates";
import { getTemplateMusicPreset } from "./music-tracks";

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
  showSchedule: true,
  showDressCode: true,
  showGroupChat: true,
  groupChatUrl: "https://t.me/+invite-guests",
  groupChatText:
    "Присоединяйтесь к общему чату гостей — там будут новости, координация и ответы на вопросы.",
  showAdditionalInfo: true,
  additionalInfo:
    "Если планируете остаться на ночь, напишите нам заранее — подскажем варианты проживания рядом с площадкой. Парковка бесплатная.",
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
  ...getTemplateMusicPreset("alpine-rings"),
  coverImageUrl: "",
  portraitImageUrl: "",
  venueImageUrl: "",
};

export function getInitialInvite(template: InviteTemplate): InviteState {
  const definition = getTemplateDefinition(template.id);

  return normalizeInviteState({
    ...defaultEditorInvite,
    ...definition.editorPreset,
    ...getTemplateMusicPreset(template.id),
    paletteId: definition.defaultPaletteId,
  });
}
