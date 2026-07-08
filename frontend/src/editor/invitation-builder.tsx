"use client";

import { EditorProvider } from "./editor-context";
import { EditorPreviewPanel } from "./components/editor-preview-panel";
import { EditorSidebar } from "./components/editor-sidebar";
import { FullscreenPreview } from "./components/fullscreen-preview";
import type { InvitationBuilderProps } from "./types";
import { useCompactEditorViewport } from "./use-compact-editor-viewport";
import { useInvitationBuilder } from "./use-invitation-builder";

export type { InviteState, InviteVars } from "./types";

function EditorLayout() {
  const isCompactEditor = useCompactEditorViewport();

  return (
    <div className="editor-layout">
      <EditorSidebar />
      {!isCompactEditor ? <EditorPreviewPanel /> : null}
    </div>
  );
}

export default function InvitationBuilder(props: InvitationBuilderProps) {
  const controller = useInvitationBuilder(props);

  return (
    <EditorProvider value={controller}>
      <main className="editor-shell">
        <FullscreenPreview />
        {!controller.isFullscreenPreview ? <EditorLayout /> : null}
      </main>
    </EditorProvider>
  );
}
