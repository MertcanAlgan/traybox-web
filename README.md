# Traybox web

Landing site, license API and admin panel for the Traybox Mac app. One Next.js 14 project (App Router) with Postgres (Drizzle).

## What it does

- `/` landing page, `/thanks` post-purchase page.
- Lemon Squeezy webhook (`/api/webhooks/lemonsqueezy`): on `order_created` it creates a license and emails the key; on `order_refunded` it marks the license refunded. Webhook retries are harmless (unique order id).
- App-facing API (JSON, `POST`):
  - `/api/v1/licenses/activate` `{ key, machineId, machineName }`
  - `/api/v1/licenses/validate` `{ key, machineId }`
  - `/api/v1/licenses/deactivate` `{ key, machineId }`

  Successful activate/validate responses carry a token signed with Ed25519 (`LICENSE_PRIVATE_KEY`); the app verifies it with the embedded public key, so an activated Mac keeps working offline.
  Errors: `invalid_key` (404), `revoked` (403), `not_activated` (404), `limit_reached` (409), `rate_limited` (429).
- Admin panel at `/admin`: stats, search, license detail, revoke/restore, change Mac limit, release a Mac, resend the key email, create a license by hand.

## Setup

```bash
cp .env.example .env.local      # fill it in (see comments inside)
npm install
npm run keygen                  # prints LICENSE_PRIVATE_KEY (server) and the public key (app)
npm run hash-password -- "your password"   # -> ADMIN_PASSWORD_HASH
npm run db:migrate              # needs DATABASE_URL
npm run dev
```

Put the public key printed by `keygen` into the app (`LicenseConfig.publicKey`) and set `LicenseConfig.apiBase` to this site's URL.

## Lemon Squeezy

1. Create the product ($2.99, single payment) and copy its checkout link into `NEXT_PUBLIC_CHECKOUT_URL`.
2. Settings → Webhooks: URL `https://YOUR-DOMAIN/api/webhooks/lemonsqueezy`, a signing secret (`LEMONSQUEEZY_WEBHOOK_SECRET`), events `order_created` and `order_refunded`.
3. Optionally set `LEMONSQUEEZY_PRODUCT_ID` so other products in the store don't create Traybox licenses.
4. Set the product's confirmation redirect to `/thanks`.

## Deploying (Railway)

Add a Postgres plugin, set the environment variables, run `npm run db:migrate` once (e.g. as a release command), then `npm run build` / `npm start`. Use HTTPS; the admin cookie is `secure` in production.

## Notes

- The rate limiter is in memory (per instance). Add a shared store if you run several instances.
- Releasing a Mac in the admin frees a slot immediately; that Mac is asked to activate again the next time it checks in.
