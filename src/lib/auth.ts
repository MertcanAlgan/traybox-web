import { scryptSync, timingSafeEqual } from "node:crypto";

/** Password hashes look like `scrypt$<saltHex>$<hashHex>` (see `npm run hash-password`). */
export function verifyPassword(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [scheme, saltHex, hashHex] = stored.split("$");

  // Always run the hash so response time doesn't reveal which part was wrong.
  const salt = Buffer.from(saltHex ?? "", "hex");
  const expected = Buffer.from(hashHex ?? "", "hex");
  const actual = scryptSync(password, salt, expected.length || 64);

  const a = Buffer.from(email.toLowerCase());
  const b = Buffer.from(expectedEmail.toLowerCase());
  const emailOk = a.length === b.length && timingSafeEqual(a, b);
  const passwordOk =
    scheme === "scrypt" && expected.length === actual.length && timingSafeEqual(expected, actual);
  return emailOk && passwordOk;
}
