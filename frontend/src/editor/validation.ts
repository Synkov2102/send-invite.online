import type { InviteState } from "@/lib/invite-state";
import { getYandexMapsUrl } from "@/lib/invite-map";

export function getEditorStepErrors(invite: InviteState) {
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
