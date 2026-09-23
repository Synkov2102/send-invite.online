import { Injectable, Logger } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";

export type OrderPaidEmailInput = {
  amount: string;
  email: string;
  orderId: string;
  siteId: string;
};

type MailConfig = {
  from: string;
  host: string;
  password: string;
  port: number;
  user: string;
};

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !Number.isInteger(port) || !user || !password || !from) {
    return null;
  }

  return { from, host, password, port, user };
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null | undefined;
  private config: MailConfig | null = null;

  private getTransporter() {
    if (this.transporter !== undefined) {
      return this.transporter;
    }

    this.config = getMailConfig();

    if (!this.config) {
      this.logger.warn("SMTP is not configured — order emails are disabled.");
      this.transporter = null;
      return this.transporter;
    }

    this.transporter = createTransport({
      auth: { pass: this.config.password, user: this.config.user },
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465,
    });

    return this.transporter;
  }

  /** Заказ уже оплачен и опубликован — письмо не должно ронять этот флоу при сбое. */
  async sendOrderPaidEmail(input: OrderPaidEmailInput) {
    const transporter = this.getTransporter();

    if (!transporter || !this.config) {
      return;
    }

    const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
    const siteUrl = `${origin}/invite/sites/${input.siteId}`;

    try {
      await transporter.sendMail({
        from: this.config.from,
        subject: "Оплата приглашения прошла успешно",
        text: [
          `Спасибо за оплату! Сумма: ${input.amount} ₽.`,
          `Номер заказа: ${input.orderId}.`,
          `Ваше приглашение опубликовано: ${siteUrl}`,
        ].join("\n"),
        to: input.email,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send order email for ${input.orderId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
