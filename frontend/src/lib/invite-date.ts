export function parseDate(value: string) {
  return value ? new Date(`${value}T12:00:00`) : new Date();
}

export function formatDate(value: string) {
  if (!value) {
    return "дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDate(value));
}

export function formatMonth(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" })
    .format(parseDate(value))
    .toUpperCase();
}

export function getCalendarDays(value: string) {
  const eventDate = parseDate(value);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(eventDate);
    day.setDate(eventDate.getDate() - 3 + index);

    return {
      day: day.getDate(),
      label: new Intl.DateTimeFormat("ru-RU", { weekday: "short" })
        .format(day)
        .replace(".", "")
        .toUpperCase(),
      selected: day.toDateString() === eventDate.toDateString(),
    };
  });
}
