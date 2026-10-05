"use server";

import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activations, licenses } from "@/db/schema";
import { verifyPassword } from "@/lib/auth";
import {
  SESSION_COOKIE,
  createSessionToken,
  isValidSession,
  sessionCookieOptions,
} from "@/lib/session";
import { config } from "@/lib/config";
import { licenseEmail, sendEmail } from "@/lib/email";
import { generateLicenseKey } from "@/lib/keys";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Every action re-checks the session; the middleware alone isn't relied on. */
async function requireAdmin() {
  if (!(await isValidSession(cookies().get(SESSION_COOKIE)?.value))) redirect("/admin/login");
}

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const ip = clientIp(new Request("http://x", { headers: headers() }));
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) return { error: "Too many attempts. Try again later." };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(email, password)) return { error: "Wrong email or password." };

  cookies().set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createLicense(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return;

  const maxActivations = Math.max(1, Number(formData.get("max")) || config.defaultMaxActivations);
  const note = String(formData.get("note") ?? "").trim() || null;
  const [created] = await db
    .insert(licenses)
    .values({ key: generateLicenseKey(), email, maxActivations, note })
    .returning();

  if (formData.get("send") === "on") {
    await sendEmail({ to: created.email, ...licenseEmail(created.key, created.maxActivations) });
  }
  redirect(`/admin/licenses/${created.id}`);
}

export async function setStatus(licenseId: string, status: "active" | "revoked") {
  await requireAdmin();
  await db.update(licenses).set({ status }).where(eq(licenses.id, licenseId));
  revalidatePath(`/admin/licenses/${licenseId}`);
  revalidatePath("/admin");
}

export async function setMaxActivations(licenseId: string, formData: FormData) {
  await requireAdmin();
  const max = Math.max(1, Math.min(50, Number(formData.get("max")) || 1));
  await db.update(licenses).set({ maxActivations: max }).where(eq(licenses.id, licenseId));
  revalidatePath(`/admin/licenses/${licenseId}`);
}

export async function releaseActivation(licenseId: string, activationId: string) {
  await requireAdmin();
  await db
    .update(activations)
    .set({ deactivatedAt: new Date() })
    .where(and(eq(activations.id, activationId), eq(activations.licenseId, licenseId)));
  revalidatePath(`/admin/licenses/${licenseId}`);
}

export async function resendEmail(licenseId: string) {
  await requireAdmin();
  const [license] = await db.select().from(licenses).where(eq(licenses.id, licenseId)).limit(1);
  if (!license) return;
  await sendEmail({ to: license.email, ...licenseEmail(license.key, license.maxActivations) });
  revalidatePath(`/admin/licenses/${licenseId}`);
}

export async function deleteLicense(licenseId: string) {
  await requireAdmin();
  await db.delete(licenses).where(eq(licenses.id, licenseId));
  redirect("/admin");
}
