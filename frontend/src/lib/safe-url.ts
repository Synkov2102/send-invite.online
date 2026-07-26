/** Guards `href` rendering against `javascript:` / `data:` links stored in invites. */
export function getSafeHttpUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const { protocol } = new URL(trimmed);

    return protocol === "http:" || protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

export function isHttpUrl(value: string) {
  return getSafeHttpUrl(value) !== null;
}
