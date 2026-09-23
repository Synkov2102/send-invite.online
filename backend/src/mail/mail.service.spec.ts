import { Test } from "@nestjs/testing";
import { createTransport } from "nodemailer";
import { MailService } from "./mail.service";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const previousEnv = {
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
};

describe("MailService", () => {
  let service: MailService;
  let sendMail: jest.Mock;

  beforeEach(async () => {
    process.env.FRONTEND_ORIGIN = "https://send-invite.online";
    sendMail = jest.fn().mockResolvedValue(undefined);
    (createTransport as jest.Mock).mockReturnValue({ sendMail });

    const moduleRef = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = moduleRef.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("does nothing when SMTP is not configured", async () => {
    delete process.env.SMTP_HOST;

    await service.sendOrderPaidEmail({
      amount: "1990.00",
      email: "buyer@example.com",
      orderId: "order-1",
      siteId: "site-1",
    });

    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("sends the order confirmation email when SMTP is configured", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASSWORD = "secret";
    process.env.SMTP_FROM = "noreply@send-invite.online";

    await service.sendOrderPaidEmail({
      amount: "1990.00",
      email: "buyer@example.com",
      orderId: "order-1",
      siteId: "site-1",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "noreply@send-invite.online",
        to: "buyer@example.com",
      }),
    );
    const body = sendMail.mock.calls[0][0].text as string;
    expect(body).toContain("order-1");
    expect(body).toContain("https://send-invite.online/invite/sites/site-1");
  });

  it("swallows transport errors instead of throwing", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASSWORD = "secret";
    process.env.SMTP_FROM = "noreply@send-invite.online";
    sendMail.mockRejectedValue(new Error("connection refused"));

    await expect(
      service.sendOrderPaidEmail({
        amount: "1990.00",
        email: "buyer@example.com",
        orderId: "order-1",
        siteId: "site-1",
      }),
    ).resolves.toBeUndefined();
  });
});
