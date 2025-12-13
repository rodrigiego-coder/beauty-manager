CREATE TYPE "public"."ab_test_status" AS ENUM('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."ab_test_type" AS ENUM('MESSAGE', 'OFFER', 'DISCOUNT', 'TIMING');--> statement-breakpoint
CREATE TYPE "public"."ai_conversation_status" AS ENUM('AI_ACTIVE', 'HUMAN_ACTIVE', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."ai_intent" AS ENUM('GREETING', 'SCHEDULE', 'RESCHEDULE', 'CANCEL', 'PRODUCT_INFO', 'SERVICE_INFO', 'PRICE_INFO', 'HOURS_INFO', 'GENERAL', 'BLOCKED', 'HUMAN_TAKEOVER', 'AI_RESUME');--> statement-breakpoint
CREATE TYPE "public"."ai_message_role" AS ENUM('client', 'ai', 'human', 'system');--> statement-breakpoint
CREATE TYPE "public"."alexis_compliance_risk" AS ENUM('NONE', 'LOW', 'MEDIUM', 'HIGH', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."alexis_control_mode" AS ENUM('AI', 'HUMAN', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."alexis_message_direction" AS ENUM('INBOUND', 'OUTBOUND');--> statement-breakpoint
CREATE TYPE "public"."alexis_message_type" AS ENUM('TEXT', 'AUDIO', 'IMAGE', 'DOCUMENT', 'LOCATION', 'CONTACT', 'TEMPLATE');--> statement-breakpoint
CREATE TYPE "public"."alexis_session_status" AS ENUM('ACTIVE', 'HUMAN_CONTROL', 'PAUSED', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."alexis_violation_type" AS ENUM('MEDICAL_ADVICE', 'PRESCRIPTION', 'HEALTH_CLAIM', 'PERSONAL_DATA', 'UNAUTHORIZED_SHARE', 'PROFANITY', 'DISCRIMINATION', 'SPAM');--> statement-breakpoint
CREATE TYPE "public"."appointment_priority" AS ENUM('NORMAL', 'VIP', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."appointment_source" AS ENUM('MANUAL', 'ONLINE', 'WHATSAPP', 'APP');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."billing_period" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."block_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('DAY_OFF', 'VACATION', 'SICK_LEAVE', 'PERSONAL', 'LUNCH', 'TRAINING', 'MAINTENANCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."cart_link_source" AS ENUM('WHATSAPP', 'SMS', 'EMAIL', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."cart_link_status" AS ENUM('ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."cash_movement_type" AS ENUM('WITHDRAWAL', 'DEPOSIT');--> statement-breakpoint
CREATE TYPE "public"."cash_register_status" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."command_event_type" AS ENUM('OPENED', 'ITEM_ADDED', 'ITEM_UPDATED', 'ITEM_REMOVED', 'DISCOUNT_APPLIED', 'STATUS_CHANGED', 'SERVICE_CLOSED', 'CASHIER_CLOSED', 'NOTE_ADDED', 'PAYMENT_ADDED', 'PAYMENT_REMOVED');--> statement-breakpoint
CREATE TYPE "public"."command_item_type" AS ENUM('SERVICE', 'PRODUCT');--> statement-breakpoint
CREATE TYPE "public"."command_payment_method" AS ENUM('CASH', 'CARD_CREDIT', 'CARD_DEBIT', 'PIX', 'VOUCHER', 'TRANSFER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."command_status" AS ENUM('OPEN', 'IN_SERVICE', 'WAITING_PAYMENT', 'CLOSED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."confirmation_status" AS ENUM('PENDING', 'CONFIRMED', 'AUTO_CONFIRMED');--> statement-breakpoint
CREATE TYPE "public"."confirmation_via" AS ENUM('WHATSAPP', 'SMS', 'EMAIL', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."conflict_status" AS ENUM('PENDING', 'RESOLVED_KEEP_LOCAL', 'RESOLVED_KEEP_GOOGLE', 'RESOLVED_MERGE', 'IGNORED');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."delivery_type" AS ENUM('PICKUP', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."hair_length" AS ENUM('SHORT', 'MEDIUM', 'LONG', 'EXTRA_LONG');--> statement-breakpoint
CREATE TYPE "public"."hair_porosity" AS ENUM('LOW', 'NORMAL', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."hair_thickness" AS ENUM('FINE', 'MEDIUM', 'THICK');--> statement-breakpoint
CREATE TYPE "public"."hair_type" AS ENUM('STRAIGHT', 'WAVY', 'CURLY', 'COILY');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('ACTIVE', 'ERROR', 'DISCONNECTED', 'TOKEN_EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('SALON', 'HOME', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."loyalty_transaction_type" AS ENUM('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS', 'REFERRAL', 'BIRTHDAY', 'WELCOME');--> statement-breakpoint
CREATE TYPE "public"."marketing_event_type" AS ENUM('POINTS_EARNED', 'POINTS_REDEEMED', 'TIER_UPGRADED', 'REWARD_CLAIMED', 'REFERRAL_SIGNUP', 'REFERRAL_CONVERTED', 'CAMPAIGN_CLICK', 'CAMPAIGN_CONVERSION');--> statement-breakpoint
CREATE TYPE "public"."message_channel" AS ENUM('WHATSAPP', 'SMS', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."message_template_type" AS ENUM('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMATION', 'BIRTHDAY', 'WELCOME', 'REVIEW_REQUEST', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('PIX', 'CARD', 'BOLETO', 'TRANSFER', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."product_subscription_frequency" AS ENUM('MONTHLY', 'BIMONTHLY', 'QUARTERLY');--> statement-breakpoint
CREATE TYPE "public"."product_subscription_status" AS ENUM('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."recurring_pattern" AS ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."redemption_status" AS ENUM('PENDING', 'USED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."reservation_delivery_type" AS ENUM('PICKUP', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."reward_type" AS ENUM('DISCOUNT_VALUE', 'DISCOUNT_PERCENT', 'FREE_SERVICE', 'FREE_PRODUCT', 'GIFT');--> statement-breakpoint
CREATE TYPE "public"."scalp_type" AS ENUM('NORMAL', 'OILY', 'DRY', 'SENSITIVE');--> statement-breakpoint
CREATE TYPE "public"."scheduled_message_status" AS ENUM('PENDING', 'SENT', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('HAIR', 'BARBER', 'NAILS', 'SKIN', 'MAKEUP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."sms_provider" AS ENUM('TWILIO', 'ZENVIA', 'AWS_SNS');--> statement-breakpoint
CREATE TYPE "public"."stock_adjustment_type" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."subscription_event_type" AS ENUM('CREATED', 'PLAN_CHANGED', 'STATUS_CHANGED', 'INVOICE_CREATED', 'INVOICE_PAID', 'PAYMENT_RECEIVED', 'SUSPENDED', 'REACTIVATED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."subscription_payment_method" AS ENUM('PIX', 'CARD', 'CASH_ON_DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('FREE', 'BASIC', 'PRO', 'PREMIUM');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."sync_direction" AS ENUM('GOOGLE_TO_APP', 'APP_TO_GOOGLE', 'BIDIRECTIONAL');--> statement-breakpoint
CREATE TYPE "public"."sync_log_status" AS ENUM('SUCCESS', 'PARTIAL', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."upsell_offer_status" AS ENUM('SHOWN', 'ACCEPTED', 'DECLINED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."upsell_trigger_type" AS ENUM('SERVICE', 'PRODUCT', 'HAIR_PROFILE', 'APPOINTMENT');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_provider" AS ENUM('META', 'TWILIO', 'ZENVIA');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'SUPER_ADMIN' BEFORE 'OWNER';--> statement-breakpoint
CREATE TABLE "ab_test_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"client_id" uuid,
	"client_phone" varchar(20),
	"variant" varchar(1) NOT NULL,
	"converted" boolean DEFAULT false,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ab_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"variant_a" json DEFAULT '{}'::json,
	"variant_b" json DEFAULT '{}'::json,
	"variant_a_views" integer DEFAULT 0,
	"variant_a_conversions" integer DEFAULT 0,
	"variant_b_views" integer DEFAULT 0,
	"variant_b_conversions" integer DEFAULT 0,
	"winning_variant" varchar(1),
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_blocked_terms_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"conversation_id" uuid,
	"original_message" text NOT NULL,
	"blocked_terms" json NOT NULL,
	"layer" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_briefings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"data" json,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid,
	"client_phone" varchar(20) NOT NULL,
	"client_name" varchar(255),
	"status" varchar(20) DEFAULT 'AI_ACTIVE' NOT NULL,
	"human_agent_id" uuid,
	"human_takeover_at" timestamp,
	"ai_resumed_at" timestamp,
	"last_message_at" timestamp,
	"messages_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" varchar(10) DEFAULT 'MEDIUM' NOT NULL,
	"category" varchar(20) DEFAULT 'GENERAL' NOT NULL,
	"data" json,
	"action_url" varchar(255),
	"action_label" varchar(100),
	"is_read" boolean DEFAULT false,
	"is_dismissed" boolean DEFAULT false,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_interaction_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"conversation_id" uuid,
	"client_phone" varchar(20) NOT NULL,
	"message_in" text NOT NULL,
	"message_out" text NOT NULL,
	"intent" varchar(30),
	"was_blocked" boolean DEFAULT false,
	"block_reason" varchar(50),
	"tokens_used" integer,
	"response_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"intent" varchar(30),
	"was_blocked" boolean DEFAULT false,
	"block_reason" varchar(50),
	"is_command" boolean DEFAULT false,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"assistant_name" varchar(50) DEFAULT 'Alexis',
	"greeting_message" text DEFAULT 'Olá! Sou a Alexis, assistente virtual do salão. Como posso ajudar? 😊',
	"human_takeover_message" text DEFAULT 'Ops! Agora você será atendida por alguém da nossa equipe. Estou por aqui se precisar depois. 😊',
	"ai_resume_message" text DEFAULT 'Voltei! Se quiser, posso continuar te ajudando por aqui. 💇‍♀️',
	"human_takeover_command" varchar(20) DEFAULT '#eu',
	"ai_resume_command" varchar(20) DEFAULT '#ia',
	"auto_scheduling_enabled" boolean DEFAULT true,
	"working_hours_start" varchar(5) DEFAULT '08:00',
	"working_hours_end" varchar(5) DEFAULT '20:00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_settings_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "alexis_blocked_keywords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid,
	"keyword" varchar(100) NOT NULL,
	"category" varchar(30) NOT NULL,
	"violation_type" varchar(30) NOT NULL,
	"severity" varchar(10) DEFAULT 'HIGH' NOT NULL,
	"action" varchar(20) DEFAULT 'BLOCK' NOT NULL,
	"replacement" text,
	"warning_message" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_compliance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"session_id" uuid,
	"message_id" uuid,
	"violation_type" varchar(30) NOT NULL,
	"risk_level" varchar(10) NOT NULL,
	"original_content" text NOT NULL,
	"sanitized_content" text,
	"detection_layer" varchar(20) NOT NULL,
	"action" varchar(20) NOT NULL,
	"details" json,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_sessions" integer DEFAULT 0,
	"total_messages" integer DEFAULT 0,
	"ai_responses" integer DEFAULT 0,
	"human_responses" integer DEFAULT 0,
	"human_takeovers" integer DEFAULT 0,
	"avg_response_time" numeric(10, 2),
	"compliance_blocks" integer DEFAULT 0,
	"compliance_flags" integer DEFAULT 0,
	"appointments_booked" integer DEFAULT 0,
	"questions_answered" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_human_takeovers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"taken_over_by_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"trigger_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"messages_during_takeover" integer DEFAULT 0,
	"resolution" text,
	"returned_to_ai" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"message_type" varchar(20) DEFAULT 'TEXT' NOT NULL,
	"content" text NOT NULL,
	"media_url" varchar(500),
	"responded_by" varchar(10) NOT NULL,
	"responded_by_id" uuid,
	"pre_processing_check" json,
	"ai_processing_check" json,
	"post_processing_check" json,
	"compliance_risk" varchar(10) DEFAULT 'NONE',
	"whatsapp_message_id" varchar(100),
	"delivered_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_response_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(30) NOT NULL,
	"trigger_keywords" json DEFAULT '[]'::json,
	"content" text NOT NULL,
	"variables" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid,
	"client_phone" varchar(20) NOT NULL,
	"client_name" varchar(255),
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"control_mode" varchar(10) DEFAULT 'AI' NOT NULL,
	"lgpd_consent_given" boolean DEFAULT false,
	"lgpd_consent_at" timestamp,
	"context" json DEFAULT '{}'::json,
	"message_count" integer DEFAULT 0,
	"ai_response_count" integer DEFAULT 0,
	"human_response_count" integer DEFAULT 0,
	"last_message_at" timestamp,
	"human_takeover_at" timestamp,
	"human_takeover_by_id" uuid,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alexis_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"assistant_name" varchar(50) DEFAULT 'ALEXIS',
	"welcome_message" text DEFAULT 'Olá! Sou ALEXIS, assistente virtual do salão. Como posso ajudar?',
	"personality" varchar(20) DEFAULT 'PROFESSIONAL',
	"language" varchar(10) DEFAULT 'pt-BR',
	"compliance_level" varchar(10) DEFAULT 'STRICT',
	"anvisa_warnings_enabled" boolean DEFAULT true,
	"lgpd_consent_required" boolean DEFAULT true,
	"data_retention_days" integer DEFAULT 365,
	"auto_response_enabled" boolean DEFAULT true,
	"max_responses_per_minute" integer DEFAULT 10,
	"human_takeover_keywords" json DEFAULT '["#eu","falar com humano","atendente"]'::json,
	"ai_resume_keywords" json DEFAULT '["#ia","voltar alexis","voltar robô"]'::json,
	"operating_hours_enabled" boolean DEFAULT false,
	"operating_hours_start" varchar(5) DEFAULT '08:00',
	"operating_hours_end" varchar(5) DEFAULT '20:00',
	"out_of_hours_message" text DEFAULT 'Estamos fora do horário de atendimento. Retornaremos em breve!',
	"whatsapp_integration_id" varchar(255),
	"webhook_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alexis_settings_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "appointment_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"service_id" integer NOT NULL,
	"professional_id" uuid NOT NULL,
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"whatsapp_provider" "whatsapp_provider" DEFAULT 'META' NOT NULL,
	"whatsapp_api_key" text,
	"whatsapp_phone_number_id" varchar(100),
	"whatsapp_business_account_id" varchar(100),
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"sms_provider" "sms_provider" DEFAULT 'TWILIO' NOT NULL,
	"sms_api_key" text,
	"sms_account_sid" varchar(100),
	"sms_phone_number" varchar(20),
	"reminder_enabled" boolean DEFAULT true NOT NULL,
	"reminder_hours_before" integer DEFAULT 24 NOT NULL,
	"confirmation_enabled" boolean DEFAULT true NOT NULL,
	"confirmation_hours_before" integer DEFAULT 48 NOT NULL,
	"birthday_enabled" boolean DEFAULT true NOT NULL,
	"birthday_time" varchar(5) DEFAULT '09:00' NOT NULL,
	"birthday_discount_percent" integer,
	"review_request_enabled" boolean DEFAULT false NOT NULL,
	"review_request_hours_after" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automation_settings_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "cart_link_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_link_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"converted_to_reservation" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "cart_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"client_id" uuid,
	"client_phone" varchar(20),
	"client_name" varchar(255),
	"items" json DEFAULT '[]'::json,
	"total_amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"final_amount" numeric(10, 2) NOT NULL,
	"message" text,
	"expires_at" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"converted_at" timestamp,
	"converted_command_id" uuid,
	"source" varchar(20) DEFAULT 'MANUAL',
	"campaign_id" uuid,
	"view_count" integer DEFAULT 0,
	"last_viewed_at" timestamp,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cash_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cash_register_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" text NOT NULL,
	"performed_by_id" uuid NOT NULL,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"opening_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"closing_balance" numeric(10, 2),
	"expected_balance" numeric(10, 2),
	"difference" numeric(10, 2),
	"total_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_cash" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_card" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_pix" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_withdrawals" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_deposits" numeric(10, 2) DEFAULT '0' NOT NULL,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"opened_by_id" uuid NOT NULL,
	"closed_at" timestamp,
	"closed_by_id" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_hair_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"hair_type" "hair_type",
	"hair_thickness" "hair_thickness",
	"hair_length" "hair_length",
	"hair_porosity" "hair_porosity",
	"scalp_type" "scalp_type",
	"chemical_history" json DEFAULT '[]'::json,
	"main_concerns" json DEFAULT '[]'::json,
	"allergies" text,
	"current_products" text,
	"notes" text,
	"last_assessment_date" date,
	"last_assessed_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_hair_profiles_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "client_loyalty_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"current_points" integer DEFAULT 0 NOT NULL,
	"total_points_earned" integer DEFAULT 0 NOT NULL,
	"total_points_redeemed" integer DEFAULT 0 NOT NULL,
	"current_tier_id" uuid,
	"tier_achieved_at" timestamp,
	"next_tier_progress" integer DEFAULT 0 NOT NULL,
	"referral_code" varchar(20) NOT NULL,
	"referred_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_loyalty_accounts_client_id_unique" UNIQUE("client_id"),
	CONSTRAINT "client_loyalty_accounts_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "client_no_shows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"blocked_until" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_notes_ai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"note_type" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_product_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"delivery_type" varchar(20) DEFAULT 'PICKUP',
	"delivery_address" text,
	"start_date" date NOT NULL,
	"next_delivery_date" date NOT NULL,
	"last_delivery_date" date,
	"total_deliveries" integer DEFAULT 0,
	"payment_method" varchar(20) DEFAULT 'PIX',
	"mercado_pago_subscription_id" varchar(255),
	"notes" text,
	"paused_at" timestamp,
	"pause_reason" text,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"reference_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"total_price" numeric(10, 2) NOT NULL,
	"performer_id" uuid,
	"added_by_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"canceled_at" timestamp,
	"canceled_by_id" uuid,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_id" uuid NOT NULL,
	"method" varchar(30) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"received_by_id" uuid NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid,
	"appointment_id" uuid,
	"card_number" varchar(20) NOT NULL,
	"code" varchar(50),
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"opened_by_id" uuid NOT NULL,
	"service_closed_at" timestamp,
	"service_closed_by_id" uuid,
	"cashier_closed_at" timestamp,
	"cashier_closed_by_id" uuid,
	"total_gross" numeric(10, 2) DEFAULT '0',
	"total_discounts" numeric(10, 2) DEFAULT '0',
	"total_net" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"command_item_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"item_description" varchar(255) NOT NULL,
	"item_value" numeric(10, 2) NOT NULL,
	"commission_percentage" numeric(5, 2) NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp,
	"paid_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"context" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"assistant_name" varchar(50) DEFAULT 'Belle',
	"personality" varchar(20) DEFAULT 'FRIENDLY',
	"daily_briefing_enabled" boolean DEFAULT true,
	"daily_briefing_time" varchar(5) DEFAULT '08:00',
	"alerts_enabled" boolean DEFAULT true,
	"tips_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_settings_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "google_event_conflicts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"local_block_id" uuid,
	"google_event_id" varchar(255),
	"conflict_type" varchar(50) NOT NULL,
	"local_data" json,
	"google_data" json,
	"status" "conflict_status" DEFAULT 'PENDING' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by_id" uuid,
	"resolution" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"google_account_email" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expires_at" timestamp NOT NULL,
	"calendar_id" varchar(255) DEFAULT 'primary' NOT NULL,
	"sync_direction" "sync_direction" DEFAULT 'GOOGLE_TO_APP' NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"last_sync_status" "integration_status",
	"status" "integration_status" DEFAULT 'ACTIVE' NOT NULL,
	"error_message" text,
	"settings" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"integration_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"direction" "sync_direction" NOT NULL,
	"status" "sync_log_status" NOT NULL,
	"events_created" integer DEFAULT 0 NOT NULL,
	"events_updated" integer DEFAULT 0 NOT NULL,
	"events_deleted" integer DEFAULT 0 NOT NULL,
	"conflicts_found" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"details" json,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoice_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp,
	"mercado_pago_payment_id" varchar(255),
	"transaction_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(100) DEFAULT 'Programa de Fidelidade' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"points_per_real_service" numeric(5, 2) DEFAULT '1' NOT NULL,
	"points_per_real_product" numeric(5, 2) DEFAULT '1' NOT NULL,
	"points_expire_days" integer,
	"minimum_redeem_points" integer DEFAULT 100 NOT NULL,
	"welcome_points" integer DEFAULT 0 NOT NULL,
	"birthday_points" integer DEFAULT 0 NOT NULL,
	"referral_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_programs_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "loyalty_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"points_spent" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"code" varchar(20) NOT NULL,
	"used_at" timestamp,
	"used_in_command_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_redemptions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "loyalty_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" varchar(30) NOT NULL,
	"points_cost" integer NOT NULL,
	"value" numeric(10, 2),
	"product_id" integer,
	"service_id" integer,
	"min_tier" varchar(20),
	"max_redemptions_per_client" integer,
	"total_available" integer,
	"valid_days" integer DEFAULT 30 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"image_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(20) NOT NULL,
	"min_points" integer DEFAULT 0 NOT NULL,
	"color" varchar(20) DEFAULT '#6B7280' NOT NULL,
	"icon" varchar(50),
	"benefits" json DEFAULT '{}'::json,
	"points_multiplier" numeric(3, 2) DEFAULT '1' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"points" integer NOT NULL,
	"balance" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"command_id" uuid,
	"appointment_id" uuid,
	"reward_id" uuid,
	"expires_at" timestamp,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid,
	"type" varchar(30) NOT NULL,
	"context" json DEFAULT '{}'::json,
	"value" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"template_id" uuid,
	"client_id" uuid,
	"appointment_id" uuid,
	"channel" "message_channel" NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"status" "message_status" DEFAULT 'PENDING' NOT NULL,
	"external_id" varchar(255),
	"error_message" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"cost" numeric(10, 4),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "message_template_type" NOT NULL,
	"channel" "message_channel" DEFAULT 'WHATSAPP' NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"trigger_hours_before" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_monthly" numeric(10, 2) NOT NULL,
	"price_yearly" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"max_users" integer NOT NULL,
	"max_clients" integer NOT NULL,
	"max_salons" integer DEFAULT 1 NOT NULL,
	"features" json DEFAULT '[]'::json,
	"has_fiscal" boolean DEFAULT false NOT NULL,
	"has_automation" boolean DEFAULT false NOT NULL,
	"has_reports" boolean DEFAULT false NOT NULL,
	"has_ai" boolean DEFAULT false NOT NULL,
	"trial_days" integer DEFAULT 14,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_recommendation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"conditions" json NOT NULL,
	"recommended_products" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_recommendations_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"command_id" uuid,
	"appointment_id" uuid,
	"rule_id" uuid,
	"product_id" integer NOT NULL,
	"reason" text,
	"was_accepted" boolean,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"client_id" uuid,
	"client_name" varchar(255) NOT NULL,
	"client_phone" varchar(20) NOT NULL,
	"cart_link_id" uuid,
	"items" json DEFAULT '[]'::json,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"delivery_type" varchar(20) DEFAULT 'PICKUP',
	"delivery_address" text,
	"scheduled_pickup_date" date,
	"notes" text,
	"confirmed_at" timestamp,
	"confirmed_by_id" uuid,
	"ready_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_subscription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"billing_period" varchar(20) DEFAULT 'MONTHLY' NOT NULL,
	"original_price" numeric(10, 2) NOT NULL,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"final_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"max_subscribers" integer,
	"current_subscribers" integer DEFAULT 0,
	"image_url" varchar(500),
	"benefits" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_availabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"break_start_time" varchar(5),
	"break_end_time" varchar(5),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"professional_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10) NOT NULL,
	"start_time" varchar(5),
	"end_time" varchar(5),
	"all_day" boolean DEFAULT true NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"recurring_pattern" "recurring_pattern",
	"recurring_days" json,
	"recurring_end_date" varchar(10),
	"status" "block_status" DEFAULT 'APPROVED' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"approved_by_id" uuid,
	"approved_at" timestamp,
	"rejection_reason" text,
	"external_source" varchar(50),
	"external_event_id" varchar(255),
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_token_blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salon_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'TRIALING' NOT NULL,
	"billing_period" varchar(10) DEFAULT 'MONTHLY' NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"max_users_override" integer,
	"mercado_pago_customer_id" varchar(255),
	"mercado_pago_subscription_id" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "salon_subscriptions_salon_id_unique" UNIQUE("salon_id")
);
--> statement-breakpoint
CREATE TABLE "scheduled_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"appointment_id" uuid,
	"channel" "message_channel" NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"status" "scheduled_message_status" DEFAULT 'PENDING' NOT NULL,
	"cancelled_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "service_category" DEFAULT 'HAIR' NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"commission_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"buffer_before" integer DEFAULT 0 NOT NULL,
	"buffer_after" integer DEFAULT 0 NOT NULL,
	"allow_encaixe" boolean DEFAULT false NOT NULL,
	"requires_room" boolean DEFAULT false NOT NULL,
	"allow_home_service" boolean DEFAULT false NOT NULL,
	"home_service_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_advance_booking_days" integer DEFAULT 30 NOT NULL,
	"min_advance_booking_hours" integer DEFAULT 1 NOT NULL,
	"allow_online_booking" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"salon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "stock_adjustment_type" NOT NULL,
	"quantity" integer NOT NULL,
	"previous_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"scheduled_date" date NOT NULL,
	"delivered_date" date,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"delivery_type" varchar(20) NOT NULL,
	"command_id" uuid,
	"total_amount" numeric(10, 2) NOT NULL,
	"notes" text,
	"prepared_by_id" uuid,
	"delivered_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_delivery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"previous_value" text,
	"new_value" text,
	"metadata" json,
	"performed_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"salon_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"reference_period_start" timestamp NOT NULL,
	"reference_period_end" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"payment_method" varchar(20),
	"mercado_pago_payment_id" varchar(255),
	"mercado_pago_preference_id" varchar(255),
	"pix_qr_code" text,
	"pix_qr_code_base64" text,
	"pix_expires_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"due_date" date NOT NULL,
	"paid_at" timestamp,
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"status" "account_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" "subscription_plan" NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"yearly_price" numeric(10, 2),
	"features" json NOT NULL,
	"trial_days" integer DEFAULT 7,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"salon_id" uuid NOT NULL,
	"plan_id" integer NOT NULL,
	"status" "subscription_status" DEFAULT 'TRIALING' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"canceled_at" timestamp,
	"trial_ends_at" timestamp,
	"grace_period_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upsell_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"rule_id" uuid NOT NULL,
	"client_id" uuid,
	"appointment_id" uuid,
	"command_id" uuid,
	"status" varchar(20) DEFAULT 'SHOWN' NOT NULL,
	"offered_products" json DEFAULT '[]'::json,
	"offered_services" json DEFAULT '[]'::json,
	"total_original_price" numeric(10, 2) NOT NULL,
	"total_discounted_price" numeric(10, 2) NOT NULL,
	"accepted_at" timestamp,
	"declined_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upsell_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"trigger_type" varchar(20) NOT NULL,
	"trigger_service_ids" json DEFAULT '[]'::json,
	"trigger_product_ids" json DEFAULT '[]'::json,
	"trigger_hair_types" json DEFAULT '[]'::json,
	"recommended_products" json DEFAULT '[]'::json,
	"recommended_services" json DEFAULT '[]'::json,
	"display_message" text,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"valid_from" date,
	"valid_until" date,
	"max_uses_total" integer,
	"max_uses_per_client" integer,
	"current_uses" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "salon_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "professional_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DATA TYPE "public"."appointment_status" USING "status"::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "client_name" varchar(255);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "client_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "client_email" varchar(255);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "service_id" integer;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "start_time" varchar(5);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "end_time" varchar(5);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "buffer_before" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "buffer_after" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "location_type" "location_type" DEFAULT 'SALON' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "confirmation_status" "confirmation_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "confirmed_via" "confirmation_via";--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "priority" "appointment_priority" DEFAULT 'NORMAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "color" varchar(20);--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "command_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "no_show_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "source" "appointment_source" DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "created_by_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "cancelled_by_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "total_visits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "hair_types" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "concerns" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "contraindications" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ingredients" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "how_to_use" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "benefits" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_test_id_ab_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."ab_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_blocked_terms_log" ADD CONSTRAINT "ai_blocked_terms_log_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_blocked_terms_log" ADD CONSTRAINT "ai_blocked_terms_log_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_briefings" ADD CONSTRAINT "ai_briefings_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_briefings" ADD CONSTRAINT "ai_briefings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_human_agent_id_users_id_fk" FOREIGN KEY ("human_agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interaction_logs" ADD CONSTRAINT "ai_interaction_logs_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_blocked_keywords" ADD CONSTRAINT "alexis_blocked_keywords_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_compliance_logs" ADD CONSTRAINT "alexis_compliance_logs_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_compliance_logs" ADD CONSTRAINT "alexis_compliance_logs_session_id_alexis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."alexis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_compliance_logs" ADD CONSTRAINT "alexis_compliance_logs_message_id_alexis_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."alexis_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_compliance_logs" ADD CONSTRAINT "alexis_compliance_logs_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_daily_metrics" ADD CONSTRAINT "alexis_daily_metrics_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_human_takeovers" ADD CONSTRAINT "alexis_human_takeovers_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_human_takeovers" ADD CONSTRAINT "alexis_human_takeovers_session_id_alexis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."alexis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_human_takeovers" ADD CONSTRAINT "alexis_human_takeovers_taken_over_by_id_users_id_fk" FOREIGN KEY ("taken_over_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_messages" ADD CONSTRAINT "alexis_messages_session_id_alexis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."alexis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_messages" ADD CONSTRAINT "alexis_messages_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_messages" ADD CONSTRAINT "alexis_messages_responded_by_id_users_id_fk" FOREIGN KEY ("responded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_response_templates" ADD CONSTRAINT "alexis_response_templates_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_sessions" ADD CONSTRAINT "alexis_sessions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_sessions" ADD CONSTRAINT "alexis_sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_sessions" ADD CONSTRAINT "alexis_sessions_human_takeover_by_id_users_id_fk" FOREIGN KEY ("human_takeover_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alexis_settings" ADD CONSTRAINT "alexis_settings_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD CONSTRAINT "automation_settings_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_link_views" ADD CONSTRAINT "cart_link_views_cart_link_id_cart_links_id_fk" FOREIGN KEY ("cart_link_id") REFERENCES "public"."cart_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_links" ADD CONSTRAINT "cart_links_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_links" ADD CONSTRAINT "cart_links_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_links" ADD CONSTRAINT "cart_links_converted_command_id_commands_id_fk" FOREIGN KEY ("converted_command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_links" ADD CONSTRAINT "cart_links_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_cash_register_id_cash_registers_id_fk" FOREIGN KEY ("cash_register_id") REFERENCES "public"."cash_registers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_opened_by_id_users_id_fk" FOREIGN KEY ("opened_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hair_profiles" ADD CONSTRAINT "client_hair_profiles_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hair_profiles" ADD CONSTRAINT "client_hair_profiles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_hair_profiles" ADD CONSTRAINT "client_hair_profiles_last_assessed_by_id_users_id_fk" FOREIGN KEY ("last_assessed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_loyalty_accounts" ADD CONSTRAINT "client_loyalty_accounts_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_loyalty_accounts" ADD CONSTRAINT "client_loyalty_accounts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_loyalty_accounts" ADD CONSTRAINT "client_loyalty_accounts_program_id_loyalty_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_loyalty_accounts" ADD CONSTRAINT "client_loyalty_accounts_current_tier_id_loyalty_tiers_id_fk" FOREIGN KEY ("current_tier_id") REFERENCES "public"."loyalty_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_loyalty_accounts" ADD CONSTRAINT "client_loyalty_accounts_referred_by_id_clients_id_fk" FOREIGN KEY ("referred_by_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_no_shows" ADD CONSTRAINT "client_no_shows_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_no_shows" ADD CONSTRAINT "client_no_shows_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_no_shows" ADD CONSTRAINT "client_no_shows_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes_ai" ADD CONSTRAINT "client_notes_ai_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes_ai" ADD CONSTRAINT "client_notes_ai_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_notes_ai" ADD CONSTRAINT "client_notes_ai_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_subscriptions" ADD CONSTRAINT "client_product_subscriptions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_subscriptions" ADD CONSTRAINT "client_product_subscriptions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_subscriptions" ADD CONSTRAINT "client_product_subscriptions_plan_id_product_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_events" ADD CONSTRAINT "command_events_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_events" ADD CONSTRAINT "command_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_items" ADD CONSTRAINT "command_items_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_items" ADD CONSTRAINT "command_items_performer_id_users_id_fk" FOREIGN KEY ("performer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_items" ADD CONSTRAINT "command_items_added_by_id_users_id_fk" FOREIGN KEY ("added_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_items" ADD CONSTRAINT "command_items_canceled_by_id_users_id_fk" FOREIGN KEY ("canceled_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_payments" ADD CONSTRAINT "command_payments_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_payments" ADD CONSTRAINT "command_payments_received_by_id_users_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_opened_by_id_users_id_fk" FOREIGN KEY ("opened_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_service_closed_by_id_users_id_fk" FOREIGN KEY ("service_closed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_cashier_closed_by_id_users_id_fk" FOREIGN KEY ("cashier_closed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_command_item_id_command_items_id_fk" FOREIGN KEY ("command_item_id") REFERENCES "public"."command_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_paid_by_id_users_id_fk" FOREIGN KEY ("paid_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_conversations" ADD CONSTRAINT "dashboard_conversations_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_conversations" ADD CONSTRAINT "dashboard_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_settings" ADD CONSTRAINT "dashboard_settings_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_event_conflicts" ADD CONSTRAINT "google_event_conflicts_integration_id_google_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."google_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_event_conflicts" ADD CONSTRAINT "google_event_conflicts_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_event_conflicts" ADD CONSTRAINT "google_event_conflicts_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_event_conflicts" ADD CONSTRAINT "google_event_conflicts_local_block_id_professional_blocks_id_fk" FOREIGN KEY ("local_block_id") REFERENCES "public"."professional_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_event_conflicts" ADD CONSTRAINT "google_event_conflicts_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_integrations" ADD CONSTRAINT "google_integrations_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_integrations" ADD CONSTRAINT "google_integrations_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_sync_logs" ADD CONSTRAINT "google_sync_logs_integration_id_google_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."google_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_sync_logs" ADD CONSTRAINT "google_sync_logs_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_sync_logs" ADD CONSTRAINT "google_sync_logs_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_subscription_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_account_id_client_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."client_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_transaction_id_loyalty_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."loyalty_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_used_in_command_id_commands_id_fk" FOREIGN KEY ("used_in_command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_program_id_loyalty_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_tiers" ADD CONSTRAINT "loyalty_tiers_program_id_loyalty_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."loyalty_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_account_id_client_loyalty_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."client_loyalty_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_reward_id_loyalty_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_events" ADD CONSTRAINT "marketing_events_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_events" ADD CONSTRAINT "marketing_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_template_id_message_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."message_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendation_rules" ADD CONSTRAINT "product_recommendation_rules_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendation_rules" ADD CONSTRAINT "product_recommendation_rules_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_log" ADD CONSTRAINT "product_recommendations_log_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_log" ADD CONSTRAINT "product_recommendations_log_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_log" ADD CONSTRAINT "product_recommendations_log_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_log" ADD CONSTRAINT "product_recommendations_log_rule_id_product_recommendation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."product_recommendation_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations_log" ADD CONSTRAINT "product_recommendations_log_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reservations" ADD CONSTRAINT "product_reservations_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reservations" ADD CONSTRAINT "product_reservations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reservations" ADD CONSTRAINT "product_reservations_cart_link_id_cart_links_id_fk" FOREIGN KEY ("cart_link_id") REFERENCES "public"."cart_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reservations" ADD CONSTRAINT "product_reservations_confirmed_by_id_users_id_fk" FOREIGN KEY ("confirmed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subscription_items" ADD CONSTRAINT "product_subscription_items_plan_id_product_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subscription_items" ADD CONSTRAINT "product_subscription_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subscription_plans" ADD CONSTRAINT "product_subscription_plans_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_availabilities" ADD CONSTRAINT "professional_availabilities_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_availabilities" ADD CONSTRAINT "professional_availabilities_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_blocks" ADD CONSTRAINT "professional_blocks_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_blocks" ADD CONSTRAINT "professional_blocks_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_blocks" ADD CONSTRAINT "professional_blocks_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_blocks" ADD CONSTRAINT "professional_blocks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_token_blacklist" ADD CONSTRAINT "refresh_token_blacklist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon_subscriptions" ADD CONSTRAINT "salon_subscriptions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salon_subscriptions" ADD CONSTRAINT "salon_subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_template_id_message_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."message_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_messages" ADD CONSTRAINT "scheduled_messages_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_subscription_id_client_product_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."client_product_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_prepared_by_id_users_id_fk" FOREIGN KEY ("prepared_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_delivered_by_id_users_id_fk" FOREIGN KEY ("delivered_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_delivery_items" ADD CONSTRAINT "subscription_delivery_items_delivery_id_subscription_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."subscription_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_delivery_items" ADD CONSTRAINT "subscription_delivery_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_salon_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."salon_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_salon_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."salon_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_offers" ADD CONSTRAINT "upsell_offers_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_offers" ADD CONSTRAINT "upsell_offers_rule_id_upsell_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."upsell_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_offers" ADD CONSTRAINT "upsell_offers_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_offers" ADD CONSTRAINT "upsell_offers_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_offers" ADD CONSTRAINT "upsell_offers_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upsell_rules" ADD CONSTRAINT "upsell_rules_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_id_users_id_fk" FOREIGN KEY ("cancelled_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;