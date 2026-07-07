"use client";

import { Button } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import type { InviteRsvpQuestion } from "@/lib/invite-state";
import { FieldGroup, TextAreaField, TextInput } from "../components";
import { useEditor } from "../editor-context";

type StepPanelProps = {
  isActive: boolean;
};

export function GuestsStep({ isActive }: StepPanelProps) {
  const {
    invite,
    addRsvpOption,
    addRsvpQuestion,
    removeRsvpOption,
    removeRsvpQuestion,
    updateInvite,
    updateRsvpOption,
    updateRsvpQuestion,
  } = useEditor();

  return (
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
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
  );
}
