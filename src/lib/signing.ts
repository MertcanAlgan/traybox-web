import { createPrivateKey, sign } from "node:crypto";

/**
 * Signed activation token. The app verifies it with the embedded public key, so a
 * license that was activated once keeps working offline and can't be forged.
 *
 * Signed message: `${key}|${machineId}|${issuedAt}` (UTF-8). Token: `${issuedAt}.${base64(signature)}`.
 */
export function signActivation(key: string, machineId: string): { token: string; issuedAt: number } {
  const pem = process.env.LICENSE_PRIVATE_KEY;
  if (!pem) throw new Error("LICENSE_PRIVATE_KEY is not set");

  const privateKey = createPrivateKey(pem.replace(/\\n/g, "\n"));
  const issuedAt = Math.floor(Date.now() / 1000);
  const signature = sign(null, Buffer.from(`${key}|${machineId}|${issuedAt}`, "utf8"), privateKey);
  return { token: `${issuedAt}.${signature.toString("base64")}`, issuedAt };
}
