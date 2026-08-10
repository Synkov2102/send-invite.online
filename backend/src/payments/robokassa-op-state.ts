import { Injectable, Logger } from "@nestjs/common";
import { createRobokassaSignature } from "./robokassa-signature";

const OP_STATE_URL = "https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt";
const REQUEST_TIMEOUT_MS = 8_000;

/** Коды ответа XML-интерфейса. https://docs.robokassa.ru/ru/xml-interfaces */
export const ROBOKASSA_RESULT_CODE = {
  badSignature: 1,
  duplicateOperations: 4,
  internalError: 1000,
  ok: 0,
  operationNotFound: 3,
  shopNotFound: 2,
} as const;

/** Состояния операции. https://docs.robokassa.ru/ru/xml-interfaces */
export const ROBOKASSA_STATE_CODE = {
  cancelled: 10,
  completed: 100,
  crediting: 50,
  hold: 20,
  initialized: 5,
  refunded: 60,
  suspended: 80,
} as const;

export type RobokassaOperationState = {
  outSum: string | null;
  paymentMethod: string | null;
  resultCode: number;
  stateCode: number | null;
};

function readBlock(xml: string | null, tag: string) {
  if (!xml) {
    return null;
  }

  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(xml);

  return match ? match[1] : null;
}

function readValue(xml: string | null, tag: string) {
  const block = readBlock(xml, tag);

  return block === null ? null : block.trim();
}

function readIntegerValue(xml: string | null, tag: string) {
  const raw = readValue(xml, tag);

  if (raw === null || raw === "") {
    return null;
  }

  const value = Number(raw);

  return Number.isInteger(value) ? value : null;
}

/**
 * Ответ — плоский `OperationStateResponse`, отдельный XML-парсер ради него не нужен.
 * `Code` встречается и в `Result`, и в `State`, и в `Info/PaymentMethod`,
 * поэтому каждое значение читается внутри своего блока.
 */
export function parseOperationState(xml: string): RobokassaOperationState | null {
  const resultCode = readIntegerValue(readBlock(xml, "Result"), "Code");

  if (resultCode === null) {
    return null;
  }

  const info = readBlock(xml, "Info");

  return {
    outSum: readValue(info, "OutSum"),
    paymentMethod: readValue(readBlock(info, "PaymentMethod"), "Code"),
    resultCode,
    stateCode: readIntegerValue(readBlock(xml, "State"), "Code"),
  };
}

@Injectable()
export class RobokassaOpStateClient {
  private readonly logger = new Logger(RobokassaOpStateClient.name);

  /** Возвращает null, когда состояние узнать не удалось — вызывающий повторит позже. */
  async fetchOperationState(input: {
    invId: number;
    merchantLogin: string;
    password2: string;
  }): Promise<RobokassaOperationState | null> {
    const url = new URL(OP_STATE_URL);
    url.searchParams.set("MerchantLogin", input.merchantLogin);
    url.searchParams.set("InvoiceID", String(input.invId));
    url.searchParams.set(
      "Signature",
      createRobokassaSignature([input.merchantLogin, String(input.invId), input.password2]),
    );

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(`OpStateExt returned HTTP ${response.status} for invId ${input.invId}`);
        return null;
      }

      const state = parseOperationState(await response.text());

      if (!state) {
        this.logger.warn(`Unparseable OpStateExt response for invId ${input.invId}`);
      }

      return state;
    } catch (error) {
      this.logger.warn(
        `OpStateExt request failed for invId ${input.invId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
