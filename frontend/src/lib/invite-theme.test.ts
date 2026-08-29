import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inviteTemplateCatalog } from "./invite-templates";
import { templateImagesByKind } from "./invite-theme";

describe("templateImagesByKind", () => {
  it("has a real image set for every template kind used by the catalog", () => {
    const kindsInCatalog = new Set(inviteTemplateCatalog.map((template) => template.kind));

    for (const kind of kindsInCatalog) {
      assert.ok(
        templateImagesByKind[kind],
        `templateImagesByKind is missing an entry for "${kind}" — a catalog template of this kind would silently fall back to the generic placeholder photos`,
      );
    }
  });

  it("gives every entry non-empty cover/portrait/venue paths", () => {
    for (const [kind, images] of Object.entries(templateImagesByKind)) {
      for (const field of ["cover", "portrait", "venue"] as const) {
        assert.ok(
          typeof images[field] === "string" && images[field].length > 0,
          `${kind}.${field} should be a non-empty path`,
        );
      }
    }
  });
});
