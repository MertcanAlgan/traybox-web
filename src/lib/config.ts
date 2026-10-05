export const config = {
  defaultMaxActivations: Number(process.env.DEFAULT_MAX_ACTIVATIONS ?? 3) || 3,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL || "",
  supportEmail: process.env.SUPPORT_EMAIL ?? "",
};
