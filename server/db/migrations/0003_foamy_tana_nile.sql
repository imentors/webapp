DO $$ BEGIN
 CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"mentee_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"meeting_link" text,
	"notes" text,
	"stripe_payment_intent_id" text,
	"payment_status" "payment_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
		"cancelled_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking" ADD CONSTRAINT "booking_mentor_id_user_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking" ADD CONSTRAINT "booking_mentee_id_user_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
