import { randomBytes } from "node:crypto";

// Crockford base32 without I, L, O, U: no ambiguous characters when typing a key by hand.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** `TBOX-XXXX-XXXX-XXXX-XXXX`, 80 bits of randomness. */
export function generateLicenseKey(): string {
  const bytes = randomBytes(16);
  let chars = "";
  for (let i = 0; i < 16; i++) chars += ALPHABET[bytes[i] & 31];
  return `TBOX-${chars.match(/.{4}/g)!.join("-")}`;
}

/** Accepts lower case, spaces and missing dashes: "tbox 1234 ..." -> "TBOX-1234-...". */
export function normalizeKey(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("TBOX") ? compact.slice(4) : compact;
  const groups = body.match(/.{1,4}/g) ?? [];
  return ["TBOX", ...groups].join("-");
}
