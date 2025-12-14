CREATE TYPE "public"."fee_mode" AS ENUM('PERCENT', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."fee_type" AS ENUM('DISCOUNT', 'FEE');--> statement-breakpoint
CREATE TYPE "public"."payment_destination_type" AS ENUM('BANK', 'CARD_MACHINE', 'CASH_DRAWER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('CASH', 'PIX', 'CARD_CREDIT', 'CARD_DEBIT', 'TRANSFER', 'VOUCHER', 'OTHER');--> statement-breakpoint
CREATE TABLE "payment_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"bank_name" varchar(100),
	"last_digits" varchar(10),
	"description" text,
	"fee_type" varchar(20),
	"fee_mode" varchar(20),
	"fee_value" numeric(10, 2) DEFAULT '0',
	"sort_order" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"salon_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"fee_type" varchar(20),
	"fee_mode" varchar(20),
	"fee_value" numeric(10, 2) DEFAULT '0',
	"sort_order" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "command_payments" ALTER COLUMN "method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "command_payments" ADD COLUMN "payment_method_id" uuid;--> statement-breakpoint
ALTER TABLE "command_payments" ADD COLUMN "payment_destination_id" uuid;--> statement-breakpoint
ALTER TABLE "command_payments" ADD COLUMN "gross_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "command_payments" ADD COLUMN "fee_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "command_payments" ADD COLUMN "net_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "payment_destinations" ADD CONSTRAINT "payment_destinations_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_salon_id_salons_id_fk" FOREIGN KEY ("salon_id") REFERENCES "public"."salons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_payments" ADD CONSTRAINT "command_payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_payments" ADD CONSTRAINT "command_payments_payment_destination_id_payment_destinations_id_fk" FOREIGN KEY ("payment_destination_id") REFERENCES "public"."payment_destinations"("id") ON DELETE no action ON UPDATE no action;