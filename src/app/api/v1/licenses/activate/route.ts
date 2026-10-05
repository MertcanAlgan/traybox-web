import { NextResponse } from "next/server";
import { activateLicense } from "@/lib/licenses";
import { parseLicenseRequest, statusFor } from "@/lib/api";

export async function POST(request: Request) {
  const { body, error } = await parseLicenseRequest(request);
  if (error) return error;

  const result = await activateLicense(body.key, body.machineId, body.machineName);
  return NextResponse.json(result, { status: result.ok ? 200 : statusFor(result.error) });
}
