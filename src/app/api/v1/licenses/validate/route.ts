import { NextResponse } from "next/server";
import { validateLicense } from "@/lib/licenses";
import { parseLicenseRequest, statusFor } from "@/lib/api";

export async function POST(request: Request) {
  const { body, error } = await parseLicenseRequest(request);
  if (error) return error;

  const result = await validateLicense(body.key, body.machineId);
  return NextResponse.json(result, { status: result.ok ? 200 : statusFor(result.error) });
}
