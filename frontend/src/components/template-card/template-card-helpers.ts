export function formatCardIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function getEditorHref(templateId: string, siteId?: string, paletteId?: string) {
  const editorParams = new URLSearchParams({
    template: templateId,
    preview: "1",
  });

  if (siteId) {
    editorParams.set("site", siteId);
  }

  if (paletteId) {
    editorParams.set("palette", paletteId);
  }

  return `/editor?${editorParams.toString()}`;
}
