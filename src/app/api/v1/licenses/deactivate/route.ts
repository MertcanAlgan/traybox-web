import { NextResponse } from "next/server";
import { deactivateLicense } from "@/lib/licenses";
import { parseLicenseRequest } from "@/lib/api";

export async function POST(request: Request) {
  const { body, error } = await parseLicenseRequest(request);
  if (error) return error;

  const found = await deactivateLicense(body.key, body.machineId);
  return NextResponse.json({ ok: found }, { status: found ? 200 : 404 });
}
