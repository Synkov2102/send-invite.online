import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brand } from "./brand";
import { getPalettePreset } from "./invite-palette-catalog";
import { getInviteSocialImagePath } from "./invite-social-image";
import { inviteTemplateCatalog } from "./invite-templates";

const template = inviteTemplateCatalog[0];
const site = {
  id: "test-invite",
  templateId: template.id,
  palette: getPalettePreset(template.defaultPaletteId)!,
};

describe("invitation sharing image", () => {
  it("changes the image URL when a template or custom color changes", () => {
    const original = getInviteSocialImagePath(site);
    assert.notEqual(
      getInviteSocialImagePath({ ...site, templateId: inviteTemplateCatalog[1].id }),
      original,
    );
    assert.notEqual(
      getInviteSocialImagePath({ ...site, palette: { ...site.palette, accent: "#123456" } }),
      original,
    );
    assert.equal(getInviteSocialImagePath({ ...site, palette: { ...site.palette } }), original);
  });

  it("uses the neutral cover for an unknown template", () => {
    assert.equal(
      getInviteSocialImagePath({ ...site, templateId: "removed-template" }),
      brand.ogImage,
    );
  });

  it("encodes the site ID and keeps palette data out of the URL", () => {
    const image = getInviteSocialImagePath({ ...site, id: "site/with?characters" });
    assert.match(
      image,
      /^\/invite\/sites\/site%2Fwith%3Fcharacters\/social-image\?v=[a-f0-9]{12}$/,
    );
    assert.ok(!image.includes(site.palette.accent));
  });
});
