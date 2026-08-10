import {
  ROBOKASSA_RESULT_CODE,
  ROBOKASSA_STATE_CODE,
  RobokassaOpStateClient,
  parseOperationState,
} from "./robokassa-op-state";
import { createRobokassaSignature } from "./robokassa-signature";

const NAMESPACE =
  'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://merchant.roboxchange.com/WebService/"';

function makeResponseXml(body: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<OperationStateResponse ${NAMESPACE}>${body}</OperationStateResponse>`;
}

const completedXml = makeResponseXml(`
  <Result><Code>0</Code></Result>
  <State>
    <Code>100</Code>
    <RequestDate>2026-08-10T10:31:30.000+03:00</RequestDate>
    <StateDate>2026-08-10T10:33:02.000+03:00</StateDate>
  </State>
  <Info>
    <IncCurrLabel>SBP</IncCurrLabel>
    <IncSum>1990.00</IncSum>
    <IncAccount>1234</IncAccount>
    <PaymentMethod>
      <Code>SBP</Code>
      <Description>Система быстрых платежей</Description>
    </PaymentMethod>
    <OutCurrLabel>RUB</OutCurrLabel>
    <OutSum>1990.00</OutSum>
    <OpKey>op-1</OpKey>
  </Info>
`);

describe("parseOperationState", () => {
  it("reads the state, amount and payment method of a completed operation", () => {
    expect(parseOperationState(completedXml)).toEqual({
      outSum: "1990.00",
      paymentMethod: "SBP",
      resultCode: ROBOKASSA_RESULT_CODE.ok,
      stateCode: ROBOKASSA_STATE_CODE.completed,
    });
  });

  it("does not mistake the nested PaymentMethod code for the operation state", () => {
    const state = parseOperationState(completedXml);

    expect(state?.stateCode).toBe(100);
    expect(state?.paymentMethod).toBe("SBP");
  });

  it("reads an error response that carries no State or Info", () => {
    const xml = makeResponseXml("<Result><Code>3</Code></Result>");

    expect(parseOperationState(xml)).toEqual({
      outSum: null,
      paymentMethod: null,
      resultCode: ROBOKASSA_RESULT_CODE.operationNotFound,
      stateCode: null,
    });
  });

  it("returns null for a response without a result code", () => {
    expect(parseOperationState(makeResponseXml("<Result></Result>"))).toBeNull();
    expect(parseOperationState("<html>502 Bad Gateway</html>")).toBeNull();
  });
});

describe("RobokassaOpStateClient", () => {
  const previousHashAlgorithm = process.env.ROBOKASSA_HASH_ALGORITHM;
  const previousFetch = global.fetch;
  let client: RobokassaOpStateClient;

  beforeEach(() => {
    process.env.ROBOKASSA_HASH_ALGORITHM = "md5";
    client = new RobokassaOpStateClient();
  });

  afterEach(() => {
    global.fetch = previousFetch;

    if (previousHashAlgorithm === undefined) {
      delete process.env.ROBOKASSA_HASH_ALGORITHM;
    } else {
      process.env.ROBOKASSA_HASH_ALGORITHM = previousHashAlgorithm;
    }
  });

  it("signs the request with MerchantLogin:InvoiceID:Password2", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => completedXml,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const state = await client.fetchOperationState({
      invId: 17,
      merchantLogin: "shop",
      password2: "secret2",
    });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe(
      "https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt",
    );
    expect(url.searchParams.get("MerchantLogin")).toBe("shop");
    expect(url.searchParams.get("InvoiceID")).toBe("17");
    expect(url.searchParams.get("Signature")).toBe(
      createRobokassaSignature(["shop", "17", "secret2"]),
    );
    expect(state?.stateCode).toBe(ROBOKASSA_STATE_CODE.completed);
  });

  it("returns null on a transport failure instead of throwing", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("timeout")) as unknown as typeof fetch;

    await expect(
      client.fetchOperationState({ invId: 17, merchantLogin: "shop", password2: "s" }),
    ).resolves.toBeNull();
  });

  it("returns null on a non-2xx response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "",
    }) as unknown as typeof fetch;

    await expect(
      client.fetchOperationState({ invId: 17, merchantLogin: "shop", password2: "s" }),
    ).resolves.toBeNull();
  });
});
