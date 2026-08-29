import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLoginUrl, getEditorReturnTo } from "./editor-auth-redirect";

describe("getEditorReturnTo", () => {
  it("includes the site id when editing an existing site", () => {
    assert.equal(
      getEditorReturnTo("site-1", "alpine-rings"),
      "/editor?site=site-1&template=alpine-rings",
    );
  });

  it("omits the site param when there is no site yet", () => {
    assert.equal(getEditorReturnTo(undefined, "alpine-rings"), "/editor?template=alpine-rings");
  });

  it("URL-encodes ids that contain special characters", () => {
    assert.equal(
      getEditorReturnTo("site with space", "tpl&x"),
      "/editor?site=site%20with%20space&template=tpl%26x",
    );
  });
});

describe("buildLoginUrl", () => {
  it("encodes the returnTo value as a query param", () => {
    assert.equal(
      buildLoginUrl("/editor?template=alpine-rings"),
      "/auth?mode=login&returnTo=%2Feditor%3Ftemplate%3Dalpine-rings",
    );
  });
});
