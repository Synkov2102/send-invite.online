import {
  createRobokassaSignature,
  getRobokassaHashAlgorithm,
  isRobokassaSignatureValid,
} from "./robokassa-signature";

describe("robokassa-signature", () => {
  let previousAlgorithm: string | undefined;

  beforeEach(() => {
    previousAlgorithm = process.env.ROBOKASSA_HASH_ALGORITHM;
    process.env.ROBOKASSA_HASH_ALGORITHM = "md5";
  });

  afterEach(() => {
    if (previousAlgorithm === undefined) {
      delete process.env.ROBOKASSA_HASH_ALGORITHM;
    } else {
      process.env.ROBOKASSA_HASH_ALGORITHM = previousAlgorithm;
    }
  });

  it("defaults to md5", () => {
    delete process.env.ROBOKASSA_HASH_ALGORITHM;
    expect(getRobokassaHashAlgorithm()).toBe("md5");
  });

  it("rejects unsupported hash algorithms", () => {
    process.env.ROBOKASSA_HASH_ALGORITHM = "sha3";
    expect(() => getRobokassaHashAlgorithm()).toThrow(/Unsupported/);
  });

  it("creates a deterministic signature", () => {
    const first = createRobokassaSignature(["a", "b", "c"]);
    const second = createRobokassaSignature(["a", "b", "c"]);
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{32}$/);
  });

  it("validates signatures case-insensitively with timing-safe compare", () => {
    const expected = createRobokassaSignature(["OutSum", "1", "secret"]);
    expect(isRobokassaSignatureValid(expected, expected.toUpperCase())).toBe(true);
    expect(isRobokassaSignatureValid(expected, "0".repeat(expected.length))).toBe(false);
    expect(isRobokassaSignatureValid(expected, "deadbeef")).toBe(false);
  });
});
