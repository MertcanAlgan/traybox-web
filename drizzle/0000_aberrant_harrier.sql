CREATE TABLE "activations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"machine_id" text NOT NULL,
	"machine_name" text,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deactivated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"email" text NOT NULL,
	"order_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"max_activations" integer DEFAULT 3 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activations" ADD CONSTRAINT "activations_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activations_license_machine_idx" ON "activations" USING btree ("license_id","machine_id");--> statement-breakpoint
CREATE INDEX "activations_license_idx" ON "activations" USING btree ("license_id");--> statement-breakpoint
CREATE UNIQUE INDEX "licenses_key_idx" ON "licenses" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "licenses_order_id_idx" ON "licenses" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "licenses_email_idx" ON "licenses" USING btree ("email");