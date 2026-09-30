import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { trackGoalOnceWhenReady } from "./analytics";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let pending: Map<number, () => void>;
let sent: Map<string, string>;
let nextId: number;

beforeEach(() => {
  pending = new Map();
  sent = new Map();
  nextId = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      sessionStorage: {
        getItem: (key: string) => sent.get(key) ?? null,
        setItem: (key: string, value: string) => sent.set(key, value),
      },
      setTimeout: (callback: () => void) => {
        pending.set(++nextId, callback);
        return nextId;
      },
      clearTimeout: (id: number) => pending.delete(id),
    },
  });
});

afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

function tick() {
  const callbacks = [...pending.values()];
  pending.clear();
  callbacks.forEach((callback) => callback());
}

test("payment waits for Metrika and is sent once with its actual amount", () => {
  const params = { currency: "RUB", order_price: 1990 };
  trackGoalOnceWhenReady("payment:1", "payment_success", params);
  assert.equal(sent.size, 0);
  tick();
  assert.equal(sent.size, 0);
  const calls: unknown[][] = [];
  window.ym = (...args: unknown[]) => calls.push(args);
  tick();
  assert.deepEqual(calls, [[111031054, "reachGoal", "payment_success", params]]);
  assert.equal(sent.get("payment:1"), "1");
  trackGoalOnceWhenReady("payment:1", "payment_success", params);
  assert.equal(calls.length, 1);
});

test("cleanup cancels retry without marking payment sent", () => {
  const cleanup = trackGoalOnceWhenReady("payment:2", "payment_success", {});
  cleanup();
  assert.equal(pending.size, 0);
  assert.equal(sent.size, 0);
});

test("unavailable Metrika stops retrying and leaves payment eligible for a later visit", () => {
  trackGoalOnceWhenReady("payment:3", "payment_success", {});
  for (let i = 0; i < 60; i += 1) tick();
  assert.equal(pending.size, 0);
  assert.equal(sent.size, 0);
});
