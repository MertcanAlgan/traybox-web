import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    email: text("email").notNull(),
    /** Lemon Squeezy order id; null for keys created by hand in the admin panel. */
    orderId: text("order_id"),
    /** active | revoked | refunded */
    status: text("status").notNull().default("active"),
    maxActivations: integer("max_activations").notNull().default(3),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("licenses_key_idx").on(t.key),
    uniqueIndex("licenses_order_id_idx").on(t.orderId),
    index("licenses_email_idx").on(t.email),
  ],
);

export const activations = pgTable(
  "activations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    /** SHA-256 of the Mac's hardware UUID, computed by the app. */
    machineId: text("machine_id").notNull(),
    machineName: text("machine_name"),
    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    /** Set when the activation was released; released rows no longer count toward the limit. */
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("activations_license_machine_idx").on(t.licenseId, t.machineId),
    index("activations_license_idx").on(t.licenseId),
  ],
);

export type License = typeof licenses.$inferSelect;
export type Activation = typeof activations.$inferSelect;

/** Rows that still count toward a license's limit. */
export const isActiveActivation = sql`${activations.deactivatedAt} is null`;
