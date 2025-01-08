CREATE TABLE IF NOT EXISTS "birth_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"time_of_birth" text NOT NULL,
	"place_of_birth" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "birth_chart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"birth_info_id" uuid,
	"chart_data" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "birth_chart" ADD CONSTRAINT "birth_chart_birth_info_id_birth_info_id_fk" FOREIGN KEY ("birth_info_id") REFERENCES "public"."birth_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
