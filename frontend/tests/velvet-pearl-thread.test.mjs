import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const svg = readFileSync(new URL("../public/images/velvet-ticket/pearl-thread.svg", import.meta.url), "utf8");
const [left, top, width, height] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const stroke = Number(svg.match(/stroke-width="([^"]+)"/)[1]);
const circles = [...svg.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)]
  .map(([, x, y, radius]) => ({ x: Number(x), y: Number(y), radius: Number(radius) + stroke / 2 }));
const offsets = [...svg.matchAll(/<use href="#pearl-segment"(?: y="([^"]+)")?\s*\/>/g)]
  .map(([, y]) => Number(y ?? 0));
const visible = offsets.flatMap((offset) => circles.map((circle) => ({ ...circle, y: circle.y + offset })))
  .filter((circle) => circle.y + circle.radius > top && circle.y - circle.radius < top + height)
  .sort((a, b) => a.y - b.y);

test("pearl repeat contains only whole beads, including their outlines", () => {
  assert.ok(circles.length > 0);
  assert.equal(visible.length, circles.length);
  for (const circle of visible) {
    assert.ok(circle.x - circle.radius >= left && circle.x + circle.radius <= left + width);
    assert.ok(circle.y - circle.radius >= top && circle.y + circle.radius <= top + height,
      `Bead at ${circle.x}, ${circle.y} crosses the repeat boundary`);
  }
});

test("spacing across the repeat matches spacing within the strand", () => {
  const gaps = visible.slice(1).map((circle, index) =>
    Math.hypot(circle.x - visible[index].x, circle.y - visible[index].y));
  const first = visible[0];
  const last = visible.at(-1);
  const seamGap = Math.hypot(first.x - last.x, first.y + height - last.y);
  assert.ok(seamGap >= Math.min(...gaps) - 0.01 && seamGap <= Math.max(...gaps) + 0.01);
});
