"use client";

import { useSyncExternalStore } from "react";

const COMPACT_EDITOR_QUERY = "(max-width: 899px)";

function subscribeCompactEditorViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(COMPACT_EDITOR_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getCompactEditorViewport() {
  return window.matchMedia(COMPACT_EDITOR_QUERY).matches;
}

export function useCompactEditorViewport() {
  return useSyncExternalStore(
    subscribeCompactEditorViewport,
    getCompactEditorViewport,
    () => false,
  );
}
