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

/** Templates render the same date in several shapes, so the options stay per call site. */
export function formatInviteDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ru-RU", options).format(parseDate(value));
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

export function getMonthCalendar(value: string) {
  const firstDay = parseDate(value);
  firstDay.setDate(1);
  const offset = (firstDay.getDay() + 6) % 7;
  const lastDay = new Date(firstDay);
  lastDay.setMonth(firstDay.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();

  return Array.from({ length: Math.ceil((offset + daysInMonth) / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday - offset + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    }),
  );
}
