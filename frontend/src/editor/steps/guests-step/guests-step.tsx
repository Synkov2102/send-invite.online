"use client";

import { Button } from "@heroui/react";
import { Check, Info, ListChecks, Plus, Trash2 } from "lucide-react";
import { FieldGroup, TextAreaField, TextInput } from "../../components";
import panelStyles from "../../components/editor-step-panel/editor-step-panel.module.css";
import toggleStyles from "../../components/editor-toggle/editor-toggle.module.css";
import textFieldStyles from "../../components/text-field/text-field.module.css";
import { useEditor } from "../../editor-context";
import styles from "./guests-step.module.css";

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
    <section className={`${panelStyles.panel} ${isActive ? panelStyles.active : ""}`}>
      <FieldGroup
        title="Гости"
        description="Настройте подтверждение участия и вопросы для анкеты."
        hint="Поле имени будет добавлено автоматически, поэтому здесь нужны только вопросы к гостям."
      >
        <label className={toggleStyles.toggle}>
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
            <div className={styles.formBuilder}>
              <div className={styles.formBuilderHead}>
                <div>
                  <p>Вопросы анкеты</p>
                  <span>
                    {invite.rsvpQuestions.length} из 8 вопросов. Поле имени добавляется
                    автоматически.
                  </span>
                </div>
                <Button
                  className={styles.formBuilderAdd}
                  isDisabled={invite.rsvpQuestions.length >= 8}
                  onClick={addRsvpQuestion}
                  type="button"
                  variant="outline"
                >
                  <Plus aria-hidden size={14} />
                  Вопрос
                </Button>
              </div>
              <div className={styles.formBuilderGuide}>
                <Info aria-hidden size={15} />
                <div>
                  <strong>Как гость увидит форму</strong>
                  <span>
                    Сначала он укажет имя и подтвердит участие, затем ответит на
                    ваши дополнительные вопросы ниже.
                  </span>
                </div>
              </div>
              {invite.rsvpQuestions.map((question, questionIndex) => (
                <div className={styles.question} key={`rsvp-question-${questionIndex}`}>
                  <div className={styles.questionHead}>
                    <div>
                      <span>Вопрос {questionIndex + 1}</span>
                      <strong>{question.title || "Новый вопрос"}</strong>
                    </div>
                    <Button
                      aria-label={`Удалить вопрос ${questionIndex + 1}`}
                      className={styles.questionRemove}
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
                  <p className={styles.questionHint}>
                    Это заголовок, который увидит гость. Например: “Будете ли вы с
                    сопровождающим?” или “Какие напитки предпочитаете?”.
                  </p>
                  <div className={textFieldStyles.field}>
                    <span className={textFieldStyles.label}>Тип ответа</span>
                    <p className={styles.questionInlineHelp}>
                      Выберите, сколько вариантов можно отметить в этом вопросе.
                    </p>
                    <div className={styles.answerType} aria-label="Тип ответа">
                      {(["single", "multiple"] as const).map((type) => (
                        <button
                          aria-pressed={question.type === type}
                          className={question.type === type ? styles.isActive : ""}
                          key={type}
                          onClick={() => updateRsvpQuestion(questionIndex, "type", type)}
                          type="button"
                        >
                          {question.type === type ? (
                            <Check aria-hidden size={14} />
                          ) : (
                            <ListChecks aria-hidden size={14} />
                          )}
                          <span>
                            <strong>
                              {type === "single" ? "Один вариант" : "Несколько вариантов"}
                            </strong>
                            <small>
                              {type === "single"
                                ? "Гость выберет один ответ"
                                : "Можно отметить несколько"}
                            </small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.questionOptions}>
                    <div className={styles.questionOptionsHead}>
                      <div>
                        <span>Варианты ответа</span>
                        <p>Это кнопки выбора, которые появятся у гостя под вопросом.</p>
                      </div>
                      <small>{question.options.length} из 8</small>
                    </div>
                    {question.options.map((option, optionIndex) => (
                      <div className={styles.questionOption} key={`option-${optionIndex}`}>
                        <span className={styles.questionOptionIndex}>{optionIndex + 1}</span>
                        <TextInput
                          label={`Вариант ${optionIndex + 1}`}
                          value={option}
                          onChange={(value) =>
                            updateRsvpOption(questionIndex, optionIndex, value)
                          }
                        />
                        <Button
                          aria-label={`Удалить вариант ${optionIndex + 1}`}
                          className={styles.questionRemove}
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
                      className={styles.questionAddOption}
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
