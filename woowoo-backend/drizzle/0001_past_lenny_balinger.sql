CREATE TABLE IF NOT EXISTS "scenario_response" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" text NOT NULL,
	"birth_info_id" uuid,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenario_response" ADD CONSTRAINT "scenario_response_birth_info_id_birth_info_id_fk" FOREIGN KEY ("birth_info_id") REFERENCES "public"."birth_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
