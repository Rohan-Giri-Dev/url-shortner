import { randomBytes } from "node:crypto";

const SHORT_CODE_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateShortCode(length = 6): string {
  const bytes = randomBytes(length);

  return Array.from(
    bytes,
    (byte) => SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length]
  ).join("");
}
