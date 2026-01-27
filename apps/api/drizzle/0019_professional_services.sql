-- P0.3: Matriz Profissional × Serviço (especialidades)
CREATE TABLE IF NOT EXISTS "professional_services" (
  "professional_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "service_id" integer NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("professional_id", "service_id")
);

CREATE INDEX IF NOT EXISTS "idx_prof_svc_service" ON "professional_services" ("service_id");
CREATE INDEX IF NOT EXISTS "idx_prof_svc_professional" ON "professional_services" ("professional_id");
