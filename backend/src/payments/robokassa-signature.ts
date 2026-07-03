import { createHash, timingSafeEqual } from "crypto";

const supportedAlgorithms = new Set([
  "md5",
  "ripemd160",
  "sha1",
  "sha256",
  "sha384",
  "sha512",
]);

export function getRobokassaHashAlgorithm() {
  const algorithm = (process.env.ROBOKASSA_HASH_ALGORITHM ?? "md5").toLowerCase();

  if (!supportedAlgorithms.has(algorithm)) {
    throw new Error(`Unsupported Robokassa hash algorithm: ${algorithm}`);
  }

  return algorithm;
}

export function createRobokassaSignature(parts: string[]) {
  return createHash(getRobokassaHashAlgorithm())
    .update(parts.join(":"), "utf8")
    .digest("hex");
}

export function isRobokassaSignatureValid(expected: string, received: string) {
  const left = Buffer.from(expected.toLowerCase(), "utf8");
  const right = Buffer.from(received.toLowerCase(), "utf8");

  return left.length === right.length && timingSafeEqual(left, right);
}
