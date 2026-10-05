import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { activations, licenses, type License } from "@/db/schema";
import { signActivation } from "./signing";

export type ActivationResult =
  | { ok: true; used: number; max: number; token: string; issuedAt: number }
  | { ok: false; error: "invalid_key" | "revoked" | "not_activated" | "limit_reached"; used?: number; max?: number };

async function findByKey(key: string): Promise<License | undefined> {
  const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);
  return license;
}

export async function activeCount(licenseId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(activations)
    .where(and(eq(activations.licenseId, licenseId), isNull(activations.deactivatedAt)));
  return row?.n ?? 0;
}

/** Activates (or re-confirms) a license on one Mac. Safe to call repeatedly from the same Mac. */
export async function activateLicense(
  key: string,
  machineId: string,
  machineName: string | undefined,
): Promise<ActivationResult> {
  return db.transaction(async (tx) => {
    // Lock the license row so two Macs activating at once can't both take the last slot.
    const [license] = await tx.select().from(licenses).where(eq(licenses.key, key)).for("update").limit(1);
    if (!license) return { ok: false, error: "invalid_key" } as const;
    if (license.status !== "active") return { ok: false, error: "revoked" } as const;

    const [existing] = await tx
      .select()
      .from(activations)
      .where(and(eq(activations.licenseId, license.id), eq(activations.machineId, machineId)))
      .limit(1);

    const [{ n: used }] = await tx
      .select({ n: count() })
      .from(activations)
      .where(and(eq(activations.licenseId, license.id), isNull(activations.deactivatedAt)));

    const alreadyActive = existing && !existing.deactivatedAt;
    if (!alreadyActive && used >= license.maxActivations) {
      return { ok: false, error: "limit_reached", used, max: license.maxActivations } as const;
    }

    if (existing) {
      await tx
        .update(activations)
        .set({
          lastSeenAt: new Date(),
          machineName: machineName ?? existing.machineName,
          ...(alreadyActive ? {} : { deactivatedAt: null, activatedAt: new Date() }),
        })
        .where(eq(activations.id, existing.id));
    } else {
      await tx.insert(activations).values({ licenseId: license.id, machineId, machineName });
    }

    const { token, issuedAt } = signActivation(key, machineId);
    return {
      ok: true,
      used: alreadyActive ? used : used + 1,
      max: license.maxActivations,
      token,
      issuedAt,
    } as const;
  });
}

/** Called by the app on launch: still valid? Refreshes the signed token and last-seen time. */
export async function validateLicense(key: string, machineId: string): Promise<ActivationResult> {
  const license = await findByKey(key);
  if (!license) return { ok: false, error: "invalid_key" };
  if (license.status !== "active") return { ok: false, error: "revoked" };

  const [activation] = await db
    .select()
    .from(activations)
    .where(
      and(
        eq(activations.licenseId, license.id),
        eq(activations.machineId, machineId),
        isNull(activations.deactivatedAt),
      ),
    )
    .limit(1);
  if (!activation) return { ok: false, error: "not_activated" };

  await db.update(activations).set({ lastSeenAt: new Date() }).where(eq(activations.id, activation.id));
  const used = await activeCount(license.id);
  const { token, issuedAt } = signActivation(key, machineId);
  return { ok: true, used, max: license.maxActivations, token, issuedAt };
}

export async function deactivateLicense(key: string, machineId: string): Promise<boolean> {
  const license = await findByKey(key);
  if (!license) return false;
  await db
    .update(activations)
    .set({ deactivatedAt: new Date() })
    .where(
      and(
        eq(activations.licenseId, license.id),
        eq(activations.machineId, machineId),
        isNull(activations.deactivatedAt),
      ),
    );
  return true;
}
