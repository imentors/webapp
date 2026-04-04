DO $$ BEGIN
 ALTER TABLE "mentor_profile" ADD COLUMN "date_of_birth" timestamp;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentor_profile" ADD COLUMN "expertise_document" text;
EXCEPTION
 WHEN duplicate_column THEN null;
END $$;
