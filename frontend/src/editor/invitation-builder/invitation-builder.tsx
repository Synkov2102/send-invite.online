"use client";

import { Toast } from "@heroui/react";
import { EditorProvider } from "../editor-context";
import { EditorPreviewPanel } from "../components/editor-preview-panel";
import { EditorSidebar } from "../components/editor-sidebar";
import { FullscreenPreview } from "../components/fullscreen-preview";
import { editorToastQueue } from "../lib/editor-toast";
import type { InvitationBuilderProps } from "../types";
import { useCompactEditorViewport } from "../use-compact-editor-viewport";
import { useInvitationBuilder } from "../use-invitation-builder";
import "@/styles/heroui.css";
import productStyles from "@/styles/product.module.css";
import styles from "./invitation-builder.module.css";

function EditorLayout() {
  const isCompactEditor = useCompactEditorViewport();

  return (
    <div className={styles.layout}>
      <EditorSidebar />
      <EditorPreviewPanel isCompact={isCompactEditor} />
    </div>
  );
}

export default function InvitationBuilder(props: InvitationBuilderProps) {
  const controller = useInvitationBuilder(props);

  return (
    <EditorProvider value={controller}>
      <main className={`${productStyles.scope} ${styles.shell}`}>
        <Toast.Provider placement="top" queue={editorToastQueue} />
        <FullscreenPreview />
        {!controller.isFullscreenPreview ? <EditorLayout /> : null}
      </main>
    </EditorProvider>
  );
}
