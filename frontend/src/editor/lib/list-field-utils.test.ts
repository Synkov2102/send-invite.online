import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToList, removeFromList, updateAt } from "./list-field-utils";

describe("addToList", () => {
  it("appends the item when under the limit", () => {
    assert.deepEqual(addToList([1, 2], 3, 3), [1, 2, 3]);
  });

  it("returns the same array reference when the limit is reached", () => {
    const list = [1, 2, 3];
    assert.equal(addToList(list, 3, 4), list);
  });
});

describe("removeFromList", () => {
  it("removes the item at the given index when above the minimum", () => {
    assert.deepEqual(removeFromList(["a", "b", "c"], 1, 1), ["a", "c"]);
  });

  it("returns the same array reference when at the minimum", () => {
    const list = ["a"];
    assert.equal(removeFromList(list, 1, 0), list);
  });
});

describe("updateAt", () => {
  it("replaces only the item at the given index", () => {
    assert.deepEqual(
      updateAt([{ value: 1 }, { value: 2 }], 1, (item) => ({ value: item.value * 10 })),
      [{ value: 1 }, { value: 20 }],
    );
  });

  it("leaves the list unchanged for an out-of-range index", () => {
    const list = [1, 2, 3];
    assert.deepEqual(updateAt(list, 5, () => 0), list);
  });
});
