import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { config } from "@/lib/config";
import { generateLicenseKey } from "@/lib/keys";
import { licenseEmail, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type LemonSqueezyEvent = {
  meta?: { event_name?: string };
  data?: {
    id?: string | number;
    attributes?: {
      status?: string;
      user_email?: string;
      first_order_item?: { product_id?: number | string };
    };
  };
};

function validSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  // The signature is over the exact raw body, so read it as text before parsing.
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as LemonSqueezyEvent;
  const name = event.meta?.event_name;
  const orderId = event.data?.id != null ? String(event.data.id) : undefined;
  const attributes = event.data?.attributes;
  if (!orderId) return NextResponse.json({ ok: true, ignored: true });

  if (name === "order_created") {
    const wantedProduct = process.env.LEMONSQUEEZY_PRODUCT_ID;
    const product = attributes?.first_order_item?.product_id;
    if (wantedProduct && String(product) !== wantedProduct) {
      return NextResponse.json({ ok: true, ignored: "other_product" });
    }
    if (attributes?.status !== "paid" || !attributes.user_email) {
      return NextResponse.json({ ok: true, ignored: "not_paid" });
    }

    const key = generateLicenseKey();
    // The unique order id makes webhook retries harmless: a second delivery inserts nothing.
    const [created] = await db
      .insert(licenses)
      .values({
        key,
        email: attributes.user_email.toLowerCase(),
        orderId,
        maxActivations: config.defaultMaxActivations,
      })
      .onConflictDoNothing({ target: licenses.orderId })
      .returning();

    if (created) {
      const mail = licenseEmail(created.key, created.maxActivations);
      await sendEmail({ to: created.email, ...mail });
    }
    return NextResponse.json({ ok: true, created: Boolean(created) });
  }

  if (name === "order_refunded") {
    await db.update(licenses).set({ status: "refunded" }).where(eq(licenses.orderId, orderId));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: name ?? "unknown" });
}
