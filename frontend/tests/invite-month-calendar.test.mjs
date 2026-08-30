import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/invite-date.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getMonthCalendar } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

for (const [date, days, rows, firstWeekday] of [
  ["2026-09-19", 30, 5, 1],
  ["2028-02-29", 29, 5, 1],
  ["2100-02-28", 28, 4, 0],
  ["2000-02-29", 29, 5, 1],
  ["2026-08-31", 31, 6, 5],
  ["2021-02-01", 28, 4, 0],
  ["2026-12-31", 31, 5, 1],
]) {
  test(`month calendar ${date} has every date in its Monday-first column`, () => {
    const weeks = getMonthCalendar(date);
    assert.equal(weeks.length, rows);
    assert.ok(weeks.every((week) => week.length === 7));
    assert.equal(weeks[0].indexOf(1), firstWeekday);
    assert.deepEqual(weeks.flat().filter((day) => day !== null),
      Array.from({ length: days }, (_, index) => index + 1));
    const selectedDay = Number(date.slice(-2));
    const selectedRow = weeks.find((week) => week.includes(selectedDay));
    assert.equal(selectedRow.indexOf(selectedDay), (new Date(`${date}T12:00:00`).getDay() + 6) % 7);
  });
}
