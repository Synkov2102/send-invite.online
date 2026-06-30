import { BadRequestException } from "@nestjs/common";
import type { CreateInviteSitePayload } from "@invite/shared";
import type { InviteResponseAnswer } from "./invite-response.store";

const RESPONSE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_ANSWER_VALUE_LENGTH = 200;

export function parseRsvpResponse(
  body: unknown,
  questions: CreateInviteSitePayload["invite"]["rsvpQuestions"],
) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new BadRequestException({ error: "Некорректные данные ответа." });
  }

  const record = body as Record<string, unknown>;
  const guestName = typeof record.guestName === "string" ? record.guestName.trim() : "";
  const responseKey = typeof record.responseKey === "string" ? record.responseKey : "";

  if (guestName.length < 2 || guestName.length > 120) {
    throw new BadRequestException({ error: "Укажите имя гостя." });
  }

  if (!RESPONSE_KEY_PATTERN.test(responseKey)) {
    throw new BadRequestException({ error: "Некорректный идентификатор ответа." });
  }

  if (!Array.isArray(record.answers)) {
    throw new BadRequestException({ error: "Ответы на вопросы не найдены." });
  }

  const answersByIndex = new Map<number, string[]>();

  for (const item of record.answers) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new BadRequestException({ error: "Некорректный ответ на вопрос." });
    }

    const answer = item as Record<string, unknown>;
    const questionIndex =
      typeof answer.questionIndex === "number" ? answer.questionIndex : -1;
    const values = Array.isArray(answer.values)
      ? answer.values.filter(
          (value): value is string =>
            typeof value === "string" && value.length <= MAX_ANSWER_VALUE_LENGTH,
        )
      : [];

    if (
      !Number.isInteger(questionIndex) ||
      questionIndex < 0 ||
      questionIndex >= questions.length ||
      answersByIndex.has(questionIndex)
    ) {
      throw new BadRequestException({ error: "Некорректный номер вопроса." });
    }

    answersByIndex.set(questionIndex, [...new Set(values)]);
  }

  const answers: InviteResponseAnswer[] = questions.map((question, questionIndex) => {
    const values = answersByIndex.get(questionIndex) ?? [];

    if (
      values.some((value) => !question.options.includes(value)) ||
      (question.type === "single" && values.length !== 1)
    ) {
      throw new BadRequestException({
        error: `Проверьте ответ на вопрос «${question.title}».`,
      });
    }

    return {
      question: question.title,
      questionIndex,
      values,
    };
  });

  return {
    answers,
    guestName,
    responseKey,
  };
}
