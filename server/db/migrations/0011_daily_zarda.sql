CREATE TYPE "public"."bank_account_status" AS ENUM('pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "mentor_bank_account" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"stripe_connect_account_id" text,
	"stripe_connect_onboarded" boolean DEFAULT false NOT NULL,
	"bank_name" text,
	"account_holder_name" text,
	"account_number_last4" text,
	"routing_number" text,
	"account_type" text,
	"currency" text DEFAULT 'usd' NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"status" "bank_account_status" DEFAULT 'pending' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mentor_bank_account_mentor_id_unique" UNIQUE("mentor_id")
);
--> statement-breakpoint
CREATE TABLE "mentor_earning" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2) NOT NULL,
	"net_amount" numeric(10, 2) NOT NULL,
	"payout_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"available_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_payout" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"stripe_transfer_id" text,
	"stripe_payout_id" text,
	"bank_account_id" text,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"processed_at" timestamp,
	"failure_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentor_bank_account" ADD CONSTRAINT "mentor_bank_account_mentor_id_user_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_earning" ADD CONSTRAINT "mentor_earning_mentor_id_user_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_earning" ADD CONSTRAINT "mentor_earning_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_earning" ADD CONSTRAINT "mentor_earning_payout_id_mentor_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."mentor_payout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_payout" ADD CONSTRAINT "mentor_payout_mentor_id_user_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_payout" ADD CONSTRAINT "mentor_payout_bank_account_id_mentor_bank_account_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."mentor_bank_account"("id") ON DELETE set null ON UPDATE no action;