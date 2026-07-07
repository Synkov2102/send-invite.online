"use client";

import { Button } from "@heroui/react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Eye } from "lucide-react";
import { editorSteps } from "../constants";
import { useEditor } from "../editor-context";

type StepPanelProps = {
  isActive: boolean;
};

export function PublishStep({ isActive }: StepPanelProps) {
  const { allErrors, openStep, setIsFullscreenPreview, stepErrors } = useEditor();

  return (
    <section className={isActive ? "editor-step-panel is-active" : "editor-step-panel"}>
      <div className="editor-review">
        <div className="editor-review__heading">
          <span className={allErrors.length === 0 ? "is-ready" : "has-errors"}>
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

        <p className="editor-review__hint">
          Перед запуском откройте предпросмотр на телефоне и проверьте первый экран,
          адрес, форму гостя и читаемость текста на фотографиях.
        </p>

        <div className="editor-review__sections">
          {editorSteps.slice(0, 5).map((step, index) => (
            <button
              className={stepErrors[index].length === 0 ? "is-complete" : "has-error"}
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
          className="editor-review__preview"
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
