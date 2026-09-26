import { createOrderPaidEmail } from "./order-paid-email";

describe("createOrderPaidEmail", () => {
  it("escapes dynamic HTML and encodes the site path segment", () => {
    const email = createOrderPaidEmail({
      amount: '<img src=x onerror="alert(1)">',
      orderId: "<script>alert(1)</script>",
      siteId: 'site/"?x=1',
      email: "buyer@example.com",
    }, "https://send-invite.online");

    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("/invite/sites/site%2F%22%3Fx%3D1");
    expect(email.text).toContain("/invite/sites/site%2F%22%3Fx%3D1");
  });
});
