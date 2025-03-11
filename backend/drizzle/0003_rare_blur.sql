CREATE TABLE IF NOT EXISTS "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"notes" text,
	"birth_info_id" uuid,
	"user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"related_person_id" uuid NOT NULL,
	"type" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"created_by_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friend" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "friend" CASCADE;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "person_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "latitude" text;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "longitude" text;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "original_local_time" text;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "original_time_zone" text;--> statement-breakpoint
ALTER TABLE "birth_info" ADD COLUMN "created_by_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person" ADD CONSTRAINT "person_birth_info_id_birth_info_id_fk" FOREIGN KEY ("birth_info_id") REFERENCES "public"."birth_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relationship" ADD CONSTRAINT "relationship_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "relationship" ADD CONSTRAINT "relationship_related_person_id_person_id_fk" FOREIGN KEY ("related_person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "birth_info" ADD CONSTRAINT "birth_info_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "birth_info" DROP COLUMN IF EXISTS "user_id";--> statement-breakpoint
ALTER TABLE "birth_info" DROP COLUMN IF EXISTS "updated_at";