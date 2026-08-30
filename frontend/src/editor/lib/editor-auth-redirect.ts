export function getEditorReturnTo(siteId: string | undefined, templateId: string) {
  return siteId
    ? `/editor?site=${encodeURIComponent(siteId)}&template=${encodeURIComponent(templateId)}`
    : `/editor?template=${encodeURIComponent(templateId)}`;
}

export function buildLoginUrl(returnTo: string) {
  return `/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`;
}
