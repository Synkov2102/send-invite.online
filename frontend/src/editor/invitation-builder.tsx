"use client";

import { EditorProvider } from "./editor-context";
import { EditorPreviewPanel } from "./components/editor-preview-panel";
import { EditorSidebar } from "./components/editor-sidebar";
import { FullscreenPreview } from "./components/fullscreen-preview";
import type { InvitationBuilderProps } from "./types";
import { useInvitationBuilder } from "./use-invitation-builder";

export type { InviteState, InviteVars } from "./types";

export default function InvitationBuilder(props: InvitationBuilderProps) {
  const controller = useInvitationBuilder(props);

  return (
    <EditorProvider value={controller}>
      <main className="editor-shell">
        <FullscreenPreview />
        {!controller.isFullscreenPreview ? (
          <div
            className={`editor-layout ${
              controller.mobileView === "preview" ? "is-mobile-preview" : ""
            }`}
          >
            <EditorSidebar />
            <EditorPreviewPanel />
          </div>
        ) : null}
      </main>
    </EditorProvider>
  );
}
