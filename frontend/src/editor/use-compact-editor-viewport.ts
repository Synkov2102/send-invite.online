"use client";

import { useEffect, useState } from "react";

const COMPACT_EDITOR_QUERY = "(max-width: 899px)";

export function useCompactEditorViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_EDITOR_QUERY);
    const updateViewport = () => setIsCompact(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  return isCompact;
}
