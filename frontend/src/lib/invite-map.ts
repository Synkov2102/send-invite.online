export function getYandexMapsUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const isYandexHost = ["yandex.ru", "yandex.com", "yandex.by", "yandex.kz", "yandex.uz", "yandex.com.tr"].some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );

    if (url.protocol !== "https:" || !isYandexHost || !/^\/maps(?:\/|$)/.test(url.pathname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
