"use client";

import { AlertCircle, ArrowLeft, Check, Eye, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import BrandLockup from "@/components/brand-lockup";
import { editorSteps } from "../constants";
import { useEditor } from "../editor-context";

export function EditorStepNav() {
  const { activeStep, openStep, stepErrors, visitedSteps, visibleValidationStep } = useEditor();

  return (
    <nav aria-label="Этапы создания приглашения" className="editor-steps">
      {editorSteps.map((step, index) => {
        const StepIcon = step.icon;

        return (
          <button
            aria-current={activeStep === index ? "step" : undefined}
            className={`editor-step ${activeStep === index ? "is-active" : ""} ${
              visitedSteps.has(index) && stepErrors[index].length === 0 && index < 5
                ? "is-complete"
                : ""
            } ${
              visibleValidationStep === index && stepErrors[index].length > 0 ? "has-error" : ""
            }`}
            key={step.title}
            onClick={() => openStep(index)}
            type="button"
          >
            <span className="editor-step__icon">
              {visitedSteps.has(index) && stepErrors[index].length === 0 && index < 5 ? (
                <Check aria-hidden size={15} />
              ) : (
                <StepIcon aria-hidden size={15} />
              )}
            </span>
            <span>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </span>
            <span className="editor-step__number">{index + 1}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function EditorSidebarHeader() {
  const { saveStatus, setMobileView, siteId, template } = useEditor();

  return (
    <>
      <div className="editor-sidebar__topbar">
        <Link className="editor-back" href="/templates">
          <ArrowLeft aria-hidden size={15} />
          Шаблоны
        </Link>
        <Link aria-label="На главную" className="editor-brand" href="/">
          <BrandLockup />
        </Link>
        <span aria-live="polite" className={`editor-save-status is-${saveStatus}`}>
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
          className="editor-preview-jump"
          onClick={() => setMobileView("preview")}
          type="button"
        >
          <Eye aria-hidden size={14} />
          Предпросмотр
        </button>
      </div>

      <div className="editor-sidebar__intro">
        <div className="editor-sidebar__kicker">
          <Sparkles aria-hidden size={13} />
          Редактор приглашения
        </div>
        <h1>{template.name}</h1>
        <p>{template.description}</p>
      </div>
    </>
  );
}
