export function getYandexMapsUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const isYandexHost =
      url.hostname === "yandex.ru" ||
      url.hostname.startsWith("yandex.") ||
      url.hostname.endsWith(".yandex.ru");

    if (url.protocol !== "https:" || !isYandexHost || !url.pathname.startsWith("/maps")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
