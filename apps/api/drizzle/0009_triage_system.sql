-- Migration: Sistema de Triagem (Pré-Avaliação Digital)
-- Criado em: 2025-12-21

-- Enums para triagem
DO $$ BEGIN
  CREATE TYPE triage_risk_category AS ENUM ('CHEMICAL_HISTORY', 'HEALTH_CONDITION', 'HAIR_INTEGRITY', 'ALLERGY', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Formulários de triagem
CREATE TABLE IF NOT EXISTS triage_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_category VARCHAR(100),
  service_ids JSON,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  consent_title VARCHAR(255) DEFAULT 'TERMO DE RESPONSABILIDADE E VERACIDADE',
  consent_text TEXT NOT NULL,
  requires_consent BOOLEAN NOT NULL DEFAULT true,
  created_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Perguntas de triagem
CREATE TABLE IF NOT EXISTS triage_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES triage_forms(id) ON DELETE CASCADE,
  category triage_risk_category NOT NULL,
  category_label VARCHAR(150),
  question_text TEXT NOT NULL,
  help_text TEXT,
  answer_type VARCHAR(20) NOT NULL DEFAULT 'BOOLEAN',
  options JSON,
  risk_level risk_level NOT NULL DEFAULT 'MEDIUM',
  risk_trigger_value VARCHAR(50) DEFAULT 'SIM',
  risk_message TEXT,
  blocks_procedure BOOLEAN DEFAULT false,
  requires_note BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Respostas de triagem (por agendamento)
CREATE TABLE IF NOT EXISTS triage_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  form_id UUID NOT NULL REFERENCES triage_forms(id),
  client_id UUID REFERENCES clients(id),
  form_version INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  has_risks BOOLEAN DEFAULT false,
  risk_summary JSON,
  overall_risk_level risk_level,
  consent_accepted BOOLEAN DEFAULT false,
  consent_accepted_at TIMESTAMP,
  consent_ip_address VARCHAR(45),
  completed_at TIMESTAMP,
  completed_via VARCHAR(20),
  expires_at TIMESTAMP,
  access_token VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Respostas individuais
CREATE TABLE IF NOT EXISTS triage_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES triage_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES triage_questions(id),
  answer_value VARCHAR(255),
  answer_text TEXT,
  triggered_risk BOOLEAN DEFAULT false,
  risk_level risk_level,
  risk_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_triage_forms_salon ON triage_forms(salon_id, is_active);
CREATE INDEX IF NOT EXISTS idx_triage_questions_form ON triage_questions(form_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_triage_responses_appointment ON triage_responses(appointment_id);
CREATE INDEX IF NOT EXISTS idx_triage_responses_token ON triage_responses(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_triage_answers_response ON triage_answers(response_id);

-- Comentários
COMMENT ON TABLE triage_forms IS 'Formulários de pré-avaliação digital para serviços químicos';
COMMENT ON TABLE triage_questions IS 'Perguntas do formulário com níveis de risco e ações';
COMMENT ON TABLE triage_responses IS 'Respostas do cliente por agendamento com análise de risco';
COMMENT ON TABLE triage_answers IS 'Respostas individuais de cada pergunta';
COMMENT ON COLUMN triage_responses.access_token IS 'Token para acesso público via link WhatsApp';
COMMENT ON COLUMN triage_questions.blocks_procedure IS 'Se TRUE, resposta positiva impede o procedimento';
