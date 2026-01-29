import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
  serial,
  decimal,
  date,
  json,
  unique,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

/**
 * Enums
 */
export const unitEnum = pgEnum('unit', ['UN', 'ML', 'KG', 'L', 'G']);
/**
 * Enum para categoria de servico
 */
export const serviceCategoryEnum = pgEnum('service_category', [
  'HAIR',
  'BARBER',
  'NAILS',
  'SKIN',
  'MAKEUP',
  'OTHER',
]);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const accountStatusEnum = pgEnum('account_status', ['PENDING', 'PAID', 'OVERDUE']);
export const userRoleEnum = pgEnum('user_role', ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'STOCK_LOW',
  'CLIENT_INACTIVE',
  'BILL_DUE',
  'APPOINTMENT_REMINDER',
  'CHURN_RISK',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLIC_ACCESS',
  'TOKEN_VALIDATED',
  'WHATSAPP_SENT',
  'WHATSAPP_FAILED',
  'CRITICAL_OVERRIDE',
  'STOCK_CONSUMED',
]);

// Enum para Status de Agendamento
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'SCHEDULED',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

// Enum para Status de Confirmação
export const confirmationStatusEnum = pgEnum('confirmation_status', [
  'PENDING',
  'CONFIRMED',
  'AUTO_CONFIRMED',
]);

// Enum para Tipo de Local
export const locationTypeEnum = pgEnum('location_type', [
  'SALON',
  'HOME',
  'ONLINE',
]);

// Enum para Prioridade
export const appointmentPriorityEnum = pgEnum('appointment_priority', [
  'NORMAL',
  'VIP',
  'URGENT',
]);

// Enum para Fonte do Agendamento
export const appointmentSourceEnum = pgEnum('appointment_source', [
  'MANUAL',
  'ONLINE',
  'WHATSAPP',
  'APP',
  'ALEXIS',
]);

// Enum para Via de Confirmação
export const confirmationViaEnum = pgEnum('confirmation_via', [
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'MANUAL',
]);

// Enum para Tipo de Bloqueio
export const blockTypeEnum = pgEnum('block_type', [
  'DAY_OFF',
  'VACATION',
  'SICK_LEAVE',
  'PERSONAL',
  'LUNCH',
  'TRAINING',
  'MAINTENANCE',
  'OTHER',
]);

// Enum para Status de Bloqueio
export const blockStatusEnum = pgEnum('block_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

// Enum para Padrão de Recorrência
export const recurringPatternEnum = pgEnum('recurring_pattern', [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
]);

// Enums para Sistema de Assinaturas
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'SUSPENDED',
  'CANCELED',
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'FREE',
  'BASIC',
  'PRO',
  'PREMIUM',
]);

export const billingPeriodEnum = pgEnum('billing_period', ['MONTHLY', 'YEARLY']);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'PENDING',
  'PAID',
  'OVERDUE',
  'CANCELED',
  'FAILED',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'PIX',
  'CARD',
  'BOLETO',
  'TRANSFER',
  'MANUAL',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'CONFIRMED',
  'FAILED',
  'REFUNDED',
]);

export const subscriptionEventTypeEnum = pgEnum('subscription_event_type', [
  'CREATED',
  'PLAN_CHANGED',
  'STATUS_CHANGED',
  'INVOICE_CREATED',
  'INVOICE_PAID',
  'PAYMENT_RECEIVED',
  'SUSPENDED',
  'REACTIVATED',
  'CANCELED',
]);

// ==================== ENUMS PARA AGENDAMENTO ONLINE ====================

// Enum para Status de Hold (reserva temporária)
export const holdStatusEnum = pgEnum('hold_status', [
  'ACTIVE',
  'CONVERTED',
  'EXPIRED',
  'RELEASED',
]);

// Enum para Tipo de OTP
export const otpTypeEnum = pgEnum('otp_type', [
  'PHONE_VERIFICATION',
  'BOOKING_CONFIRMATION',
  'CANCEL_BOOKING',
]);

// Enum para Status de Depósito
export const depositStatusEnum = pgEnum('deposit_status', [
  'PENDING',
  'PAID',
  'REFUNDED',
  'FORFEITED',
]);

// Enum para Tipo de Regra de Booking
export const bookingRuleTypeEnum = pgEnum('booking_rule_type', [
  'BLOCKED',
  'VIP_ONLY',
  'DEPOSIT_REQUIRED',
  'RESTRICTED_SERVICES',
]);

// Enum para Modo de Operação do Booking Online
export const operationModeEnum = pgEnum('operation_mode', [
  'SECRETARY_ONLY',
  'SECRETARY_AND_ONLINE',
  'SECRETARY_WITH_LINK',
]);

// Enum para Aplicação de Depósito
export const depositAppliesToEnum = pgEnum('deposit_applies_to', [
  'ALL',
  'NEW_CLIENTS',
  'SPECIFIC_SERVICES',
  'SELECTED_CLIENTS',
]);

/**
 * Interface para tipagem do work_schedule
 */
export interface WorkSchedule {
  [key: string]: string | null;
}

/**
 * Interface para tipagem dos servicos incluidos no pacote
 */
export interface PackageServices {
  services: { name: string; quantity: number }[];
}

/**
 * Interface para recursos do plano
 */
export interface PlanFeatures {
  maxUsers: number;
  maxClients: number;
  maxSalons: number;
  hasReports: boolean;
  hasAI: boolean;
  hasApi: boolean;
  hasFiscal: boolean;
  hasAutomation: boolean;
  customFeatures?: string[];
}

/**
 * Tabela de Planos de Assinatura (plans)
 */
export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('BRL').notNull(),
  maxUsers: integer('max_users').notNull(),
  maxClients: integer('max_clients').notNull(),
  maxSalons: integer('max_salons').default(1).notNull(),
  features: json('features').$type<string[]>().default([]),
  hasFiscal: boolean('has_fiscal').default(false).notNull(),
  hasAutomation: boolean('has_automation').default(false).notNull(),
  hasReports: boolean('has_reports').default(false).notNull(),
  hasAI: boolean('has_ai').default(false).notNull(),
  trialDays: integer('trial_days').default(14),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Planos de Assinatura Legada (manter para compatibilidade)
 */
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: subscriptionPlanEnum('code').notNull(),
  description: text('description'),
  monthlyPrice: decimal('monthly_price', { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal('yearly_price', { precision: 10, scale: 2 }),
  features: json('features').$type<PlanFeatures>().notNull(),
  trialDays: integer('trial_days').default(7),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de saloes (Multi-localidade)
 */
export const salons = pgTable('salons', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique(), // URL amigável para booking online
  address: text('address'),
  locationUrl: text('location_url'), // Link do Google Maps
  wazeUrl: text('waze_url'), // Link do Waze
  taxId: varchar('tax_id', { length: 20 }), // CNPJ
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Assinaturas dos Saloes (Nova)
 */
export const salonSubscriptions = pgTable('salon_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  status: varchar('status', { length: 20 }).default('TRIALING').notNull(),
  billingPeriod: varchar('billing_period', { length: 10 }).default('MONTHLY').notNull(),
  startsAt: timestamp('starts_at').defaultNow().notNull(),
  trialEndsAt: timestamp('trial_ends_at'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  canceledAt: timestamp('canceled_at'),
  maxUsersOverride: integer('max_users_override'),
  mercadoPagoCustomerId: varchar('mercado_pago_customer_id', { length: 255 }),
  mercadoPagoSubscriptionId: varchar('mercado_pago_subscription_id', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Assinaturas Legada (manter para compatibilidade)
 */
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  planId: integer('plan_id').references(() => subscriptionPlans.id).notNull(),
  status: subscriptionStatusEnum('status').default('TRIALING').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  canceledAt: timestamp('canceled_at'),
  trialEndsAt: timestamp('trial_ends_at'),
  gracePeriodEndsAt: timestamp('grace_period_ends_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Faturas de Assinatura
 */
export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => salonSubscriptions.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  referencePeriodStart: timestamp('reference_period_start').notNull(),
  referencePeriodEnd: timestamp('reference_period_end').notNull(),
  dueDate: timestamp('due_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }),
  mercadoPagoPaymentId: varchar('mercado_pago_payment_id', { length: 255 }),
  mercadoPagoPreferenceId: varchar('mercado_pago_preference_id', { length: 255 }),
  pixQrCode: text('pix_qr_code'),
  pixQrCodeBase64: text('pix_qr_code_base64'),
  pixExpiresAt: timestamp('pix_expires_at'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Pagamentos de Faturas
 */
export const invoicePayments = pgTable('invoice_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => subscriptionInvoices.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  paidAt: timestamp('paid_at'),
  mercadoPagoPaymentId: varchar('mercado_pago_payment_id', { length: 255 }),
  transactionData: json('transaction_data').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Eventos de Assinatura (Auditoria)
 */
export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => salonSubscriptions.id).notNull(),
  type: varchar('type', { length: 30 }).notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  performedById: uuid('performed_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Pagamentos de Assinatura Legada (manter para compatibilidade)
 */
export const subscriptionPayments = pgTable('subscription_payments', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  status: accountStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de clientes do salao
 */
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  phone: varchar('phone', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  birthDate: date('birth_date'),
  aiActive: boolean('ai_active').default(true).notNull(),
  technicalNotes: text('technical_notes'),
  preferences: text('preferences'),
  lastVisitDate: date('last_visit_date'),
  totalVisits: integer('total_visits').default(0).notNull(),
  churnRisk: boolean('churn_risk').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de usuarios/profissionais do salao
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').default('STYLIST').notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0.50'),
  workSchedule: json('work_schedule').$type<WorkSchedule>(),
  specialties: text('specialties'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de conversas/sessoes de chat
 */
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de mensagens
 */
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id)
    .notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  toolCalls: text('tool_calls'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de agendamentos (v3.0 - Completa)
 */
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  // Cliente
  clientId: uuid('client_id').references(() => clients.id),
  clientName: varchar('client_name', { length: 255 }),
  clientPhone: varchar('client_phone', { length: 20 }),
  clientEmail: varchar('client_email', { length: 255 }),
  // Profissional e serviço
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id),
  service: varchar('service', { length: 100 }).notNull(),
  // Data e hora
  date: varchar('date', { length: 10 }).notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  startTime: varchar('start_time', { length: 5 }),
  endTime: varchar('end_time', { length: 5 }),
  duration: integer('duration').notNull(),
  bufferBefore: integer('buffer_before').default(0).notNull(),
  bufferAfter: integer('buffer_after').default(0).notNull(),
  // Local
  locationType: locationTypeEnum('location_type').default('SALON').notNull(),
  address: text('address'),
  // Status
  status: appointmentStatusEnum('status').default('SCHEDULED').notNull(),
  confirmationStatus: confirmationStatusEnum('confirmation_status').default('PENDING').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  confirmedVia: confirmationViaEnum('confirmed_via'),
  // Prioridade e visual
  priority: appointmentPriorityEnum('priority').default('NORMAL').notNull(),
  color: varchar('color', { length: 20 }),
  // Preço
  price: decimal('price', { precision: 10, scale: 2 }).default('0').notNull(),
  // Notas
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  // Vinculação
  commandId: uuid('command_id'),
  clientPackageId: integer('client_package_id'),
  // Lembretes e histórico
  reminderSentAt: timestamp('reminder_sent_at'),
  noShowCount: integer('no_show_count').default(0).notNull(),
  source: appointmentSourceEnum('source').default('MANUAL').notNull(),
  // Auditoria
  createdById: uuid('created_by_id').references(() => users.id),
  updatedById: uuid('updated_by_id').references(() => users.id),
  cancelledById: uuid('cancelled_by_id').references(() => users.id),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // ==================== CAMPOS PARA AGENDAMENTO ONLINE ====================
  // Referência ao hold temporário que originou
  holdId: uuid('hold_id'),
  // Referência ao depósito (se exigido)
  depositId: uuid('deposit_id'),
  // Verificação de telefone
  verifiedPhone: boolean('verified_phone').default(false),
  // Token de acesso do cliente (para cancelamento/reagendamento)
  clientAccessToken: uuid('client_access_token'),
  clientAccessTokenExpiresAt: timestamp('client_access_token_expires_at'),
  // Rastreamento online
  bookedOnlineAt: timestamp('booked_online_at'),
  clientIp: varchar('client_ip', { length: 45 }),
  // Reagendamento
  rescheduledFromId: uuid('rescheduled_from_id'),
  rescheduledToId: uuid('rescheduled_to_id'),
  rescheduleCount: integer('reschedule_count').default(0),
});

/**
 * Tabela de servicos do salao (v3.0 - Enhanced)
 */
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: serviceCategoryEnum('category').default('HAIR').notNull(),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal('commission_percentage', { precision: 5, scale: 2 }).default('0').notNull(),
  // Novos campos para agendamento v3.0
  bufferBefore: integer('buffer_before').default(0).notNull(),
  bufferAfter: integer('buffer_after').default(0).notNull(),
  allowEncaixe: boolean('allow_encaixe').default(false).notNull(),
  requiresRoom: boolean('requires_room').default(false).notNull(),
  allowHomeService: boolean('allow_home_service').default(false).notNull(),
  homeServiceFee: decimal('home_service_fee', { precision: 10, scale: 2 }).default('0').notNull(),
  maxAdvanceBookingDays: integer('max_advance_booking_days').default(30).notNull(),
  minAdvanceBookingHours: integer('min_advance_booking_hours').default(1).notNull(),
  allowOnlineBooking: boolean('allow_online_booking').default(true).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Matriz Profissional × Serviço (especialidades / P0.3)
 * Join N:N entre users (profissionais) e services.
 * PK composta evita necessidade de uuid generator.
 */
export const professionalServices = pgTable(
  'professional_services',
  {
    professionalId: uuid('professional_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    serviceId: integer('service_id')
      .references(() => services.id, { onDelete: 'cascade' })
      .notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    priority: integer('priority').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.professionalId, table.serviceId] }),
  ],
);

export type ProfessionalService = typeof professionalServices.$inferSelect;
export type NewProfessionalService = typeof professionalServices.$inferInsert;

/**
 * Tabela de disponibilidade dos profissionais (horários de trabalho)
 */
export const professionalAvailabilities = pgTable('professional_availabilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Dom, 1=Seg, ..., 6=Sáb
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM
  endTime: varchar('end_time', { length: 5 }).notNull(),
  breakStartTime: varchar('break_start_time', { length: 5 }), // Almoço início
  breakEndTime: varchar('break_end_time', { length: 5 }), // Almoço fim
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de bloqueios/folgas/férias dos profissionais
 */
export const professionalBlocks = pgTable('professional_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  type: blockTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: varchar('start_date', { length: 10 }).notNull(), // YYYY-MM-DD
  endDate: varchar('end_date', { length: 10 }).notNull(),
  startTime: varchar('start_time', { length: 5 }), // null = dia inteiro
  endTime: varchar('end_time', { length: 5 }),
  allDay: boolean('all_day').default(true).notNull(),
  recurring: boolean('recurring').default(false).notNull(),
  recurringPattern: recurringPatternEnum('recurring_pattern'),
  recurringDays: json('recurring_days'), // Ex: [1,3,5] para seg/qua/sex
  recurringEndDate: varchar('recurring_end_date', { length: 10 }),
  status: blockStatusEnum('status').default('APPROVED').notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  approvedById: uuid('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  // Campos para sincronização com calendários externos
  externalSource: varchar('external_source', { length: 50 }), // 'GOOGLE', 'OUTLOOK', etc.
  externalEventId: varchar('external_event_id', { length: 255 }), // ID do evento no calendário externo
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== INTEGRAÇÃO GOOGLE CALENDAR ====================

/**
 * Enum para status da integração
 */
export const integrationStatusEnum = pgEnum('integration_status', [
  'ACTIVE',
  'ERROR',
  'DISCONNECTED',
  'TOKEN_EXPIRED',
]);

/**
 * Enum para direção de sincronização
 */
export const syncDirectionEnum = pgEnum('sync_direction', [
  'GOOGLE_TO_APP',
  'APP_TO_GOOGLE',
  'BIDIRECTIONAL',
]);

/**
 * Enum para status do log de sincronização
 */
export const syncLogStatusEnum = pgEnum('sync_log_status', [
  'SUCCESS',
  'PARTIAL',
  'ERROR',
]);

/**
 * Enum para status do conflito
 */
export const conflictStatusEnum = pgEnum('conflict_status', [
  'PENDING',
  'RESOLVED_KEEP_LOCAL',
  'RESOLVED_KEEP_GOOGLE',
  'RESOLVED_MERGE',
  'IGNORED',
]);

/**
 * Tabela de integrações com Google Calendar
 */
export const googleIntegrations = pgTable('google_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  googleAccountEmail: varchar('google_account_email', { length: 255 }).notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  calendarId: varchar('calendar_id', { length: 255 }).default('primary').notNull(),
  syncDirection: syncDirectionEnum('sync_direction').default('GOOGLE_TO_APP').notNull(),
  syncEnabled: boolean('sync_enabled').default(true).notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  lastSyncStatus: integrationStatusEnum('last_sync_status'),
  status: integrationStatusEnum('status').default('ACTIVE').notNull(),
  errorMessage: text('error_message'),
  settings: json('settings'), // Configurações adicionais (ex: cores, filtros)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de logs de sincronização
 */
export const googleSyncLogs = pgTable('google_sync_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  integrationId: uuid('integration_id').references(() => googleIntegrations.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  syncType: varchar('sync_type', { length: 50 }).notNull(), // 'FULL', 'INCREMENTAL', 'MANUAL'
  direction: syncDirectionEnum('direction').notNull(),
  status: syncLogStatusEnum('status').notNull(),
  eventsCreated: integer('events_created').default(0).notNull(),
  eventsUpdated: integer('events_updated').default(0).notNull(),
  eventsDeleted: integer('events_deleted').default(0).notNull(),
  conflictsFound: integer('conflicts_found').default(0).notNull(),
  errorMessage: text('error_message'),
  details: json('details'), // Detalhes adicionais da sincronização
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

/**
 * Tabela de conflitos de eventos
 */
export const googleEventConflicts = pgTable('google_event_conflicts', {
  id: uuid('id').defaultRandom().primaryKey(),
  integrationId: uuid('integration_id').references(() => googleIntegrations.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  localBlockId: uuid('local_block_id').references(() => professionalBlocks.id),
  googleEventId: varchar('google_event_id', { length: 255 }),
  conflictType: varchar('conflict_type', { length: 50 }).notNull(), // 'TIME_OVERLAP', 'DUPLICATE', 'MODIFIED_BOTH'
  localData: json('local_data'), // Dados do evento local
  googleData: json('google_data'), // Dados do evento do Google
  status: conflictStatusEnum('status').default('PENDING').notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolvedById: uuid('resolved_by_id').references(() => users.id),
  resolution: varchar('resolution', { length: 50 }), // Descrição da resolução
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== MÓDULO DE AUTOMAÇÃO WHATSAPP/SMS ====================

/**
 * Enum para tipo de template
 */
export const messageTemplateTypeEnum = pgEnum('message_template_type', [
  'APPOINTMENT_REMINDER',
  'APPOINTMENT_CONFIRMATION',
  'BIRTHDAY',
  'WELCOME',
  'REVIEW_REQUEST',
  'CUSTOM',
]);

/**
 * Enum para canal de mensagem
 */
export const messageChannelEnum = pgEnum('message_channel', [
  'WHATSAPP',
  'SMS',
  'BOTH',
]);

/**
 * Enum para status de mensagem
 */
export const messageStatusEnum = pgEnum('message_status', [
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
]);

/**
 * Enum para provedor WhatsApp
 */
export const whatsappProviderEnum = pgEnum('whatsapp_provider', [
  'META',
  'TWILIO',
  'ZENVIA',
  'ZAPI',
]);

/**
 * Enum para provedor SMS
 */
export const smsProviderEnum = pgEnum('sms_provider', [
  'TWILIO',
  'ZENVIA',
  'AWS_SNS',
]);

/**
 * Enum para status de mensagem agendada
 */
export const scheduledMessageStatusEnum = pgEnum('scheduled_message_status', [
  'PENDING',
  'SENT',
  'CANCELLED',
]);

/**
 * Tabela de templates de mensagens
 */
export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: messageTemplateTypeEnum('type').notNull(),
  channel: messageChannelEnum('channel').default('WHATSAPP').notNull(),
  subject: varchar('subject', { length: 255 }), // Para email futuro
  content: text('content').notNull(), // Com variáveis: {{nome}}, {{data}}, etc.
  isActive: boolean('is_active').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  triggerHoursBefore: integer('trigger_hours_before'), // Para lembretes automáticos
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de histórico de mensagens enviadas
 */
export const messageLogs = pgTable('message_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  templateId: uuid('template_id').references(() => messageTemplates.id),
  clientId: uuid('client_id').references(() => clients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  channel: messageChannelEnum('channel').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  content: text('content').notNull(),
  status: messageStatusEnum('status').default('PENDING').notNull(),
  externalId: varchar('external_id', { length: 255 }), // ID do provedor
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  cost: decimal('cost', { precision: 10, scale: 4 }), // Custo do SMS
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de configurações de automação por salão
 */
export const automationSettings = pgTable('automation_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),
  // WhatsApp
  whatsappEnabled: boolean('whatsapp_enabled').default(false).notNull(),
  whatsappProvider: whatsappProviderEnum('whatsapp_provider').default('META').notNull(),
  whatsappApiKey: text('whatsapp_api_key'), // Criptografado
  whatsappPhoneNumberId: varchar('whatsapp_phone_number_id', { length: 100 }),
  whatsappBusinessAccountId: varchar('whatsapp_business_account_id', { length: 100 }),
  // SMS
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  smsProvider: smsProviderEnum('sms_provider').default('TWILIO').notNull(),
  smsApiKey: text('sms_api_key'), // Criptografado
  smsAccountSid: varchar('sms_account_sid', { length: 100 }),
  smsPhoneNumber: varchar('sms_phone_number', { length: 20 }),
  // Lembretes
  reminderEnabled: boolean('reminder_enabled').default(true).notNull(),
  reminderHoursBefore: integer('reminder_hours_before').default(24).notNull(),
  // Confirmação
  confirmationEnabled: boolean('confirmation_enabled').default(true).notNull(),
  confirmationHoursBefore: integer('confirmation_hours_before').default(48).notNull(),
  // Aniversário
  birthdayEnabled: boolean('birthday_enabled').default(true).notNull(),
  birthdayTime: varchar('birthday_time', { length: 5 }).default('09:00').notNull(),
  birthdayDiscountPercent: integer('birthday_discount_percent'),
  // Review
  reviewRequestEnabled: boolean('review_request_enabled').default(false).notNull(),
  reviewRequestHoursAfter: integer('review_request_hours_after').default(2).notNull(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de mensagens agendadas
 */
export const scheduledMessages = pgTable('scheduled_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  templateId: uuid('template_id').references(() => messageTemplates.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  channel: messageChannelEnum('channel').notNull(),
  scheduledFor: timestamp('scheduled_for').notNull(),
  status: scheduledMessageStatusEnum('status').default('PENDING').notNull(),
  cancelledReason: text('cancelled_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== MÓDULO DE INTELIGÊNCIA DE PRODUTO ====================

/**
 * Enum para tipo de cabelo
 */
export const hairTypeEnum = pgEnum('hair_type', [
  'STRAIGHT',  // Liso
  'WAVY',      // Ondulado
  'CURLY',     // Cacheado
  'COILY',     // Crespo
]);

/**
 * Enum para espessura do fio
 */
export const hairThicknessEnum = pgEnum('hair_thickness', [
  'FINE',   // Fino
  'MEDIUM', // Médio
  'THICK',  // Grosso
]);

/**
 * Enum para comprimento
 */
export const hairLengthEnum = pgEnum('hair_length', [
  'SHORT',      // Curto
  'MEDIUM',     // Médio
  'LONG',       // Longo
  'EXTRA_LONG', // Extra longo
]);

/**
 * Enum para porosidade
 */
export const hairPorosityEnum = pgEnum('hair_porosity', [
  'LOW',    // Baixa
  'NORMAL', // Normal
  'HIGH',   // Alta
]);

/**
 * Enum para tipo de couro cabeludo
 */
export const scalpTypeEnum = pgEnum('scalp_type', [
  'NORMAL',    // Normal
  'OILY',      // Oleoso
  'DRY',       // Seco
  'SENSITIVE', // Sensível
]);

/**
 * Tabela de perfil capilar do cliente
 */
export const clientHairProfiles = pgTable('client_hair_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull().unique(),
  hairType: hairTypeEnum('hair_type'),
  hairThickness: hairThicknessEnum('hair_thickness'),
  hairLength: hairLengthEnum('hair_length'),
  hairPorosity: hairPorosityEnum('hair_porosity'),
  scalpType: scalpTypeEnum('scalp_type'),
  chemicalHistory: json('chemical_history').$type<string[]>().default([]),
  mainConcerns: json('main_concerns').$type<string[]>().default([]),
  allergies: text('allergies'),
  currentProducts: text('current_products'),
  notes: text('notes'),
  lastAssessmentDate: date('last_assessment_date'),
  lastAssessedById: uuid('last_assessed_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de regras de recomendação de produtos
 */
export const productRecommendationRules = pgTable('product_recommendation_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id), // null = regra global
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  conditions: json('conditions').$type<{
    hairTypes?: string[];
    hairThickness?: string[];
    hairLength?: string[];
    hairPorosity?: string[];
    scalpTypes?: string[];
    chemicalHistory?: string[];
    mainConcerns?: string[];
    logic?: 'AND' | 'OR';
  }>().notNull(),
  recommendedProducts: json('recommended_products').$type<Array<{
    productId: number;
    priority: number;
    reason: string;
  }>>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0).notNull(),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de log de recomendações
 */
export const productRecommendationsLog = pgTable('product_recommendations_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  commandId: uuid('command_id'),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  ruleId: uuid('rule_id').references(() => productRecommendationRules.id),
  productId: integer('product_id').references(() => products.id).notNull(),
  reason: text('reason'),
  wasAccepted: boolean('was_accepted'),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de múltiplos serviços por agendamento
 */
export const appointmentServices = pgTable('appointment_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  duration: integer('duration').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  order: integer('order').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de histórico de no-shows dos clientes
 */
export const clientNoShows = pgTable('client_no_shows', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  blocked: boolean('blocked').default(false).notNull(),
  blockedUntil: varchar('blocked_until', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


/**
 * Tabela de produtos (Estoque) - Com campos de inteligência de produto
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  // Estoques separados (PACOTE 1 - Estoque Moderno)
  stockRetail: integer('stock_retail').default(0).notNull(),
  stockInternal: integer('stock_internal').default(0).notNull(),
  minStockRetail: integer('min_stock_retail').default(0).notNull(),
  minStockInternal: integer('min_stock_internal').default(0).notNull(),
  unit: unitEnum('unit').default('UN').notNull(),
  active: boolean('active').default(true).notNull(),
  // Flags Retail/Backbar (indica onde o produto pode ser usado)
  isRetail: boolean('is_retail').default(true).notNull(),
  isBackbar: boolean('is_backbar').default(false).notNull(),
  // Campos de Inteligência de Produto
  hairTypes: json('hair_types').$type<string[]>().default([]), // Tipos de cabelo indicados
  concerns: json('concerns').$type<string[]>().default([]), // Problemas/necessidades que resolve
  contraindications: text('contraindications'), // Contraindicações
  ingredients: text('ingredients'), // Ingredientes principais
  howToUse: text('how_to_use'), // Modo de uso
  benefits: json('benefits').$type<string[]>().default([]), // Benefícios
  brand: varchar('brand', { length: 100 }), // Marca
  category: varchar('category', { length: 50 }), // Categoria do produto
  // Catálogo padrão do sistema (Alexis)
  catalogCode: varchar('catalog_code', { length: 100 }), // Código estável para produtos padrão (ex: 'REVELARIUM_EKO_VITALI')
  isSystemDefault: boolean('is_system_default').default(false).notNull(), // true = produto padrão do sistema
  alexisEnabled: boolean('alexis_enabled').default(true).notNull(), // Controle por salão: IA pode recomendar?
  alexisMeta: json('alexis_meta').$type<{
    summary?: string;
    indications?: string[];
    actives?: string[];
    benefits?: string[];
    howToUse?: string;
    precautions?: string;
    upsellHooks?: string[];
  }>(), // Metadados estruturados para Alexis
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Enum para tipo de ajuste de estoque (LEGADO - manter para compatibilidade)
 */
export const stockAdjustmentTypeEnum = pgEnum('stock_adjustment_type', ['IN', 'OUT']);

/**
 * Enum para localização do estoque (RETAIL = venda, INTERNAL = consumo interno)
 */
export const stockLocationTypeEnum = pgEnum('stock_location_type', ['RETAIL', 'INTERNAL']);

/**
 * Enum para tipo de movimento de estoque
 */
export const movementTypeEnum = pgEnum('movement_type', [
  'SALE',                // Venda para cliente
  'SERVICE_CONSUMPTION', // Consumo em serviço
  'PURCHASE',            // Compra/entrada
  'TRANSFER',            // Transferência entre locações
  'ADJUSTMENT',          // Ajuste manual
  'RETURN',              // Devolução
  'CANCELED',            // Cancelamento (estorno)
]);

/**
 * Tabela de Ajustes de Estoque (LEGADO - manter para compatibilidade)
 */
export const stockAdjustments = pgTable('stock_adjustments', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: stockAdjustmentTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Movimentos de Estoque (NOVO - substitui stockAdjustments)
 * Registra todas as movimentações de estoque com localização (RETAIL/INTERNAL)
 */
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  locationType: stockLocationTypeEnum('location_type').notNull(),
  delta: integer('delta').notNull(), // positivo = entrada, negativo = saída
  movementType: movementTypeEnum('movement_type').notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // 'command', 'appointment', 'purchase', etc.
  referenceId: uuid('reference_id'), // ID do registro relacionado
  transferGroupId: uuid('transfer_group_id'), // Agrupa transferências entre locações
  reason: text('reason'),
  createdByUserId: uuid('created_by_user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de transacoes (Fluxo de Caixa)
 */
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  date: timestamp('date').defaultNow().notNull(),
  description: text('description'),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  clientId: uuid('client_id').references(() => clients.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de contas a pagar
 */
export const accountsPayable = pgTable('accounts_payable', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  status: accountStatusEnum('status').default('PENDING').notNull(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de contas a receber (Fiado)
 */
export const accountsReceivable = pgTable('accounts_receivable', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  status: accountStatusEnum('status').default('PENDING').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de produtos consumidos em atendimentos (Custo Real)
 */
export const consumedProducts = pgTable('consumed_products', {
  id: serial('id').primaryKey(),
  appointmentId: uuid('appointment_id')
    .references(() => appointments.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  quantityUsed: decimal('quantity_used', { precision: 10, scale: 3 }).notNull(),
  costAtTime: decimal('cost_at_time', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de notificacoes do sistema
 */
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  referenceId: varchar('reference_id', { length: 100 }),
  referenceType: varchar('reference_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de pacotes (Fidelidade)
 */
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  servicesIncluded: json('services_included').$type<PackageServices>().notNull(),
  totalSessions: integer('total_sessions').notNull(),
  expirationDays: integer('expiration_days').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de pacotes adquiridos por clientes
 */
export const clientPackages = pgTable('client_packages', {
  id: serial('id').primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  packageId: integer('package_id')
    .references(() => packages.id)
    .notNull(),
  remainingSessions: integer('remaining_sessions').notNull(),
  purchaseDate: timestamp('purchase_date').defaultNow().notNull(),
  expirationDate: date('expiration_date').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de serviços incluídos em cada pacote
 * Define quais serviços e quantas sessões de cada o pacote oferece
 */
export const packageServices = pgTable('package_services', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  packageId: integer('package_id').references(() => packages.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  sessionsIncluded: integer('sessions_included').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de saldo de sessões por serviço do cliente
 * Rastreia quantas sessões de cada serviço o cliente ainda tem disponível
 */
export const clientPackageBalances = pgTable('client_package_balances', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientPackageId: integer('client_package_id').references(() => clientPackages.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  totalSessions: integer('total_sessions').notNull(),
  remainingSessions: integer('remaining_sessions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de histórico de uso de sessões (auditoria)
 * Registra cada uso de sessão do pacote, vinculado à comanda/item
 */
export const clientPackageUsages = pgTable('client_package_usages', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientPackageId: integer('client_package_id').references(() => clientPackages.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  commandId: uuid('command_id').references(() => commands.id),
  commandItemId: uuid('command_item_id').references(() => commandItems.id),
  professionalId: uuid('professional_id').references(() => users.id),
  status: varchar('status', { length: 20 }).default('CONSUMED').notNull(),
  consumedAt: timestamp('consumed_at').defaultNow().notNull(),
  revertedAt: timestamp('reverted_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueCommandItem: unique().on(table.salonId, table.commandItemId),
}));

/**
 * Tabela de logs de auditoria (Compliance e Rastreabilidade)
 * Estendida com campos adicionais para auditoria forense
 */
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  userId: uuid('user_id').references(() => users.id),
  userName: varchar('user_name', { length: 255 }),
  userRole: varchar('user_role', { length: 50 }),
  action: auditActionEnum('action').notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  oldValues: json('old_values').$type<Record<string, unknown>>(),
  newValues: json('new_values').$type<Record<string, unknown>>(),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

/**
 * Tabela de Refresh Tokens Invalidados (Blacklist para Logout)
 */
export const refreshTokenBlacklist = pgTable('refresh_token_blacklist', {
  id: serial('id').primaryKey(),
  token: text('token').notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Sessões de Suporte Delegado (SUPER_ADMIN)
 * Permite que administradores acessem temporariamente um salão específico
 * para suporte técnico, com auditoria completa.
 */
export const supportSessions = pgTable('support_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id').references(() => users.id).notNull(),
  targetSalonId: uuid('target_salon_id').references(() => salons.id).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, CONSUMED, EXPIRED, REVOKED
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Consumo de Produtos por Serviço (BOM - Bill of Materials)
 * Define quais produtos são consumidos automaticamente ao executar um serviço
 */
export const serviceConsumptions = pgTable('service_consumptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 5 }).default('UN').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =====================================================
// SISTEMA DE RECEITAS E CONSUMO AUTOMÁTICO
// =====================================================

/**
 * Enum para status da receita
 */
export const recipeStatusEnum = pgEnum('recipe_status', ['ACTIVE', 'ARCHIVED']);

/**
 * Enum para códigos de variação (Curto/Médio/Longo)
 */
export const variantCodeEnum = pgEnum('variant_code', [
  'DEFAULT',
  'SHORT',
  'MEDIUM',
  'LONG',
  'EXTRA_LONG',
  'CUSTOM',
]);

/**
 * Locais de estoque (flexível para múltiplos locais)
 */
export const inventoryLocations = pgTable('inventory_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  code: varchar('code', { length: 20 }).notNull(), // 'LOJA', 'SALAO', 'ALMOXARIFADO'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Receitas de serviços (cabeçalho com versionamento)
 * Cada serviço pode ter múltiplas versões de receita, apenas uma ACTIVE
 */
export const serviceRecipes = pgTable('service_recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  version: integer('version').default(1).notNull(),
  status: recipeStatusEnum('status').default('ACTIVE').notNull(),
  effectiveFrom: date('effective_from').defaultNow().notNull(),
  notes: text('notes'),

  // Precificação calculada
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  targetMarginPercent: decimal('target_margin_percent', { precision: 5, scale: 2 }).default('60'),

  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Linhas da receita (produtos e quantidades)
 * Cada linha representa um produto com quantidade padrão e buffer
 */
export const serviceRecipeLines = pgTable('service_recipe_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipeId: uuid('recipe_id').references(() => serviceRecipes.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  productGroupId: uuid('product_group_id'), // Para substituições futuras (referência será adicionada depois)
  quantityStandard: decimal('quantity_standard', { precision: 10, scale: 3 }).notNull(), // quantidade ideal
  quantityBuffer: decimal('quantity_buffer', { precision: 10, scale: 3 }).default('0').notNull(), // folga
  unit: varchar('unit', { length: 10 }).notNull(), // ML, G, UN
  isRequired: boolean('is_required').default(true).notNull(),
  notes: text('notes'), // "cabelo longo usa mais"
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Snapshot do consumo aplicado automaticamente (imutável, para auditoria)
 * Registra exatamente o que foi consumido em cada serviço de uma comanda
 */
export const commandConsumptionSnapshots = pgTable('command_consumption_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  commandId: uuid('command_id').references(() => commands.id).notNull(),
  commandItemId: uuid('command_item_id').references(() => commandItems.id).notNull(),

  // Referência da receita
  serviceId: integer('service_id').references(() => services.id).notNull(),
  recipeId: uuid('recipe_id').references(() => serviceRecipes.id),
  recipeVersion: integer('recipe_version'),
  variantCode: variantCodeEnum('variant_code').default('DEFAULT'),
  variantMultiplier: decimal('variant_multiplier', { precision: 3, scale: 2 }).default('1'),

  // Produto consumido (snapshot)
  productId: integer('product_id').references(() => products.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),

  // Quantidades
  quantityStandard: decimal('quantity_standard', { precision: 10, scale: 3 }).notNull(),
  quantityBuffer: decimal('quantity_buffer', { precision: 10, scale: 3 }).notNull(),
  quantityApplied: decimal('quantity_applied', { precision: 10, scale: 3 }).notNull(), // standard + buffer
  unit: varchar('unit', { length: 10 }).notNull(),

  // Custos
  costAtTime: decimal('cost_at_time', { precision: 10, scale: 2 }).notNull(), // custo unitário
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(), // qty * cost

  // Rastreabilidade
  stockMovementId: uuid('stock_movement_id').references(() => stockMovements.id),
  postedAt: timestamp('posted_at'), // quando baixou no estoque
  cancelledAt: timestamp('cancelled_at'),

  // PILAR 2: Idempotência
  dedupeKey: varchar('dedupe_key', { length: 255 }),  // commandItemId:productId:recipeVersion:variantCode

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Variações da receita (Curto/Médio/Longo)
 * Permite ajustar quantidades automaticamente por tamanho de cabelo
 */
export const recipeVariants = pgTable('recipe_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipeId: uuid('recipe_id').references(() => serviceRecipes.id, { onDelete: 'cascade' }).notNull(),
  code: variantCodeEnum('code').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  multiplier: decimal('multiplier', { precision: 3, scale: 2 }).default('1').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Grupos de produtos (para substituições)
 * Permite definir produtos alternativos para uma mesma linha de receita
 */
export const productGroups = pgTable('product_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Itens do grupo de produtos
 * Lista os produtos que fazem parte de um grupo de substituição
 */
export const productGroupItems = pgTable('product_group_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => productGroups.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  priority: integer('priority').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types inferidos do schema
export type Salon = typeof salons.$inferSelect;
export type NewSalon = typeof salons.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert;

// Tipos para o novo sistema de movimentos de estoque
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
export type LocationType = 'RETAIL' | 'INTERNAL';
export type MovementType = 'SALE' | 'SERVICE_CONSUMPTION' | 'PURCHASE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'CANCELED';
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type AccountPayable = typeof accountsPayable.$inferSelect;
export type NewAccountPayable = typeof accountsPayable.$inferInsert;
export type AccountReceivable = typeof accountsReceivable.$inferSelect;
export type NewAccountReceivable = typeof accountsReceivable.$inferInsert;
export type ConsumedProduct = typeof consumedProducts.$inferSelect;
export type NewConsumedProduct = typeof consumedProducts.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
export type ClientPackage = typeof clientPackages.$inferSelect;
export type NewClientPackage = typeof clientPackages.$inferInsert;
export type PackageService = typeof packageServices.$inferSelect;
export type NewPackageService = typeof packageServices.$inferInsert;
export type ClientPackageBalance = typeof clientPackageBalances.$inferSelect;
export type NewClientPackageBalance = typeof clientPackageBalances.$inferInsert;
export type ClientPackageUsage = typeof clientPackageUsages.$inferSelect;
export type NewClientPackageUsage = typeof clientPackageUsages.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type SupportSession = typeof supportSessions.$inferSelect;
export type NewSupportSession = typeof supportSessions.$inferInsert;
export type ServiceConsumption = typeof serviceConsumptions.$inferSelect;
export type NewServiceConsumption = typeof serviceConsumptions.$inferInsert;

// Types para Sistema de Assinaturas (Novo)
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type SalonSubscription = typeof salonSubscriptions.$inferSelect;
export type NewSalonSubscription = typeof salonSubscriptions.$inferInsert;
export type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
export type NewSubscriptionInvoice = typeof subscriptionInvoices.$inferInsert;
export type InvoicePayment = typeof invoicePayments.$inferSelect;
export type NewInvoicePayment = typeof invoicePayments.$inferInsert;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type NewSubscriptionEvent = typeof subscriptionEvents.$inferInsert;

// Types para Sistema de Assinaturas (Legado)
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type NewSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

// Types para Sistema de Agendamento v3.0
export type ProfessionalAvailability = typeof professionalAvailabilities.$inferSelect;
export type NewProfessionalAvailability = typeof professionalAvailabilities.$inferInsert;
export type ProfessionalBlock = typeof professionalBlocks.$inferSelect;
export type NewProfessionalBlock = typeof professionalBlocks.$inferInsert;
export type AppointmentService = typeof appointmentServices.$inferSelect;
export type NewAppointmentService = typeof appointmentServices.$inferInsert;
export type ClientNoShow = typeof clientNoShows.$inferSelect;
export type NewClientNoShow = typeof clientNoShows.$inferInsert;

// Types para Integração Google Calendar
export type GoogleIntegration = typeof googleIntegrations.$inferSelect;
export type NewGoogleIntegration = typeof googleIntegrations.$inferInsert;
export type GoogleSyncLog = typeof googleSyncLogs.$inferSelect;
export type NewGoogleSyncLog = typeof googleSyncLogs.$inferInsert;
export type GoogleEventConflict = typeof googleEventConflicts.$inferSelect;
export type NewGoogleEventConflict = typeof googleEventConflicts.$inferInsert;

// Types para Automação WhatsApp/SMS
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type NewMessageTemplate = typeof messageTemplates.$inferInsert;
export type MessageLog = typeof messageLogs.$inferSelect;
export type NewMessageLog = typeof messageLogs.$inferInsert;
export type AutomationSetting = typeof automationSettings.$inferSelect;
export type NewAutomationSetting = typeof automationSettings.$inferInsert;
export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type NewScheduledMessage = typeof scheduledMessages.$inferInsert;

// Types para Inteligência de Produto
export type ClientHairProfile = typeof clientHairProfiles.$inferSelect;
export type NewClientHairProfile = typeof clientHairProfiles.$inferInsert;
export type ProductRecommendationRule = typeof productRecommendationRules.$inferSelect;
export type NewProductRecommendationRule = typeof productRecommendationRules.$inferInsert;
export type ProductRecommendationLog = typeof productRecommendationsLog.$inferSelect;
export type NewProductRecommendationLog = typeof productRecommendationsLog.$inferInsert;

// Types para Sistema de Receitas e Consumo Automático
export type InventoryLocation = typeof inventoryLocations.$inferSelect;
export type NewInventoryLocation = typeof inventoryLocations.$inferInsert;
export type ServiceRecipe = typeof serviceRecipes.$inferSelect;
export type NewServiceRecipe = typeof serviceRecipes.$inferInsert;
export type ServiceRecipeLine = typeof serviceRecipeLines.$inferSelect;
export type NewServiceRecipeLine = typeof serviceRecipeLines.$inferInsert;
export type CommandConsumptionSnapshot = typeof commandConsumptionSnapshots.$inferSelect;
export type NewCommandConsumptionSnapshot = typeof commandConsumptionSnapshots.$inferInsert;
export type RecipeVariant = typeof recipeVariants.$inferSelect;
export type NewRecipeVariant = typeof recipeVariants.$inferInsert;
export type ProductGroup = typeof productGroups.$inferSelect;
export type NewProductGroup = typeof productGroups.$inferInsert;
export type ProductGroupItem = typeof productGroupItems.$inferSelect;
export type NewProductGroupItem = typeof productGroupItems.$inferInsert;
export type RecipeStatus = 'ACTIVE' | 'ARCHIVED';
export type VariantCode = 'DEFAULT' | 'SHORT' | 'MEDIUM' | 'LONG' | 'EXTRA_LONG' | 'CUSTOM';

/**
 * Enums para Comandas
 */
export const commandStatusEnum = pgEnum('command_status', [
  'OPEN',
  'IN_SERVICE', 
  'WAITING_PAYMENT',
  'CLOSED',
  'CANCELED'
]);

export const commandItemTypeEnum = pgEnum('command_item_type', ['SERVICE', 'PRODUCT']);

export const commandPaymentMethodEnum = pgEnum('command_payment_method', [
  'CASH',
  'CARD_CREDIT',
  'CARD_DEBIT',
  'PIX',
  'VOUCHER',
  'TRANSFER',
  'OTHER'
]);

export const commandEventTypeEnum = pgEnum('command_event_type', [
  'OPENED',
  'ITEM_ADDED',
  'ITEM_UPDATED',
  'ITEM_REMOVED',
  'DISCOUNT_APPLIED',
  'STATUS_CHANGED',
  'SERVICE_CLOSED',
  'CASHIER_CLOSED',
  'NOTE_ADDED',
  'PAYMENT_ADDED',
  'PAYMENT_REMOVED'
]);

/**
 * Tabela de Comandas
 */
export const commands = pgTable('commands', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  
  cardNumber: varchar('card_number', { length: 20 }).notNull(),
  code: varchar('code', { length: 50 }),
  
  status: varchar('status', { length: 20 }).default('OPEN').notNull(),
  
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  openedById: uuid('opened_by_id').references(() => users.id).notNull(),
  
  serviceClosedAt: timestamp('service_closed_at'),
  serviceClosedById: uuid('service_closed_by_id').references(() => users.id),
  
  cashierClosedAt: timestamp('cashier_closed_at'),
  cashierClosedById: uuid('cashier_closed_by_id').references(() => users.id),
  
  totalGross: decimal('total_gross', { precision: 10, scale: 2 }).default('0'),
  totalDiscounts: decimal('total_discounts', { precision: 10, scale: 2 }).default('0'),
  totalNet: decimal('total_net', { precision: 10, scale: 2 }).default('0'),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Itens da Comanda
 */
export const commandItems = pgTable('command_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  commandId: uuid('command_id').references(() => commands.id).notNull(),

  type: varchar('type', { length: 20 }).notNull(),
  referenceId: varchar('reference_id', { length: 50 }), // ID de serviço/produto (integer como string)
  description: text('description').notNull(),
  
  quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  
  performerId: uuid('performer_id').references(() => users.id),
  addedById: uuid('added_by_id').references(() => users.id).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),

  // Variação da receita (para serviços com tamanho de cabelo)
  variantId: uuid('variant_id').references(() => recipeVariants.id),

  // Package session consumption (when item is paid by package)
  clientPackageId: integer('client_package_id').references(() => clientPackages.id),
  clientPackageUsageId: integer('client_package_usage_id'), // FK managed at app level (avoids circular ref)
  paidByPackage: boolean('paid_by_package').default(false),

  canceledAt: timestamp('canceled_at'),
  canceledById: uuid('canceled_by_id').references(() => users.id),
  cancelReason: text('cancel_reason'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Pagamentos da Comanda
 */
export const commandPayments = pgTable('command_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  commandId: uuid('command_id').references(() => commands.id).notNull(),

  // Campos legados (mantidos para compatibilidade)
  method: varchar('method', { length: 30 }), // Agora opcional para novos pagamentos
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),

  // Novos campos para formas de pagamento configuráveis
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  paymentDestinationId: uuid('payment_destination_id').references(() => paymentDestinations.id),

  // Valores bruto, taxa e líquido
  grossAmount: decimal('gross_amount', { precision: 10, scale: 2 }),
  feeAmount: decimal('fee_amount', { precision: 10, scale: 2 }).default('0'),
  netAmount: decimal('net_amount', { precision: 10, scale: 2 }),

  receivedById: uuid('received_by_id').references(() => users.id).notNull(),
  paidAt: timestamp('paid_at').defaultNow().notNull(),

  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Eventos/Auditoria da Comanda
 */
export const commandEvents = pgTable('command_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  commandId: uuid('command_id').references(() => commands.id).notNull(),
  
  actorId: uuid('actor_id').references(() => users.id).notNull(),
  eventType: varchar('event_type', { length: 30 }).notNull(),
  
  metadata: json('metadata').$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Comandas
export type Command = typeof commands.$inferSelect;
export type NewCommand = typeof commands.$inferInsert;
export type CommandItem = typeof commandItems.$inferSelect;
export type NewCommandItem = typeof commandItems.$inferInsert;
export type CommandPayment = typeof commandPayments.$inferSelect;
export type NewCommandPayment = typeof commandPayments.$inferInsert;
export type CommandEvent = typeof commandEvents.$inferSelect;
export type NewCommandEvent = typeof commandEvents.$inferInsert;

// Types para Blacklist
export type RefreshTokenBlacklist = typeof refreshTokenBlacklist.$inferSelect;
export type NewRefreshTokenBlacklist = typeof refreshTokenBlacklist.$inferInsert;

/**
 * Enums para Formas de Pagamento Configuráveis
 */
export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
  'CASH',
  'PIX',
  'CARD_CREDIT',
  'CARD_DEBIT',
  'TRANSFER',
  'VOUCHER',
  'OTHER',
]);

export const paymentDestinationTypeEnum = pgEnum('payment_destination_type', [
  'BANK',
  'CARD_MACHINE',
  'CASH_DRAWER',
  'OTHER',
]);

export const feeTypeEnum = pgEnum('fee_type', ['DISCOUNT', 'FEE']);
export const feeModeEnum = pgEnum('fee_mode', ['PERCENT', 'FIXED']);

/**
 * Enums para Caixa
 */
export const cashRegisterStatusEnum = pgEnum('cash_register_status', ['OPEN', 'CLOSED']);
export const cashMovementTypeEnum = pgEnum('cash_movement_type', ['WITHDRAWAL', 'DEPOSIT']);

/**
 * Tabela de Caixas
 */
export const cashRegisters = pgTable('cash_registers', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  status: varchar('status', { length: 20 }).default('OPEN').notNull(),

  openingBalance: decimal('opening_balance', { precision: 10, scale: 2 }).default('0').notNull(),
  closingBalance: decimal('closing_balance', { precision: 10, scale: 2 }),
  expectedBalance: decimal('expected_balance', { precision: 10, scale: 2 }),
  difference: decimal('difference', { precision: 10, scale: 2 }),

  totalSales: decimal('total_sales', { precision: 10, scale: 2 }).default('0').notNull(),
  totalCash: decimal('total_cash', { precision: 10, scale: 2 }).default('0').notNull(),
  totalCard: decimal('total_card', { precision: 10, scale: 2 }).default('0').notNull(),
  totalPix: decimal('total_pix', { precision: 10, scale: 2 }).default('0').notNull(),
  totalWithdrawals: decimal('total_withdrawals', { precision: 10, scale: 2 }).default('0').notNull(),
  totalDeposits: decimal('total_deposits', { precision: 10, scale: 2 }).default('0').notNull(),

  openedAt: timestamp('opened_at').defaultNow().notNull(),
  openedById: uuid('opened_by_id').references(() => users.id).notNull(),

  closedAt: timestamp('closed_at'),
  closedById: uuid('closed_by_id').references(() => users.id),

  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Movimentos do Caixa (Sangrias e Suprimentos)
 */
export const cashMovements = pgTable('cash_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  cashRegisterId: uuid('cash_register_id').references(() => cashRegisters.id).notNull(),

  type: varchar('type', { length: 20 }).notNull(), // WITHDRAWAL ou DEPOSIT
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),

  performedById: uuid('performed_by_id').references(() => users.id).notNull(),
  performedAt: timestamp('performed_at').defaultNow().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Caixa
export type CashRegister = typeof cashRegisters.$inferSelect;
export type NewCashRegister = typeof cashRegisters.$inferInsert;
export type CashMovement = typeof cashMovements.$inferSelect;
export type NewCashMovement = typeof cashMovements.$inferInsert;

/**
 * Tabela de Formas de Pagamento Configuráveis
 */
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // CASH, PIX, CARD_CREDIT, CARD_DEBIT, TRANSFER, VOUCHER, OTHER

  // Regra de taxa/desconto
  feeType: varchar('fee_type', { length: 20 }), // DISCOUNT ou FEE
  feeMode: varchar('fee_mode', { length: 20 }), // PERCENT ou FIXED
  feeValue: decimal('fee_value', { precision: 10, scale: 2 }).default('0'),

  sortOrder: integer('sort_order').default(0),
  active: boolean('active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Destinos do Dinheiro
 */
export const paymentDestinations = pgTable('payment_destinations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // BANK, CARD_MACHINE, CASH_DRAWER, OTHER

  // Metadados opcionais
  bankName: varchar('bank_name', { length: 100 }),
  lastDigits: varchar('last_digits', { length: 10 }),
  description: text('description'),

  // Regra adicional de taxa (opcional, sobrescreve método)
  feeType: varchar('fee_type', { length: 20 }),
  feeMode: varchar('fee_mode', { length: 20 }),
  feeValue: decimal('fee_value', { precision: 10, scale: 2 }).default('0'),

  sortOrder: integer('sort_order').default(0),
  active: boolean('active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types para Formas de Pagamento e Destinos
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type PaymentDestination = typeof paymentDestinations.$inferSelect;
export type NewPaymentDestination = typeof paymentDestinations.$inferInsert;

/**
 * Enum para status de comissao
 */
export const commissionStatusEnum = pgEnum('commission_status', ['PENDING', 'PAID', 'CANCELLED']);

/**
 * Tabela de Comissoes
 */
export const commissions = pgTable('commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  commandId: uuid('command_id').references(() => commands.id).notNull(),
  commandItemId: uuid('command_item_id').references(() => commandItems.id).notNull(),
  professionalId: uuid('professional_id').references(() => users.id).notNull(),

  itemDescription: varchar('item_description', { length: 255 }).notNull(),
  itemValue: decimal('item_value', { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal('commission_percentage', { precision: 5, scale: 2 }).notNull(),
  commissionValue: decimal('commission_value', { precision: 10, scale: 2 }).notNull(),

  status: varchar('status', { length: 20 }).default('PENDING').notNull(),

  paidAt: timestamp('paid_at'),
  paidById: uuid('paid_by_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types para Comissoes
export type Commission = typeof commissions.$inferSelect;
export type NewCommission = typeof commissions.$inferInsert;

// ==================== MÓDULO DE FIDELIDADE & GAMIFICAÇÃO ====================

/**
 * Enum para tipo de transação de fidelidade
 */
export const loyaltyTransactionTypeEnum = pgEnum('loyalty_transaction_type', [
  'EARN',
  'REDEEM',
  'EXPIRE',
  'ADJUST',
  'BONUS',
  'REFERRAL',
  'BIRTHDAY',
  'WELCOME',
]);

/**
 * Enum para tipo de recompensa
 */
export const rewardTypeEnum = pgEnum('reward_type', [
  'DISCOUNT_VALUE',
  'DISCOUNT_PERCENT',
  'FREE_SERVICE',
  'FREE_PRODUCT',
  'GIFT',
]);

/**
 * Enum para status de resgate
 */
export const redemptionStatusEnum = pgEnum('redemption_status', [
  'PENDING',
  'USED',
  'EXPIRED',
  'CANCELLED',
]);

/**
 * Enum para tipo de evento de marketing
 */
export const marketingEventTypeEnum = pgEnum('marketing_event_type', [
  'POINTS_EARNED',
  'POINTS_REDEEMED',
  'TIER_UPGRADED',
  'REWARD_CLAIMED',
  'REFERRAL_SIGNUP',
  'REFERRAL_CONVERTED',
  'CAMPAIGN_CLICK',
  'CAMPAIGN_CONVERSION',
]);

/**
 * Tabela de Programas de Fidelidade
 */
export const loyaltyPrograms = pgTable('loyalty_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),
  name: varchar('name', { length: 100 }).default('Programa de Fidelidade').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  pointsPerRealService: decimal('points_per_real_service', { precision: 5, scale: 2 }).default('1').notNull(),
  pointsPerRealProduct: decimal('points_per_real_product', { precision: 5, scale: 2 }).default('1').notNull(),
  pointsExpireDays: integer('points_expire_days'), // null = não expira
  minimumRedeemPoints: integer('minimum_redeem_points').default(100).notNull(),
  welcomePoints: integer('welcome_points').default(0).notNull(),
  birthdayPoints: integer('birthday_points').default(0).notNull(),
  referralPoints: integer('referral_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Níveis do Programa de Fidelidade
 */
export const loyaltyTiers = pgTable('loyalty_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').references(() => loyaltyPrograms.id).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  minPoints: integer('min_points').default(0).notNull(),
  color: varchar('color', { length: 20 }).default('#6B7280').notNull(),
  icon: varchar('icon', { length: 50 }),
  benefits: json('benefits').$type<{
    discountPercent?: number;
    priorityBooking?: boolean;
    freeServices?: string[];
    extraBenefits?: string;
  }>().default({}),
  pointsMultiplier: decimal('points_multiplier', { precision: 3, scale: 2 }).default('1').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Recompensas Disponíveis
 */
export const loyaltyRewards = pgTable('loyalty_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  programId: uuid('program_id').references(() => loyaltyPrograms.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 30 }).notNull(), // DISCOUNT_VALUE, DISCOUNT_PERCENT, FREE_SERVICE, FREE_PRODUCT, GIFT
  pointsCost: integer('points_cost').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }), // valor do desconto ou produto
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  minTier: varchar('min_tier', { length: 20 }), // nível mínimo para resgatar
  maxRedemptionsPerClient: integer('max_redemptions_per_client'),
  totalAvailable: integer('total_available'), // estoque de recompensas
  validDays: integer('valid_days').default(30).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Contas de Fidelidade dos Clientes
 */
export const clientLoyaltyAccounts = pgTable('client_loyalty_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull().unique(),
  programId: uuid('program_id').references(() => loyaltyPrograms.id).notNull(),
  currentPoints: integer('current_points').default(0).notNull(),
  totalPointsEarned: integer('total_points_earned').default(0).notNull(),
  totalPointsRedeemed: integer('total_points_redeemed').default(0).notNull(),
  currentTierId: uuid('current_tier_id').references(() => loyaltyTiers.id),
  tierAchievedAt: timestamp('tier_achieved_at'),
  nextTierProgress: integer('next_tier_progress').default(0).notNull(),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  referredById: uuid('referred_by_id').references(() => clients.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de Transações de Fidelidade
 */
export const loyaltyTransactions = pgTable('loyalty_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => clientLoyaltyAccounts.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // EARN, REDEEM, EXPIRE, ADJUST, BONUS, REFERRAL
  points: integer('points').notNull(), // positivo para ganho, negativo para gasto
  balance: integer('balance').notNull(), // saldo após transação
  description: varchar('description', { length: 255 }).notNull(),
  commandId: uuid('command_id').references(() => commands.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  rewardId: uuid('reward_id').references(() => loyaltyRewards.id),
  expiresAt: timestamp('expires_at'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Resgates de Recompensas
 */
export const loyaltyRedemptions = pgTable('loyalty_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').references(() => clientLoyaltyAccounts.id).notNull(),
  rewardId: uuid('reward_id').references(() => loyaltyRewards.id).notNull(),
  transactionId: uuid('transaction_id').references(() => loyaltyTransactions.id).notNull(),
  pointsSpent: integer('points_spent').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(), // PENDING, USED, EXPIRED, CANCELLED
  code: varchar('code', { length: 20 }).notNull().unique(), // código do voucher gerado
  usedAt: timestamp('used_at'),
  usedInCommandId: uuid('used_in_command_id').references(() => commands.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de Eventos de Marketing
 */
export const marketingEvents = pgTable('marketing_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  type: varchar('type', { length: 30 }).notNull(),
  context: json('context').$type<Record<string, unknown>>().default({}),
  value: decimal('value', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Fidelidade
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type NewLoyaltyProgram = typeof loyaltyPrograms.$inferInsert;
export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type NewLoyaltyTier = typeof loyaltyTiers.$inferInsert;
export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type NewLoyaltyReward = typeof loyaltyRewards.$inferInsert;
export type ClientLoyaltyAccount = typeof clientLoyaltyAccounts.$inferSelect;
export type NewClientLoyaltyAccount = typeof clientLoyaltyAccounts.$inferInsert;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
export type LoyaltyRedemption = typeof loyaltyRedemptions.$inferSelect;
export type NewLoyaltyRedemption = typeof loyaltyRedemptions.$inferInsert;
export type MarketingEvent = typeof marketingEvents.$inferSelect;
export type NewMarketingEvent = typeof marketingEvents.$inferInsert;

// ==================== PRODUCT SUBSCRIPTIONS ====================

// Enum para frequência de assinatura de produto
export const productSubscriptionFrequencyEnum = pgEnum('product_subscription_frequency', [
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
]);

// Enum para status da assinatura de produto
export const productSubscriptionStatusEnum = pgEnum('product_subscription_status', [
  'ACTIVE',
  'PAUSED',
  'CANCELLED',
  'EXPIRED',
]);

// Enum para tipo de entrega
export const deliveryTypeEnum = pgEnum('delivery_type', [
  'PICKUP',
  'DELIVERY',
]);

// Enum para status da entrega
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'PENDING',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
]);

// Enum para método de pagamento de assinatura
export const subscriptionPaymentMethodEnum = pgEnum('subscription_payment_method', [
  'PIX',
  'CARD',
  'CASH_ON_DELIVERY',
]);

// Planos de assinatura de produtos
export const productSubscriptionPlans = pgTable('product_subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  billingPeriod: varchar('billing_period', { length: 20 }).notNull().default('MONTHLY'),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  maxSubscribers: integer('max_subscribers'),
  currentSubscribers: integer('current_subscribers').default(0),
  imageUrl: varchar('image_url', { length: 500 }),
  benefits: json('benefits').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Itens do plano de assinatura
export const productSubscriptionItems = pgTable('product_subscription_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => productSubscriptionPlans.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Assinaturas de clientes
export const clientProductSubscriptions = pgTable('client_product_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  planId: uuid('plan_id').references(() => productSubscriptionPlans.id).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  deliveryType: varchar('delivery_type', { length: 20 }).default('PICKUP'),
  deliveryAddress: text('delivery_address'),
  startDate: date('start_date').notNull(),
  nextDeliveryDate: date('next_delivery_date').notNull(),
  lastDeliveryDate: date('last_delivery_date'),
  totalDeliveries: integer('total_deliveries').default(0),
  paymentMethod: varchar('payment_method', { length: 20 }).default('PIX'),
  mercadoPagoSubscriptionId: varchar('mercado_pago_subscription_id', { length: 255 }),
  notes: text('notes'),
  pausedAt: timestamp('paused_at'),
  pauseReason: text('pause_reason'),
  cancelledAt: timestamp('cancelled_at'),
  cancelReason: text('cancel_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Entregas de assinaturas
export const subscriptionDeliveries = pgTable('subscription_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => clientProductSubscriptions.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  deliveredDate: date('delivered_date'),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  deliveryType: varchar('delivery_type', { length: 20 }).notNull(),
  commandId: uuid('command_id').references(() => commands.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  preparedById: uuid('prepared_by_id').references(() => users.id),
  deliveredById: uuid('delivered_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Itens da entrega
export const subscriptionDeliveryItems = pgTable('subscription_delivery_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  deliveryId: uuid('delivery_id').references(() => subscriptionDeliveries.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Product Subscriptions
export type ProductSubscriptionPlan = typeof productSubscriptionPlans.$inferSelect;
export type NewProductSubscriptionPlan = typeof productSubscriptionPlans.$inferInsert;
export type ProductSubscriptionItem = typeof productSubscriptionItems.$inferSelect;
export type NewProductSubscriptionItem = typeof productSubscriptionItems.$inferInsert;
export type ClientProductSubscription = typeof clientProductSubscriptions.$inferSelect;
export type NewClientProductSubscription = typeof clientProductSubscriptions.$inferInsert;
export type SubscriptionDelivery = typeof subscriptionDeliveries.$inferSelect;
export type NewSubscriptionDelivery = typeof subscriptionDeliveries.$inferInsert;
export type SubscriptionDeliveryItem = typeof subscriptionDeliveryItems.$inferSelect;
export type NewSubscriptionDeliveryItem = typeof subscriptionDeliveryItems.$inferInsert;

// ==================== FASE D: UPSELL & COMÉRCIO CONVERSACIONAL ====================

// Enum para tipo de gatilho de upsell
export const upsellTriggerTypeEnum = pgEnum('upsell_trigger_type', [
  'SERVICE',
  'PRODUCT',
  'HAIR_PROFILE',
  'APPOINTMENT',
]);

// Enum para status da oferta de upsell
export const upsellOfferStatusEnum = pgEnum('upsell_offer_status', [
  'SHOWN',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
]);

// Enum para status do link de carrinho
export const cartLinkStatusEnum = pgEnum('cart_link_status', [
  'ACTIVE',
  'CONVERTED',
  'EXPIRED',
  'CANCELLED',
]);

// Enum para origem do link
export const cartLinkSourceEnum = pgEnum('cart_link_source', [
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'MANUAL',
]);

// Enum para status da reserva
export const reservationStatusEnum = pgEnum('reservation_status', [
  'PENDING',
  'CONFIRMED',
  'READY',
  'DELIVERED',
  'CANCELLED',
]);

// Enum para tipo de entrega da reserva
export const reservationDeliveryTypeEnum = pgEnum('reservation_delivery_type', [
  'PICKUP',
  'DELIVERY',
]);

// Enum para status do teste A/B
export const abTestStatusEnum = pgEnum('ab_test_status', [
  'DRAFT',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
]);

// Enum para tipo do teste A/B
export const abTestTypeEnum = pgEnum('ab_test_type', [
  'MESSAGE',
  'OFFER',
  'DISCOUNT',
  'TIMING',
]);

// Regras de Upsell
export const upsellRules = pgTable('upsell_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  triggerType: varchar('trigger_type', { length: 20 }).notNull(),
  triggerServiceIds: json('trigger_service_ids').$type<number[]>().default([]),
  triggerProductIds: json('trigger_product_ids').$type<number[]>().default([]),
  triggerHairTypes: json('trigger_hair_types').$type<string[]>().default([]),
  recommendedProducts: json('recommended_products').$type<{ productId: number; discount: number; reason: string }[]>().default([]),
  recommendedServices: json('recommended_services').$type<{ serviceId: number; discount: number; reason: string }[]>().default([]),
  displayMessage: text('display_message'),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  validFrom: date('valid_from'),
  validUntil: date('valid_until'),
  maxUsesTotal: integer('max_uses_total'),
  maxUsesPerClient: integer('max_uses_per_client'),
  currentUses: integer('current_uses').default(0),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ofertas de Upsell mostradas
export const upsellOffers = pgTable('upsell_offers', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  ruleId: uuid('rule_id').references(() => upsellRules.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  commandId: uuid('command_id').references(() => commands.id),
  status: varchar('status', { length: 20 }).notNull().default('SHOWN'),
  offeredProducts: json('offered_products').$type<{ productId: number; name: string; originalPrice: number; discountedPrice: number }[]>().default([]),
  offeredServices: json('offered_services').$type<{ serviceId: number; name: string; originalPrice: number; discountedPrice: number }[]>().default([]),
  totalOriginalPrice: decimal('total_original_price', { precision: 10, scale: 2 }).notNull(),
  totalDiscountedPrice: decimal('total_discounted_price', { precision: 10, scale: 2 }).notNull(),
  acceptedAt: timestamp('accepted_at'),
  declinedAt: timestamp('declined_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Links de Pré-carrinho
export const cartLinks = pgTable('cart_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  clientId: uuid('client_id').references(() => clients.id),
  clientPhone: varchar('client_phone', { length: 20 }),
  clientName: varchar('client_name', { length: 255 }),
  items: json('items').$type<{ type: 'PRODUCT' | 'SERVICE'; id: number; name: string; quantity: number; price: number; discount: number }[]>().default([]),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  message: text('message'),
  expiresAt: timestamp('expires_at').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  convertedAt: timestamp('converted_at'),
  convertedCommandId: uuid('converted_command_id').references(() => commands.id),
  source: varchar('source', { length: 20 }).default('MANUAL'),
  campaignId: uuid('campaign_id'),
  viewCount: integer('view_count').default(0),
  lastViewedAt: timestamp('last_viewed_at'),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Visualizações dos Links
export const cartLinkViews = pgTable('cart_link_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartLinkId: uuid('cart_link_id').references(() => cartLinks.id).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  convertedToReservation: boolean('converted_to_reservation').default(false),
});

// Reservas de Produtos
export const productReservations = pgTable('product_reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  cartLinkId: uuid('cart_link_id').references(() => cartLinks.id),
  items: json('items').$type<{ productId: number; name: string; quantity: number; price: number }[]>().default([]),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  deliveryType: varchar('delivery_type', { length: 20 }).default('PICKUP'),
  deliveryAddress: text('delivery_address'),
  scheduledPickupDate: date('scheduled_pickup_date'),
  notes: text('notes'),
  confirmedAt: timestamp('confirmed_at'),
  confirmedById: uuid('confirmed_by_id').references(() => users.id),
  readyAt: timestamp('ready_at'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Testes A/B
export const abTests = pgTable('ab_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
  variantA: json('variant_a').$type<{ message?: string; discount?: number; timing?: string; offer?: any }>().default({}),
  variantB: json('variant_b').$type<{ message?: string; discount?: number; timing?: string; offer?: any }>().default({}),
  variantAViews: integer('variant_a_views').default(0),
  variantAConversions: integer('variant_a_conversions').default(0),
  variantBViews: integer('variant_b_views').default(0),
  variantBConversions: integer('variant_b_conversions').default(0),
  winningVariant: varchar('winning_variant', { length: 1 }),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Atribuições de Teste A/B
export const abTestAssignments = pgTable('ab_test_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  testId: uuid('test_id').references(() => abTests.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  clientPhone: varchar('client_phone', { length: 20 }),
  variant: varchar('variant', { length: 1 }).notNull(),
  converted: boolean('converted').default(false),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== FASE E: IA ASSISTENTE ====================

// Insights gerados pela IA
export const aiInsights = pgTable('ai_insights', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // DAILY_BRIEFING, ALERT, OPPORTUNITY, TASK, TIP, CLIENT_INSIGHT
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  priority: varchar('priority', { length: 10 }).notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  category: varchar('category', { length: 20 }).notNull().default('GENERAL'), // SALES, CLIENTS, INVENTORY, TEAM, FINANCE, SCHEDULE
  data: json('data').$type<Record<string, any>>(),
  actionUrl: varchar('action_url', { length: 255 }),
  actionLabel: varchar('action_label', { length: 100 }),
  isRead: boolean('is_read').default(false),
  isDismissed: boolean('is_dismissed').default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== BELLE - IA DO DASHBOARD ====================

// Conversas com a Belle (chat do dashboard)
export const dashboardConversations = pgTable('dashboard_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 10 }).notNull(), // user, assistant
  content: text('content').notNull(),
  context: json('context').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Configurações da Belle por salão
export const dashboardSettings = pgTable('dashboard_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),
  isEnabled: boolean('is_enabled').default(true),
  assistantName: varchar('assistant_name', { length: 50 }).default('Belle'),
  personality: varchar('personality', { length: 20 }).default('FRIENDLY'), // FRIENDLY, PROFESSIONAL, CASUAL
  dailyBriefingEnabled: boolean('daily_briefing_enabled').default(true),
  dailyBriefingTime: varchar('daily_briefing_time', { length: 5 }).default('08:00'),
  alertsEnabled: boolean('alerts_enabled').default(true),
  tipsEnabled: boolean('tips_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types para Belle
export type DashboardConversation = typeof dashboardConversations.$inferSelect;
export type NewDashboardConversation = typeof dashboardConversations.$inferInsert;
export type DashboardSettings = typeof dashboardSettings.$inferSelect;
export type NewDashboardSettings = typeof dashboardSettings.$inferInsert;

// Notas sobre clientes geradas/assistidas pela IA
export const clientNotesAi = pgTable('client_notes_ai', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  noteType: varchar('note_type', { length: 20 }).notNull(), // PREFERENCE, ALLERGY, PERSONALITY, IMPORTANT
  content: text('content').notNull(),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types para FASE D
export type UpsellRule = typeof upsellRules.$inferSelect;
export type NewUpsellRule = typeof upsellRules.$inferInsert;
export type UpsellOffer = typeof upsellOffers.$inferSelect;
export type NewUpsellOffer = typeof upsellOffers.$inferInsert;
export type CartLink = typeof cartLinks.$inferSelect;
export type NewCartLink = typeof cartLinks.$inferInsert;
export type CartLinkView = typeof cartLinkViews.$inferSelect;
export type NewCartLinkView = typeof cartLinkViews.$inferInsert;
export type ProductReservation = typeof productReservations.$inferSelect;
export type NewProductReservation = typeof productReservations.$inferInsert;
export type ABTest = typeof abTests.$inferSelect;
export type NewABTest = typeof abTests.$inferInsert;
export type ABTestAssignment = typeof abTestAssignments.$inferSelect;
export type NewABTestAssignment = typeof abTestAssignments.$inferInsert;

// Types para FASE E (IA)
export type AIInsight = typeof aiInsights.$inferSelect;
export type NewAIInsight = typeof aiInsights.$inferInsert;
export type AIConversation = typeof aiConversations.$inferSelect;
export type NewAIConversation = typeof aiConversations.$inferInsert;
export type AISettings = typeof aiSettings.$inferSelect;
export type NewAISettings = typeof aiSettings.$inferInsert;
export type ClientNoteAi = typeof clientNotesAi.$inferSelect;
export type NewClientNoteAi = typeof clientNotesAi.$inferInsert;

// ==================== ALEXIS - IA PARA WHATSAPP & DASHBOARD ====================

// Enum para status da sessão ALEXIS
export const alexisSessionStatusEnum = pgEnum('alexis_session_status', [
  'ACTIVE',
  'HUMAN_CONTROL',
  'PAUSED',
  'ENDED',
]);

// Enum para modo de controle
export const alexisControlModeEnum = pgEnum('alexis_control_mode', [
  'AI',       // ALEXIS respondendo
  'HUMAN',    // Humano respondendo (#eu)
  'HYBRID',   // Colaborativo
]);

// Enum para tipo de mensagem ALEXIS
export const alexisMessageTypeEnum = pgEnum('alexis_message_type', [
  'TEXT',
  'AUDIO',
  'IMAGE',
  'DOCUMENT',
  'LOCATION',
  'CONTACT',
  'TEMPLATE',
]);

// Enum para direção da mensagem
export const alexisMessageDirectionEnum = pgEnum('alexis_message_direction', [
  'INBOUND',   // Cliente -> Salão
  'OUTBOUND',  // Salão -> Cliente
]);

// Enum para nível de risco de compliance
export const alexisComplianceRiskEnum = pgEnum('alexis_compliance_risk', [
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'BLOCKED',
]);

// Enum para tipo de violação
export const alexisViolationTypeEnum = pgEnum('alexis_violation_type', [
  'MEDICAL_ADVICE',      // Conselho médico (ANVISA)
  'PRESCRIPTION',        // Prescrição medicamentosa
  'HEALTH_CLAIM',        // Alegações de saúde não autorizadas
  'PERSONAL_DATA',       // Vazamento de dados pessoais (LGPD)
  'UNAUTHORIZED_SHARE',  // Compartilhamento não autorizado
  'PROFANITY',           // Linguagem imprópria
  'DISCRIMINATION',      // Discriminação
  'SPAM',                // Spam/Marketing agressivo
]);

// Configurações do ALEXIS por salão
export const alexisSettings = pgTable('alexis_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),
  isEnabled: boolean('is_enabled').default(true),
  assistantName: varchar('assistant_name', { length: 50 }).default('ALEXIS'),
  welcomeMessage: text('welcome_message').default('Olá! Sou ALEXIS, assistente virtual do salão. Como posso ajudar?'),
  personality: varchar('personality', { length: 20 }).default('PROFESSIONAL'),
  language: varchar('language', { length: 10 }).default('pt-BR'),

  // Compliance ANVISA/LGPD
  complianceLevel: varchar('compliance_level', { length: 10 }).default('STRICT'), // STRICT, MODERATE, RELAXED
  anvisaWarningsEnabled: boolean('anvisa_warnings_enabled').default(true),
  lgpdConsentRequired: boolean('lgpd_consent_required').default(true),
  dataRetentionDays: integer('data_retention_days').default(365),

  // Controle de IA
  autoResponseEnabled: boolean('auto_response_enabled').default(true),
  maxResponsesPerMinute: integer('max_responses_per_minute').default(10),
  humanTakeoverKeywords: json('human_takeover_keywords').$type<string[]>().default(['#eu', 'falar com humano', 'atendente']),
  aiResumeKeywords: json('ai_resume_keywords').$type<string[]>().default(['#ia', 'voltar alexis', 'voltar robô']),

  // Horários de atendimento
  operatingHoursEnabled: boolean('operating_hours_enabled').default(false),
  operatingHoursStart: varchar('operating_hours_start', { length: 5 }).default('08:00'),
  operatingHoursEnd: varchar('operating_hours_end', { length: 5 }).default('20:00'),
  outOfHoursMessage: text('out_of_hours_message').default('Estamos fora do horário de atendimento. Retornaremos em breve!'),

  // Integrações
  whatsappIntegrationId: varchar('whatsapp_integration_id', { length: 255 }),
  webhookUrl: varchar('webhook_url', { length: 500 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessões de conversa ALEXIS
export const alexisSessions = pgTable('alexis_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  clientName: varchar('client_name', { length: 255 }),

  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  controlMode: varchar('control_mode', { length: 10 }).notNull().default('AI'),

  // Consentimento LGPD
  lgpdConsentGiven: boolean('lgpd_consent_given').default(false),
  lgpdConsentAt: timestamp('lgpd_consent_at'),

  // Contexto da conversa
  context: json('context').$type<{
    currentIntent?: string;
    lastService?: string;
    appointmentInProgress?: boolean;
    clientPreferences?: Record<string, any>;
  }>().default({}),

  // Métricas
  messageCount: integer('message_count').default(0),
  aiResponseCount: integer('ai_response_count').default(0),
  humanResponseCount: integer('human_response_count').default(0),

  // Controle
  lastMessageAt: timestamp('last_message_at'),
  humanTakeoverAt: timestamp('human_takeover_at'),
  humanTakeoverById: uuid('human_takeover_by_id').references(() => users.id),

  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mensagens ALEXIS
export const alexisMessages = pgTable('alexis_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => alexisSessions.id).notNull(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  direction: varchar('direction', { length: 10 }).notNull(), // INBOUND, OUTBOUND
  messageType: varchar('message_type', { length: 20 }).notNull().default('TEXT'),
  content: text('content').notNull(),
  mediaUrl: varchar('media_url', { length: 500 }),

  // Quem respondeu
  respondedBy: varchar('responded_by', { length: 10 }).notNull(), // AI, HUMAN
  respondedById: uuid('responded_by_id').references(() => users.id),

  // Compliance - 3 camadas
  preProcessingCheck: json('pre_processing_check').$type<{
    passed: boolean;
    blockedKeywords?: string[];
    lgpdCheck?: boolean;
    timestamp: string;
  }>(),

  aiProcessingCheck: json('ai_processing_check').$type<{
    passed: boolean;
    confidenceScore?: number;
    intentDetected?: string;
    flaggedContent?: string[];
    timestamp: string;
  }>(),

  postProcessingCheck: json('post_processing_check').$type<{
    passed: boolean;
    sanitizedContent?: string;
    complianceReview?: boolean;
    timestamp: string;
  }>(),

  complianceRisk: varchar('compliance_risk', { length: 10 }).default('NONE'),

  // WhatsApp metadata
  whatsappMessageId: varchar('whatsapp_message_id', { length: 100 }),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Logs de compliance ALEXIS
export const alexisComplianceLogs = pgTable('alexis_compliance_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  sessionId: uuid('session_id').references(() => alexisSessions.id),
  messageId: uuid('message_id').references(() => alexisMessages.id),

  violationType: varchar('violation_type', { length: 30 }).notNull(),
  riskLevel: varchar('risk_level', { length: 10 }).notNull(),

  originalContent: text('original_content').notNull(),
  sanitizedContent: text('sanitized_content'),

  detectionLayer: varchar('detection_layer', { length: 20 }).notNull(), // PRE, DURING, POST
  action: varchar('action', { length: 20 }).notNull(), // BLOCKED, FLAGGED, SANITIZED, ALLOWED

  details: json('details').$type<{
    matchedPatterns?: string[];
    anvisaCode?: string;
    lgpdArticle?: string;
    recommendation?: string;
  }>(),

  reviewedById: uuid('reviewed_by_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Takeovers humanos
export const alexisHumanTakeovers = pgTable('alexis_human_takeovers', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  sessionId: uuid('session_id').references(() => alexisSessions.id).notNull(),

  takenOverById: uuid('taken_over_by_id').references(() => users.id).notNull(),
  reason: varchar('reason', { length: 50 }).notNull(), // COMMAND, KEYWORD, MANUAL, ESCALATION

  triggerMessage: text('trigger_message'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),

  // Resumo do atendimento humano
  messagesDuringTakeover: integer('messages_during_takeover').default(0),
  resolution: text('resolution'),
  returnedToAi: boolean('returned_to_ai').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Palavras-chave bloqueadas (ANVISA/LGPD)
export const alexisBlockedKeywords = pgTable('alexis_blocked_keywords', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id), // null = global

  keyword: varchar('keyword', { length: 100 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(), // ANVISA, LGPD, PROFANITY, CUSTOM
  violationType: varchar('violation_type', { length: 30 }).notNull(),

  severity: varchar('severity', { length: 10 }).notNull().default('HIGH'), // LOW, MEDIUM, HIGH, CRITICAL
  action: varchar('action', { length: 20 }).notNull().default('BLOCK'), // BLOCK, WARN, FLAG, SANITIZE

  replacement: text('replacement'), // Texto de substituição se action = SANITIZE
  warningMessage: text('warning_message'),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Templates de respostas ALEXIS
export const alexisResponseTemplates = pgTable('alexis_response_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 30 }).notNull(), // GREETING, SCHEDULING, SERVICES, PRICES, HOURS, FAQ, GOODBYE
  triggerKeywords: json('trigger_keywords').$type<string[]>().default([]),

  content: text('content').notNull(),
  variables: json('variables').$type<string[]>().default([]), // {{client_name}}, {{salon_name}}, etc.

  isActive: boolean('is_active').default(true),
  usageCount: integer('usage_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Métricas diárias ALEXIS
export const alexisDailyMetrics = pgTable('alexis_daily_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  date: date('date').notNull(),

  totalSessions: integer('total_sessions').default(0),
  totalMessages: integer('total_messages').default(0),
  aiResponses: integer('ai_responses').default(0),
  humanResponses: integer('human_responses').default(0),

  humanTakeovers: integer('human_takeovers').default(0),
  avgResponseTime: decimal('avg_response_time', { precision: 10, scale: 2 }), // segundos

  complianceBlocks: integer('compliance_blocks').default(0),
  complianceFlags: integer('compliance_flags').default(0),

  appointmentsBooked: integer('appointments_booked').default(0),
  questionsAnswered: integer('questions_answered').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para ALEXIS
export type AlexisSettings = typeof alexisSettings.$inferSelect;
export type NewAlexisSettings = typeof alexisSettings.$inferInsert;
export type AlexisSession = typeof alexisSessions.$inferSelect;
export type NewAlexisSession = typeof alexisSessions.$inferInsert;
export type AlexisMessage = typeof alexisMessages.$inferSelect;
export type NewAlexisMessage = typeof alexisMessages.$inferInsert;
export type AlexisComplianceLog = typeof alexisComplianceLogs.$inferSelect;
export type NewAlexisComplianceLog = typeof alexisComplianceLogs.$inferInsert;
export type AlexisHumanTakeover = typeof alexisHumanTakeovers.$inferSelect;
export type NewAlexisHumanTakeover = typeof alexisHumanTakeovers.$inferInsert;
export type AlexisBlockedKeyword = typeof alexisBlockedKeywords.$inferSelect;
export type NewAlexisBlockedKeyword = typeof alexisBlockedKeywords.$inferInsert;
export type AlexisResponseTemplate = typeof alexisResponseTemplates.$inferSelect;
export type NewAlexisResponseTemplate = typeof alexisResponseTemplates.$inferInsert;
export type AlexisDailyMetrics = typeof alexisDailyMetrics.$inferSelect;
export type NewAlexisDailyMetrics = typeof alexisDailyMetrics.$inferInsert;

// ==================== AI TABLES - ALEXIS V2 (WHATSAPP & DASHBOARD) ====================

// Enum para status da conversa AI
export const aiConversationStatusEnum = pgEnum('ai_conversation_status', [
  'AI_ACTIVE',    // Alexis respondendo
  'HUMAN_ACTIVE', // Atendente respondendo (#eu)
  'CLOSED',       // Conversa encerrada
]);

// Enum para role de mensagem AI
export const aiMessageRoleEnum = pgEnum('ai_message_role', [
  'client',  // Mensagem do cliente
  'ai',      // Resposta da Alexis
  'human',   // Resposta do atendente
  'system',  // Mensagem de sistema (#eu, #ia)
]);

// Enum para intenção detectada
export const aiIntentEnum = pgEnum('ai_intent', [
  'GREETING',
  'SCHEDULE',
  'RESCHEDULE',
  'CANCEL',
  'PRODUCT_INFO',
  'SERVICE_INFO',
  'PRICE_INFO',
  'HOURS_INFO',
  'GENERAL',
  'BLOCKED',
  'HUMAN_TAKEOVER',
  'AI_RESUME',
]);

// Configurações da IA por salão
export const aiSettings = pgTable('ai_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),

  isEnabled: boolean('is_enabled').default(true),
  assistantName: varchar('assistant_name', { length: 50 }).default('Alexis'),

  // Mensagens customizáveis
  greetingMessage: text('greeting_message').default('Olá! Sou a Alexis, assistente virtual do salão. Como posso ajudar? 😊'),
  humanTakeoverMessage: text('human_takeover_message').default('Ops! Agora você será atendida por alguém da nossa equipe. Estou por aqui se precisar depois. 😊'),
  aiResumeMessage: text('ai_resume_message').default('Voltei! Se quiser, posso continuar te ajudando por aqui. 💇‍♀️'),

  // Comandos de controle
  humanTakeoverCommand: varchar('human_takeover_command', { length: 20 }).default('#eu'),
  aiResumeCommand: varchar('ai_resume_command', { length: 20 }).default('#ia'),

  // Funcionalidades
  autoSchedulingEnabled: boolean('auto_scheduling_enabled').default(true),

  // Horário de funcionamento
  workingHoursStart: varchar('working_hours_start', { length: 5 }).default('08:00'),
  workingHoursEnd: varchar('working_hours_end', { length: 5 }).default('20:00'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Conversas WhatsApp
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),

  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  clientName: varchar('client_name', { length: 255 }),

  // Status: AI_ACTIVE, HUMAN_ACTIVE, CLOSED
  status: varchar('status', { length: 20 }).notNull().default('AI_ACTIVE'),

  // Atendente que assumiu (#eu)
  humanAgentId: uuid('human_agent_id').references(() => users.id),
  humanTakeoverAt: timestamp('human_takeover_at'),
  aiResumedAt: timestamp('ai_resumed_at'),

  lastMessageAt: timestamp('last_message_at'),
  messagesCount: integer('messages_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mensagens da conversa
export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => aiConversations.id).notNull(),

  // Role: client, ai, human, system
  role: varchar('role', { length: 10 }).notNull(),
  content: text('content').notNull(),

  // Intenção detectada
  intent: varchar('intent', { length: 30 }),

  // Compliance
  wasBlocked: boolean('was_blocked').default(false),
  blockReason: varchar('block_reason', { length: 50 }),

  // Flag para comandos (#eu, #ia) - NÃO são enviados ao cliente
  isCommand: boolean('is_command').default(false),

  // Metadata adicional
  metadata: json('metadata').$type<{
    tokensUsed?: number;
    responseTimeMs?: number;
    confidenceScore?: number;
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Logs de interação (auditoria)
export const aiInteractionLogs = pgTable('ai_interaction_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  conversationId: uuid('conversation_id').references(() => aiConversations.id),

  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  messageIn: text('message_in').notNull(),
  messageOut: text('message_out').notNull(),

  intent: varchar('intent', { length: 30 }),

  wasBlocked: boolean('was_blocked').default(false),
  blockReason: varchar('block_reason', { length: 50 }),

  tokensUsed: integer('tokens_used'),
  responseTimeMs: integer('response_time_ms'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Log de termos bloqueados (ANVISA/LGPD)
export const aiBlockedTermsLog = pgTable('ai_blocked_terms_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  conversationId: uuid('conversation_id').references(() => aiConversations.id),

  originalMessage: text('original_message').notNull(),
  blockedTerms: json('blocked_terms').$type<string[]>().notNull(),

  // Camada: INPUT (antes da IA) ou OUTPUT (resposta da IA)
  layer: varchar('layer', { length: 10 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Briefings do dashboard
export const aiBriefings = pgTable('ai_briefings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),

  userRole: varchar('user_role', { length: 20 }).notNull(),
  content: text('content').notNull(),

  // Dados usados para gerar o briefing
  data: json('data').$type<Record<string, any>>(),

  isRead: boolean('is_read').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Contatos da Alexis (DELTA - humanizacao)
export const alexisContacts = pgTable('alexis_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  lastGreetedAt: timestamp('last_greeted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  salonPhoneUnique: unique().on(table.salonId, table.phone),
}));

// Types para AI tables
export type AiSettings = typeof aiSettings.$inferSelect;
export type NewAiSettings = typeof aiSettings.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;
export type AiMessage = typeof aiMessages.$inferSelect;
export type NewAiMessage = typeof aiMessages.$inferInsert;
export type AiInteractionLog = typeof aiInteractionLogs.$inferSelect;
export type NewAiInteractionLog = typeof aiInteractionLogs.$inferInsert;
export type AiBlockedTermsLog = typeof aiBlockedTermsLog.$inferSelect;
export type NewAiBlockedTermsLog = typeof aiBlockedTermsLog.$inferInsert;
export type AiBriefing = typeof aiBriefings.$inferSelect;
export type NewAiBriefing = typeof aiBriefings.$inferInsert;
export type AlexisContact = typeof alexisContacts.$inferSelect;
export type NewAlexisContact = typeof alexisContacts.$inferInsert;

// ============================================
// APPOINTMENT NOTIFICATIONS (Notificações WhatsApp)
// ============================================

/**
 * Tipo de notificação de agendamento
 */
export const appointmentNotificationTypeEnum = pgEnum('appointment_notification_type', [
  'APPOINTMENT_CONFIRMATION',
  'APPOINTMENT_REMINDER_24H',
  'APPOINTMENT_REMINDER_1H',
  'APPOINTMENT_REMINDER_1H30',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_RESCHEDULED',
  'APPOINTMENT_COMPLETED',
  'TRIAGE_COMPLETED',
  'TRIAGE_REMINDER',
  'CUSTOM',
]);

/**
 * Status da notificação
 */
export const notificationStatusEnum = pgEnum('notification_status', [
  'PENDING',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'CANCELLED',
]);

/**
 * Notificações de agendamento (Outbox pattern)
 * Worker processa esta tabela e envia as mensagens via WhatsApp
 */
export const appointmentNotifications = pgTable('appointment_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Referência ao agendamento
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  // Destinatário
  recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }),

  // Tipo e conteúdo
  notificationType: appointmentNotificationTypeEnum('notification_type').notNull(),
  templateKey: varchar('template_key', { length: 100 }),
  templateVariables: json('template_variables').$type<Record<string, string>>(),
  customMessage: text('custom_message'),

  // Agendamento
  scheduledFor: timestamp('scheduled_for').notNull(),

  // Status e rastreamento
  status: notificationStatusEnum('status').default('PENDING').notNull(),
  providerMessageId: varchar('provider_message_id', { length: 255 }),

  // Tentativas e erros
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  lastError: text('last_error'),

  // Entrega
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),

  // Resposta do cliente (para confirmações)
  clientResponse: varchar('client_response', { length: 50 }),
  clientRespondedAt: timestamp('client_responded_at'),

  // Auditoria
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),

  // PILAR 2: Idempotência
  dedupeKey: varchar('dedupe_key', { length: 255 }),  // Chave única para evitar duplicação
  processingStartedAt: timestamp('processing_started_at'),
  processingWorkerId: varchar('processing_worker_id', { length: 50 }),
});

// Types para Appointment Notifications
export type AppointmentNotification = typeof appointmentNotifications.$inferSelect;
export type NewAppointmentNotification = typeof appointmentNotifications.$inferInsert;
export type AppointmentNotificationType =
  | 'APPOINTMENT_CONFIRMATION'
  | 'APPOINTMENT_REMINDER_24H'
  | 'APPOINTMENT_REMINDER_1H'
  | 'APPOINTMENT_REMINDER_1H30'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'TRIAGE_COMPLETED'
  | 'TRIAGE_REMINDER'
  | 'CUSTOM';
export type NotificationStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'CANCELLED';

// ============================================
// SISTEMA DE TRIAGEM (Pré-Avaliação Digital)
// ============================================

/**
 * Categoria de risco para perguntas de triagem
 */
export const triageRiskCategoryEnum = pgEnum('triage_risk_category', [
  'CHEMICAL_HISTORY',  // Histórico químico
  'HEALTH_CONDITION',  // Condições de saúde
  'HAIR_INTEGRITY',    // Integridade do fio
  'ALLERGY',           // Alergias
  'CUSTOM',            // Personalizada
]);

/**
 * Nível de risco
 */
export const riskLevelEnum = pgEnum('risk_level', [
  'CRITICAL',   // Vermelho - Proíbe o procedimento
  'HIGH',       // Laranja - Requer atenção especial
  'MEDIUM',     // Amarelo - Cuidado
  'LOW',        // Verde - Informativo
]);

/**
 * Formulários de triagem por tipo de serviço
 */
export const triageForms = pgTable('triage_forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Identificação
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Vinculação a serviços
  serviceCategory: varchar('service_category', { length: 100 }),
  serviceIds: json('service_ids').$type<number[]>(),

  // Versionamento
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),

  // Termo de responsabilidade
  consentTitle: varchar('consent_title', { length: 255 }).default('TERMO DE RESPONSABILIDADE E VERACIDADE'),
  consentText: text('consent_text').notNull(),
  requiresConsent: boolean('requires_consent').default(true).notNull(),

  // Auditoria
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Perguntas do formulário de triagem
 */
export const triageQuestions = pgTable('triage_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').references(() => triageForms.id, { onDelete: 'cascade' }).notNull(),

  // Categorização
  category: triageRiskCategoryEnum('category').notNull(),
  categoryLabel: varchar('category_label', { length: 150 }),

  // Pergunta
  questionText: text('question_text').notNull(),
  helpText: text('help_text'),

  // Tipo de resposta
  answerType: varchar('answer_type', { length: 20 }).default('BOOLEAN').notNull(),
  options: json('options').$type<string[]>(),

  // Risco associado
  riskLevel: riskLevelEnum('risk_level').default('MEDIUM').notNull(),
  riskTriggerValue: varchar('risk_trigger_value', { length: 50 }).default('SIM'),
  riskMessage: text('risk_message'),

  // Ação quando risco detectado
  blocksProcedure: boolean('blocks_procedure').default(false),
  requiresNote: boolean('requires_note').default(false),

  // Ordenação
  sortOrder: integer('sort_order').default(0).notNull(),
  isRequired: boolean('is_required').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Respostas do cliente por agendamento
 */
export const triageResponses = pgTable('triage_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Vínculos
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),
  formId: uuid('form_id').references(() => triageForms.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id),

  // Dados do formulário no momento (snapshot)
  formVersion: integer('form_version').notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),

  // Análise de risco
  hasRisks: boolean('has_risks').default(false),
  riskSummary: json('risk_summary').$type<{
    critical: any[];
    high: any[];
    medium: any[];
    low: any[];
  }>(),
  overallRiskLevel: riskLevelEnum('overall_risk_level'),

  // Consentimento
  consentAccepted: boolean('consent_accepted').default(false),
  consentAcceptedAt: timestamp('consent_accepted_at'),
  consentIpAddress: varchar('consent_ip_address', { length: 45 }),

  // Metadados
  completedAt: timestamp('completed_at'),
  completedVia: varchar('completed_via', { length: 20 }),
  expiresAt: timestamp('expires_at'),

  // Token para acesso público (LEGACY - usar tokenHash)
  accessToken: varchar('access_token', { length: 64 }),

  // PILAR 1: Segurança do Token
  tokenHash: varchar('token_hash', { length: 64 }),  // SHA-256 do token
  usedAt: timestamp('used_at'),                       // Marca uso único
  accessAttempts: integer('access_attempts').default(0),
  lastAccessIp: varchar('last_access_ip', { length: 45 }),
  lastAccessUserAgent: text('last_access_user_agent'),
  invalidatedAt: timestamp('invalidated_at'),
  invalidatedReason: varchar('invalidated_reason', { length: 100 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Respostas individuais de cada pergunta
 */
export const triageAnswers = pgTable('triage_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  responseId: uuid('response_id').references(() => triageResponses.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => triageQuestions.id).notNull(),

  // Resposta
  answerValue: varchar('answer_value', { length: 255 }),
  answerText: text('answer_text'),

  // Risco detectado nesta resposta
  triggeredRisk: boolean('triggered_risk').default(false),
  riskLevel: riskLevelEnum('risk_level'),
  riskMessage: text('risk_message'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Sistema de Triagem
export type TriageForm = typeof triageForms.$inferSelect;
export type NewTriageForm = typeof triageForms.$inferInsert;
export type TriageQuestion = typeof triageQuestions.$inferSelect;
export type NewTriageQuestion = typeof triageQuestions.$inferInsert;
export type TriageResponse = typeof triageResponses.$inferSelect;
export type NewTriageResponse = typeof triageResponses.$inferInsert;
export type TriageAnswer = typeof triageAnswers.$inferSelect;
export type NewTriageAnswer = typeof triageAnswers.$inferInsert;

// ============================================
// PILAR 3: EXTENSÕES DE AUDITORIA
// ============================================

/**
 * Overrides de triagem
 * Quando profissional ignora alertas de triagem com justificativa
 */
export const triageOverrides = pgTable('triage_overrides', {
  id: uuid('id').defaultRandom().primaryKey(),
  triageId: uuid('triage_id').references(() => triageResponses.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),

  // Quem autorizou
  userId: uuid('user_id').references(() => users.id).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  userRole: varchar('user_role', { length: 50 }).notNull(),

  // Justificativa obrigatória (mínimo 20 caracteres enforçado no service)
  reason: text('reason').notNull(),

  // Rastreabilidade
  ipAddress: varchar('ip_address', { length: 45 }),

  overriddenAt: timestamp('overridden_at').defaultNow().notNull(),
});

/**
 * Pendências de estoque
 * Quando quantidade é insuficiente no momento do consumo
 */
export const stockAdjustmentsPending = pgTable('stock_adjustments_pending', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  commandId: uuid('command_id').references(() => commands.id),
  commandItemId: uuid('command_item_id').references(() => commandItems.id),
  productId: integer('product_id').references(() => products.id).notNull(),

  quantityNeeded: decimal('quantity_needed', { precision: 10, scale: 3 }).notNull(),
  quantityAvailable: decimal('quantity_available', { precision: 10, scale: 3 }),

  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolvedById: uuid('resolved_by_id').references(() => users.id),
  resolutionNote: text('resolution_note'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types para extensões de Auditoria
export type TriageOverride = typeof triageOverrides.$inferSelect;
export type NewTriageOverride = typeof triageOverrides.$inferInsert;
export type StockAdjustmentPending = typeof stockAdjustmentsPending.$inferSelect;
export type NewStockAdjustmentPending = typeof stockAdjustmentsPending.$inferInsert;

// ==================== MÓDULO DE AGENDAMENTO ONLINE ====================

/**
 * Configurações de Agendamento Online por Salão
 * Controla todas as regras e preferências do sistema de booking online
 */
export const onlineBookingSettings = pgTable('online_booking_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull().unique(),

  // Habilitação geral
  enabled: boolean('enabled').default(false).notNull(),

  // Modo de operação
  operationMode: operationModeEnum('operation_mode').default('SECRETARY_ONLY'),

  // Antecedência de agendamento
  minAdvanceHours: integer('min_advance_hours').default(2).notNull(),
  maxAdvanceDays: integer('max_advance_days').default(30).notNull(),

  // Intervalo entre slots
  slotIntervalMinutes: integer('slot_interval_minutes').default(30),

  // Permitir agendamento no mesmo dia
  allowSameDayBooking: boolean('allow_same_day_booking').default(true),

  // Duração do hold (reserva temporária)
  holdDurationMinutes: integer('hold_duration_minutes').default(10).notNull(),

  // Política de cancelamento
  cancellationHours: integer('cancellation_hours').default(24).notNull(),
  cancellationPolicy: text('cancellation_policy'),
  allowRescheduling: boolean('allow_rescheduling').default(true).notNull(),
  maxReschedules: integer('max_reschedules').default(2).notNull(),

  // Verificação de telefone
  requirePhoneVerification: boolean('require_phone_verification').default(true).notNull(),

  // Depósito/sinal
  requireDeposit: boolean('require_deposit').default(false).notNull(),
  depositType: varchar('deposit_type', { length: 20 }).default('NONE'), // NONE, FIXED, PERCENTAGE
  depositValue: decimal('deposit_value', { precision: 10, scale: 2 }).default('0'),
  depositMinServices: decimal('deposit_min_services', { precision: 10, scale: 2 }).default('100'),
  depositAppliesTo: depositAppliesToEnum('deposit_applies_to').default('ALL'),

  // Regras para novos clientes
  allowNewClients: boolean('allow_new_clients').default(true).notNull(),
  newClientRequiresApproval: boolean('new_client_requires_approval').default(false).notNull(),
  newClientDepositRequired: boolean('new_client_deposit_required').default(false).notNull(),

  // Limites
  maxDailyBookings: integer('max_daily_bookings'),
  maxWeeklyBookingsPerClient: integer('max_weekly_bookings_per_client').default(3),

  // Mensagens customizadas
  welcomeMessage: text('welcome_message'),
  confirmationMessage: text('confirmation_message'),
  cancellationMessage: text('cancellation_message'),

  // Termos e condições
  termsUrl: varchar('terms_url', { length: 500 }),
  requireTermsAcceptance: boolean('require_terms_acceptance').default(false),

  // Integração WhatsApp
  sendWhatsappConfirmation: boolean('send_whatsapp_confirmation').default(true),
  sendWhatsappReminder: boolean('send_whatsapp_reminder').default(true),
  reminderHoursBefore: integer('reminder_hours_before').default(24),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Holds (reservas temporárias) de Agendamento
 * Bloqueia horário por tempo limitado enquanto cliente completa booking
 */
export const appointmentHolds = pgTable('appointment_holds', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Horário reservado
  professionalId: uuid('professional_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(),
  endTime: varchar('end_time', { length: 5 }).notNull(),

  // Dados do cliente (pode ser temporário)
  clientPhone: varchar('client_phone', { length: 20 }).notNull(),
  clientName: varchar('client_name', { length: 255 }),
  clientId: uuid('client_id').references(() => clients.id),

  // Status e controle
  status: holdStatusEnum('status').default('ACTIVE').notNull(),
  expiresAt: timestamp('expires_at').notNull(),

  // Se convertido em agendamento
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  convertedAt: timestamp('converted_at'),

  // Rastreamento
  sessionId: varchar('session_id', { length: 100 }),
  clientIp: varchar('client_ip', { length: 45 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Regras de Booking por Cliente
 * Permite bloquear ou aplicar regras especiais para clientes específicos
 */
export const clientBookingRules = pgTable('client_booking_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Identificação do cliente (phone ou clientId)
  clientPhone: varchar('client_phone', { length: 20 }),
  clientId: uuid('client_id').references(() => clients.id),

  // Tipo de regra
  ruleType: bookingRuleTypeEnum('rule_type').notNull(),

  // Configuração da regra
  reason: text('reason'),
  restrictedServiceIds: json('restricted_service_ids').$type<number[]>(),

  // Validade
  startsAt: timestamp('starts_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),

  // Quem criou
  createdById: uuid('created_by_id').references(() => users.id).notNull(),

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Depósitos de Agendamento
 * Registra sinais/depósitos pagos para confirmar agendamentos
 */
export const appointmentDeposits = pgTable('appointment_deposits', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Vinculação
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  holdId: uuid('hold_id').references(() => appointmentHolds.id),
  clientId: uuid('client_id').references(() => clients.id),

  // Valor
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),

  // Status do depósito
  status: depositStatusEnum('status').default('PENDING').notNull(),

  // Dados do pagamento
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentReference: varchar('payment_reference', { length: 255 }),
  mercadoPagoPaymentId: varchar('mercado_pago_payment_id', { length: 100 }),
  pixCode: text('pix_code'),
  pixQrCodeBase64: text('pix_qr_code_base64'),

  // Datas
  paidAt: timestamp('paid_at'),
  refundedAt: timestamp('refunded_at'),
  forfeitedAt: timestamp('forfeited_at'),
  expiresAt: timestamp('expires_at'),

  // Motivo (para refund/forfeit)
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Códigos OTP para verificação
 * Usados para verificar telefone e confirmar ações sensíveis
 */
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),

  // Tipo de verificação
  type: otpTypeEnum('type').notNull(),

  // Destino
  phone: varchar('phone', { length: 20 }).notNull(),

  // Código
  code: varchar('code', { length: 6 }).notNull(),

  // Controle
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),

  // Vinculação opcional
  holdId: uuid('hold_id').references(() => appointmentHolds.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  // Rastreamento
  clientIp: varchar('client_ip', { length: 45 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para Agendamento Online
export type OnlineBookingSettings = typeof onlineBookingSettings.$inferSelect;
export type NewOnlineBookingSettings = typeof onlineBookingSettings.$inferInsert;
export type AppointmentHold = typeof appointmentHolds.$inferSelect;
export type NewAppointmentHold = typeof appointmentHolds.$inferInsert;
export type ClientBookingRule = typeof clientBookingRules.$inferSelect;
export type NewClientBookingRule = typeof clientBookingRules.$inferInsert;
export type AppointmentDeposit = typeof appointmentDeposits.$inferSelect;
export type NewAppointmentDeposit = typeof appointmentDeposits.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;

// ==================== MÓDULO DE ADD-ONS E QUOTAS (WhatsApp) ====================

/**
 * Enum para status de add-on do salão
 */
export const addonStatusEnum = pgEnum('addon_status', ['ACTIVE', 'SUSPENDED', 'CANCELED']);

/**
 * Enum para tipo de evento de quota (ledger)
 */
export const quotaEventTypeEnum = pgEnum('quota_event_type', [
  'CONSUME',    // Consumo de quota (agendamento enviou mensagem)
  'PURCHASE',   // Compra de créditos extras
  'GRANT',      // Concessão manual ou ativação de add-on
  'ADJUST',     // Ajuste manual (admin)
  'REFUND',     // Estorno
]);

/**
 * Catálogo de Add-ons disponíveis
 * Ex: WHATSAPP_BASIC_120, WHATSAPP_PRO_160
 */
export const addonCatalog = pgTable('addon_catalog', {
  code: varchar('code', { length: 50 }).primaryKey(),
  family: varchar('family', { length: 30 }).notNull(),           // WHATSAPP
  tier: varchar('tier', { length: 20 }).notNull(),               // BASIC, PRO
  quotaType: varchar('quota_type', { length: 50 }).notNull(),    // WHATSAPP_APPOINTMENT
  quotaAmount: integer('quota_amount').notNull(),                // 120, 160, 200, 240
  priceCents: integer('price_cents').notNull(),                  // 2990, 3990, ...
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Pacotes de créditos extras
 * Ex: WHATSAPP_EXTRA_20 = +20 agendamentos por R$10
 */
export const creditPackages = pgTable('credit_packages', {
  code: varchar('code', { length: 50 }).primaryKey(),
  quotaType: varchar('quota_type', { length: 50 }).notNull(),    // WHATSAPP_APPOINTMENT
  qty: integer('qty').notNull(),                                 // 20
  priceCents: integer('price_cents').notNull(),                  // 1000
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Add-ons ativos por salão
 * Indica quais add-ons o salão contratou
 */
export const salonAddons = pgTable('salon_addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  addonCode: varchar('addon_code', { length: 50 }).references(() => addonCatalog.code).notNull(),
  status: addonStatusEnum('status').default('ACTIVE').notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Quotas mensais por salão
 * Controla saldo de agendamentos WhatsApp por mês
 */
export const salonQuotas = pgTable('salon_quotas', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  periodYyyymm: integer('period_yyyymm').notNull(),              // 202601
  whatsappIncluded: integer('whatsapp_included').default(0).notNull(),
  whatsappUsed: integer('whatsapp_used').default(0).notNull(),
  whatsappExtraPurchased: integer('whatsapp_extra_purchased').default(0).notNull(),
  whatsappExtraUsed: integer('whatsapp_extra_used').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSalonPeriod: unique().on(table.salonId, table.periodYyyymm),
}));

/**
 * Ledger de quotas (auditoria)
 * Registra todos os eventos de consumo, compra, ajuste
 */
export const quotaLedger = pgTable('quota_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  periodYyyymm: integer('period_yyyymm').notNull(),
  eventType: quotaEventTypeEnum('event_type').notNull(),
  quotaType: varchar('quota_type', { length: 50 }).notNull(),    // WHATSAPP_APPOINTMENT
  qty: integer('qty').notNull(),                                 // pode ser negativo (consumo)
  refType: varchar('ref_type', { length: 30 }),                  // APPOINTMENT, MANUAL, INVOICE
  refId: varchar('ref_id', { length: 100 }),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Enum para status de unidade de agendamento WhatsApp
 */
export const appointmentUnitStatusEnum = pgEnum('appointment_unit_status', [
  'PENDING',   // Aguardando envio
  'SENT',      // Enviado com sucesso
  'FAILED',    // Falhou no envio
]);

/**
 * Unidades de agendamento WhatsApp
 * Rastreia cada agendamento que deve consumir quota
 * Status: PENDING -> SENT ou FAILED
 */
export const whatsappAppointmentUnits = pgTable('whatsapp_appointment_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),
  origin: text('origin').default('AUTOMATION').notNull(),           // AUTOMATION, MANUAL
  status: appointmentUnitStatusEnum('status').default('PENDING').notNull(),
  firstTemplateCode: text('first_template_code'),                   // Ex: appointment_reminder_24h
  providerMessageId: text('provider_message_id'),                   // ID da mensagem no provedor
  lastError: text('last_error'),                                    // Último erro (se FAILED)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSalonAppointment: unique().on(table.salonId, table.appointmentId),
}));

// Types para Add-ons e Quotas
export type AddonCatalog = typeof addonCatalog.$inferSelect;
export type NewAddonCatalog = typeof addonCatalog.$inferInsert;
export type CreditPackage = typeof creditPackages.$inferSelect;
export type NewCreditPackage = typeof creditPackages.$inferInsert;
export type SalonAddon = typeof salonAddons.$inferSelect;
export type NewSalonAddon = typeof salonAddons.$inferInsert;
export type SalonQuota = typeof salonQuotas.$inferSelect;
export type NewSalonQuota = typeof salonQuotas.$inferInsert;
export type QuotaLedgerEntry = typeof quotaLedger.$inferSelect;
export type NewQuotaLedgerEntry = typeof quotaLedger.$inferInsert;

// Types para WhatsApp Appointment Units
export type WhatsappAppointmentUnit = typeof whatsappAppointmentUnits.$inferSelect;
export type NewWhatsappAppointmentUnit = typeof whatsappAppointmentUnits.$inferInsert;

// ==================== ALEXIS PRODUCT CATALOG ====================

/**
 * Aliases de produtos para busca (multi-tenant)
 * Permite que "blindagem", "protetor térmico" encontrem o produto correto
 */
export const productAliases = pgTable('product_aliases', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  alias: varchar('alias', { length: 255 }).notNull(),
  aliasNorm: varchar('alias_norm', { length: 255 }).notNull(), // lowercase, sem acentos
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueSalonAliasNorm: unique().on(table.salonId, table.aliasNorm),
  productIdx: index('product_aliases_product_idx').on(table.productId),
  aliasNormIdx: index('product_aliases_alias_norm_idx').on(table.aliasNorm),
}));

/**
 * Políticas globais de produtos (suporte/admin)
 * Permite desabilitar recomendação de produtos por catalog_code sem tocar em cada salão
 */
export const globalProductPolicies = pgTable('global_product_policies', {
  catalogCode: varchar('catalog_code', { length: 100 }).primaryKey(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  reason: text('reason'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// Types para Product Aliases e Policies
export type ProductAlias = typeof productAliases.$inferSelect;
export type NewProductAlias = typeof productAliases.$inferInsert;
export type GlobalProductPolicy = typeof globalProductPolicies.$inferSelect;
export type NewGlobalProductPolicy = typeof globalProductPolicies.$inferInsert;