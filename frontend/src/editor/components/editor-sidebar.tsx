"use client";

import { editorSteps } from "../constants";
import { useEditor } from "../editor-context";
import {
  ContentStep,
  DesignStep,
  GuestsStep,
  MediaStep,
  PublishStep,
  ScheduleStep,
} from "../steps";
import { EditorSidebarHeader, EditorStepNav } from "./editor-sidebar-header";
import { EditorStepActions } from "./editor-step-actions";
import { PaymentSummary } from "./payment-summary";

export function EditorSidebar() {
  const { activeStep } = useEditor();

  return (
    <aside className="editor-sidebar">
      <EditorSidebarHeader />
      <EditorStepNav />

      <div className="editor-form">
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
