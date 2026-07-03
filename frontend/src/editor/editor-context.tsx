"use client";

import { createContext, useContext } from "react";
import type { InvitationBuilderController } from "./use-invitation-builder";

const EditorContext = createContext<InvitationBuilderController | null>(null);

export function EditorProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: InvitationBuilderController;
}) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }

  return context;
}
