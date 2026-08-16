"use client";

import { Download, X } from "lucide-react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import type { InviteResponseData } from "@/lib/backend-api";
import styles from "./responses-modal.module.css";

type ResponsesModalProps = {
  data: InviteResponseData;
  downloadUrl: string;
  onClose: () => void;
  title: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Ответы гостей в отдельном окне: таблица растёт вширь по числу вопросов и
 * вниз по числу гостей, поэтому единственный скролл-контейнер здесь двумерный,
 * с залипающей шапкой и первой колонкой — иначе на длинном списке теряется,
 * чей это ответ и что за вопрос в колонке.
 */
export default function ResponsesModal({
  data,
  downloadUrl,
  onClose,
  title,
}: ResponsesModalProps) {
  const titleId = useId();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className={styles.header}>
          <div>
            <p>Ответы гостей</p>
            <h2 id={titleId}>{title}</h2>
          </div>

          <div className={styles.actions}>
            <a className={styles.download} href={downloadUrl}>
              <Download aria-hidden size={15} />
              Excel
            </a>
            <button aria-label="Закрыть" className={styles.close} onClick={onClose} type="button">
              <X aria-hidden size={18} />
            </button>
          </div>
        </header>

        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Гость</th>
                {data.questions.map((question) => (
                  <th key={question} scope="col">
                    {question}
                  </th>
                ))}
                <th scope="col">Обновлено</th>
              </tr>
            </thead>
            <tbody>
              {data.responses.map((response) => (
                <tr key={response.id}>
                  <th scope="row">{response.guestName}</th>
                  {data.questions.map((question, questionIndex) => {
                    const answer = response.answers.find(
                      (item) => item.questionIndex === questionIndex,
                    );

                    return (
                      <td key={`${response.id}-${question}`}>{answer?.values.join(", ") || "—"}</td>
                    );
                  })}
                  <td className={styles.updated}>{formatDateTime(response.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className={styles.footer}>
          Ответов: {data.responses.length} · Вопросов: {data.questions.length}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
