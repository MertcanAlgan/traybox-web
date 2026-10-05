import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "./rate-limit";
import { normalizeKey } from "./keys";

export const licenseBody = z.object({
  key: z.string().min(4).max(64),
  machineId: z.string().min(8).max(128),
  machineName: z.string().max(120).optional(),
});

/** Shared request handling for the three app-facing endpoints. */
export async function parseLicenseRequest(request: Request) {
  if (!rateLimit(`license:${clientIp(request)}`)) {
    return { error: NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 }) };
  }
  const parsed = licenseBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return { error: NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 }) };
  }
  return { body: { ...parsed.data, key: normalizeKey(parsed.data.key) } };
}

export function statusFor(error: string): number {
  switch (error) {
    case "invalid_key":
      return 404;
    case "revoked":
      return 403;
    case "not_activated":
      return 404;
    case "limit_reached":
      return 409;
    default:
      return 400;
  }
}
