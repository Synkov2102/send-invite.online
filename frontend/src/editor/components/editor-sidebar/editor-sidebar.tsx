"use client";

import type { SyntheticEvent } from "react";
import { editorSteps } from "../../constants";
import { scrollPreviewToSection } from "../../lib/preview-scroll";
import { useEditor } from "../../editor-context";
import {
  ContentStep,
  DesignStep,
  GuestsStep,
  MediaStep,
  PublishStep,
  ScheduleStep,
} from "../../steps";
import { EditorSidebarHeader, EditorStepNav } from "../editor-sidebar-header";
import { EditorStepActions } from "../editor-step-actions";
import { PaymentSummary } from "../payment-summary";
import styles from "./editor-sidebar.module.css";

let lastPreviewSection = { at: 0, keys: "" };

/*
 * Фокус или клик по полю с data-preview-section прокручивает превью к этому блоку.
 * Клик нужен для Safari: там чекбоксы и кнопки не получают фокус по нажатию.
 * Фокус и клик по одному полю приходят подряд — второе событие пропускаем.
 */
function handlePreviewSectionInteraction(event: SyntheticEvent) {
  const holder = (event.target as Element).closest?.("[data-preview-section]");
  const keys = holder?.getAttribute("data-preview-section");

  if (!keys) {
    return;
  }

  const now = Date.now();

  if (keys === lastPreviewSection.keys && now - lastPreviewSection.at < 600) {
    return;
  }

  lastPreviewSection = { at: now, keys };
  scrollPreviewToSection(keys.split(" "));
}

export function EditorSidebar() {
  const { activeStep } = useEditor();

  return (
    <aside className={styles.root} id="editor-form">
      <div className={styles.head}>
        <EditorSidebarHeader />
        <EditorStepNav />
      </div>

      <div
        className={styles.form}
        onClick={handlePreviewSectionInteraction}
        onFocus={handlePreviewSectionInteraction}
      >
        <ContentStep isActive={activeStep === 0} />
        <ScheduleStep isActive={activeStep === 1} />
        <GuestsStep isActive={activeStep === 2} />
        <MediaStep isActive={activeStep === 3} />
        <DesignStep isActive={activeStep === 4} />
        <PublishStep isActive={activeStep === 5} />

        {activeStep === editorSteps.length - 1 ? <PaymentSummary /> : null}
        <EditorStepActions />
      </div>
    </aside>
  );
}
