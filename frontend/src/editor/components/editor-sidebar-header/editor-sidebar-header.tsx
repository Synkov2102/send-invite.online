"use client";

import { AlertCircle, ArrowLeft, Check, Eye, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import BrandLockup from "@/components/brand-lockup";
import { editorSteps } from "../../constants";
import { useEditor } from "../../editor-context";
import styles from "./editor-sidebar-header.module.css";

export function EditorStepNav() {
  const { activeStep, openStep, stepErrors, visitedSteps, visibleValidationStep } = useEditor();

  return (
    <nav aria-label="Этапы создания приглашения" className={styles.steps}>
      {editorSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = activeStep === index;
        const isComplete =
          visitedSteps.has(index) && stepErrors[index].length === 0 && index < 5;
        const hasError =
          visibleValidationStep === index && stepErrors[index].length > 0;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            className={[
              styles.step,
              isActive ? styles.active : "",
              isComplete ? styles.complete : "",
              hasError ? styles.hasError : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={step.title}
            onClick={() => openStep(index)}
            type="button"
          >
            <span className={styles.stepIcon}>
              {isComplete ? (
                <Check aria-hidden size={15} />
              ) : (
                <StepIcon aria-hidden size={15} />
              )}
            </span>
            <span className={styles.stepCopy}>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </span>
            <span className={styles.stepNumber}>{index + 1}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function EditorSidebarHeader() {
  const { confirmLeaveEditor, saveStatus, setIsFullscreenPreview, siteId, template } = useEditor();

  function handleEditorExit(event: MouseEvent<HTMLAnchorElement>) {
    if (!confirmLeaveEditor()) {
      event.preventDefault();
    }
  }

  return (
    <>
      <div className={styles.topbar}>
        <Link className={styles.back} href="/templates" onClick={handleEditorExit}>
          <ArrowLeft aria-hidden size={15} />
          Шаблоны
        </Link>
        <Link
          aria-label="На главную"
          className={`${styles.brand} editor-brand`}
          href="/"
          onClick={handleEditorExit}
        >
          <BrandLockup />
        </Link>
        <span
          aria-live="polite"
          className={`${styles.saveStatus} ${saveStatus === "error" ? styles.saveError : ""}`}
        >
          {siteId ? (
            <>
              <Save aria-hidden size={13} /> Сохранение вручную
            </>
          ) : saveStatus === "saving" ? (
            <>
              <Save aria-hidden size={13} /> Сохраняем…
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle aria-hidden size={13} /> Не сохранено
            </>
          ) : (
            <>
              <Check aria-hidden size={13} /> Сохранено
            </>
          )}
        </span>
        <button
          className={styles.previewJump}
          onClick={() => setIsFullscreenPreview(true)}
          type="button"
        >
          <Eye aria-hidden size={14} />
          Предпросмотр
        </button>
      </div>

      <div className={styles.intro}>
        <div className={styles.kicker}>
          <Sparkles aria-hidden size={13} />
          Редактор приглашения
        </div>
        <h1>{template.name}</h1>
        <p>{template.description}</p>
      </div>
    </>
  );
}
