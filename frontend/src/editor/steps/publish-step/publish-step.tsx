"use client";

import { Button } from "@heroui/react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Eye } from "lucide-react";
import { editorSteps } from "../../constants";
import panelStyles from "../../components/editor-step-panel/editor-step-panel.module.css";
import { useEditor } from "../../editor-context";
import styles from "./publish-step.module.css";

type StepPanelProps = {
  isActive: boolean;
};

export function PublishStep({ isActive }: StepPanelProps) {
  const { allErrors, openStep, setIsFullscreenPreview, stepErrors } = useEditor();

  return (
    <section className={`${panelStyles.panel} ${isActive ? panelStyles.active : ""}`}>
      <div className={styles.review}>
        <div className={styles.reviewHeading}>
          <span className={allErrors.length === 0 ? styles.isReady : styles.hasErrors}>
            {allErrors.length === 0 ? (
              <CheckCircle2 aria-hidden size={18} />
            ) : (
              <AlertCircle aria-hidden size={18} />
            )}
          </span>
          <div>
            <h2>{allErrors.length === 0 ? "Приглашение готово" : "Нужно проверить данные"}</h2>
            <p>
              {allErrors.length === 0
                ? "Просмотрите приглашение глазами гостя и опубликуйте его."
                : "Исправьте отмеченные разделы перед публикацией."}
            </p>
          </div>
        </div>

        <p className={styles.reviewHint}>
          Перед запуском откройте предпросмотр на телефоне и проверьте первый экран,
          адрес, форму гостя и читаемость текста на фотографиях.
        </p>

        <div className={styles.reviewSections}>
          {editorSteps.slice(0, 5).map((step, index) => (
            <button
              className={stepErrors[index].length === 0 ? "" : styles.hasError}
              key={step.title}
              onClick={() => openStep(index)}
              type="button"
            >
              <span>
                {stepErrors[index].length === 0 ? (
                  <Check aria-hidden size={15} />
                ) : (
                  <AlertCircle aria-hidden size={15} />
                )}
              </span>
              <strong>{step.title}</strong>
              <small>
                {stepErrors[index].length === 0 ? "Готово" : stepErrors[index][0]}
              </small>
              <ArrowRight aria-hidden size={15} />
            </button>
          ))}
        </div>

        <Button
          className={styles.reviewPreview}
          onClick={() => setIsFullscreenPreview(true)}
          type="button"
          variant="outline"
        >
          <Eye aria-hidden size={16} />
          Посмотреть глазами гостя
        </Button>
      </div>
    </section>
  );
}
