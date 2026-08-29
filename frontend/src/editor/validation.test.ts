import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultEditorInvite } from "./template-presets";
import { getEditorStepErrors } from "./validation";

describe("getEditorStepErrors", () => {
  it("has no errors for the default valid invite", () => {
    assert.deepEqual(getEditorStepErrors(defaultEditorInvite), [[], [], [], [], [], []]);
  });

  it("flags a missing groom name", () => {
    const [basicErrors] = getEditorStepErrors({ ...defaultEditorInvite, groom: "  " });
    assert.ok(basicErrors.includes("Укажите имя жениха"));
  });

  it("flags a map link that isn't a Yandex Maps link", () => {
    const [basicErrors] = getEditorStepErrors({
      ...defaultEditorInvite,
      mapUrl: "https://example.com/somewhere",
    });
    assert.ok(basicErrors.includes("Добавьте корректную ссылку на место в Яндекс Картах"));
  });

  it("flags an incomplete schedule item only when the schedule block is shown", () => {
    const invalidSchedule = [{ time: "", title: "Сбор гостей", description: "" }];

    const [, shownErrors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showSchedule: true,
      schedule: invalidSchedule,
    });
    assert.ok(shownErrors.includes("Заполните время и название каждого события"));

    const [, hiddenErrors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showSchedule: false,
      schedule: invalidSchedule,
    });
    assert.deepEqual(hiddenErrors, []);
  });

  it("requires an http(s) group chat link when the block is shown", () => {
    const [, errors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showGroupChat: true,
      groupChatUrl: "not-a-url",
    });
    assert.ok(errors.includes("Ссылка на чат должна начинаться с http:// или https://"));
  });

  it("skips RSVP validation entirely when the block is hidden", () => {
    const [, , errors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showRsvp: false,
      rsvpQuestions: [],
    });
    assert.deepEqual(errors, []);
  });

  it("requires at least one RSVP question with two filled options when shown", () => {
    const [, , noQuestionsErrors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showRsvp: true,
      rsvpQuestions: [],
    });
    assert.ok(noQuestionsErrors.includes("Добавьте хотя бы один вопрос"));

    const [, , tooFewOptionsErrors] = getEditorStepErrors({
      ...defaultEditorInvite,
      showRsvp: true,
      rsvpQuestions: [{ title: "Придёте?", type: "single", options: ["Да"] }],
    });
    assert.ok(
      tooFewOptionsErrors.includes("Заполните вопросы и добавьте минимум два варианта ответа"),
    );
  });

  it("never produces errors for the media and design steps", () => {
    const [, , , mediaErrors, designErrors] = getEditorStepErrors(defaultEditorInvite);
    assert.deepEqual(mediaErrors, []);
    assert.deepEqual(designErrors, []);
  });
});
