import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDate, formatInviteDate, formatMonth, getCalendarDays, getMonthCalendar, parseDate } from "./invite-date";

test("invalid invitation dates do not crash formatting or produce a calendar", () => {
  for (const value of ["", "not-a-date", "2027-02-29", "2027-04-31", "2027-13-01"]) {
    if (value) assert.ok(Number.isNaN(parseDate(value).getTime()));
    assert.equal(formatDate(value), "дата уточняется");
    assert.equal(formatInviteDate(value, { year: "numeric" }), "дата уточняется");
    assert.equal(formatMonth(value), "ДАТА УТОЧНЯЕТСЯ");
    assert.deepEqual(getCalendarDays(value), []);
    assert.deepEqual(getMonthCalendar(value), []);
  }
});

test("valid dates preserve the calendar and leap days", () => {
  assert.equal(parseDate("2028-02-29").getDate(), 29);
  assert.equal(formatDate("2027-06-26"), "26 июня 2027 г.");
  assert.equal(getMonthCalendar("2027-06-26").flat().filter((day) => day !== null).length, 30);
  assert.equal(getCalendarDays("2027-06-26").filter((day) => day.selected).length, 1);
});
