"use client";

import { Button, Checkbox, CheckboxGroup, Input, Radio, RadioGroup } from "@heroui/react";
import { useId, useState } from "react";
import { formatDate } from "@/lib/invite-date";
import type { InviteRsvpQuestion } from "@/lib/invite-state";
import { InvitationSectionEyebrow } from "./section-eyebrow";
import styles from "./rsvp-form.module.css";

type InvitationRsvpFormProps = Readonly<{
  className?: string;
  questions: InviteRsvpQuestion[];
  rsvpDate: string;
  siteId?: string;
  text: string;
  variant?: "alpine" | "vanilla" | "aqua";
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InvitationRsvpForm({
  className,
  questions,
  rsvpDate,
  siteId,
  text,
  variant = "alpine",
}: InvitationRsvpFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formId = useId();

  function getResponseKey() {
    const storageKey = `invite.rsvp.response.${siteId}`;
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      return stored;
    }

    const responseKey = window.crypto.randomUUID();
    window.localStorage.setItem(storageKey, responseKey);

    return responseKey;
  }

  return (
    <form
      className={cx(
        styles.form,
        variant === "vanilla" ? styles.vanilla : variant === "aqua" ? styles.aqua : styles.alpine,
        className,
      )}
      onChange={() => {
        setError(null);
        setSubmitted(false);
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!siteId) {
          setSubmitted(true);
          return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
          const formData = new FormData(form);
          const response = await fetch(`/api/sites/${encodeURIComponent(siteId)}/responses`, {
            body: JSON.stringify({
              answers: questions.map((_, questionIndex) => ({
                questionIndex,
                values: formData
                  .getAll(`question-${questionIndex + 1}`)
                  .map((value) => String(value)),
              })),
              guestName: String(formData.get("guestName") ?? ""),
              responseKey: getResponseKey(),
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const result = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Не удалось сохранить ответ.");
          }

          setSubmitted(true);
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "Не удалось сохранить ответ.",
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <header className={styles.header}>
        <InvitationSectionEyebrow>RSVP</InvitationSectionEyebrow>
        <h2 className={styles.title}>Анкета гостя</h2>
        <p className={styles.copy}>{text}</p>
        <p className={styles.deadline}>Ждем ваш ответ до {formatDate(rsvpDate)}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.step}>01</span>
          <div>
            <h3>Расскажите о себе</h3>
            <p>Чтобы мы правильно подписали ваше место</p>
          </div>
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Имя и фамилия</span>
          <Input
            autoComplete="name"
            className={styles.textInput}
            fullWidth
            name="guestName"
            placeholder="Например, Анна Иванова"
            required
            type="text"
            variant="secondary"
          />
        </label>
      </section>

      {questions.map((question, questionIndex) => {
        const questionId = `${formId}-question-${questionIndex}`;
        const name = `question-${questionIndex + 1}`;

        return (
          <section className={styles.section} key={questionId}>
            <div className={styles.sectionHeading}>
              <span className={styles.step}>{String(questionIndex + 2).padStart(2, "0")}</span>
              <div>
                <h3 id={questionId}>{question.title}</h3>
                <p>
                  {question.type === "multiple"
                    ? "Можно выбрать несколько вариантов"
                    : "Выберите один вариант"}
                </p>
              </div>
            </div>
            {question.type === "multiple" ? (
              <CheckboxGroup
                aria-labelledby={questionId}
                className={styles.field}
                name={name}
                variant="secondary"
              >
                <div className={styles.drinkGrid}>
                  {question.options.map((option, optionIndex) => (
                    <Checkbox.Root
                      className={cx(styles.option, styles.drinkOption)}
                      key={`${option}-${optionIndex}`}
                      value={option}
                      variant="secondary"
                    >
                      <Checkbox.Control className={styles.checkboxControl}>
                        <Checkbox.Indicator className={styles.checkboxIndicator}>✓</Checkbox.Indicator>
                      </Checkbox.Control>
                      <Checkbox.Content className={styles.optionText}>
                        <strong>{option}</strong>
                      </Checkbox.Content>
                    </Checkbox.Root>
                  ))}
                </div>
              </CheckboxGroup>
            ) : (
              <RadioGroup
                aria-labelledby={questionId}
                className={styles.choiceGrid}
                isRequired
                name={name}
                variant="secondary"
              >
                {question.options.map((option, optionIndex) => (
                  <Radio.Root
                    className={styles.option}
                    key={`${option}-${optionIndex}`}
                    value={option}
                  >
                    <Radio.Control className={styles.radioControl}>
                      <Radio.Indicator className={styles.radioIndicator}>
                        <span />
                      </Radio.Indicator>
                    </Radio.Control>
                    <Radio.Content className={styles.optionText}>
                      <strong>{option}</strong>
                    </Radio.Content>
                  </Radio.Root>
                ))}
              </RadioGroup>
            )}
          </section>
        );
      })}

      <footer className={styles.footer}>
        <Button
          className={styles.submit}
          isDisabled={isSubmitting}
          type="submit"
          variant="primary"
        >
          <span>Отправить ответ</span>
          <span aria-hidden="true">→</span>
        </Button>
        <p className={styles.helper}>Ответ можно изменить до {formatDate(rsvpDate)}</p>
        {error ? (
          <p className={styles.status} role="alert">
            {error}
          </p>
        ) : null}
        <p className={styles.status} hidden={!submitted} role="status">
          Спасибо! Ваш ответ сохранен. До встречи на празднике!
        </p>
      </footer>
    </form>
  );
}
