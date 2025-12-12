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

export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE']);

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
  address: text('address'),
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
  currentStock: integer('current_stock').default(0).notNull(),
  minStock: integer('min_stock').default(0).notNull(),
  unit: unitEnum('unit').default('UN').notNull(),
  active: boolean('active').default(true).notNull(),
  // Campos de Inteligência de Produto
  hairTypes: json('hair_types').$type<string[]>().default([]), // Tipos de cabelo indicados
  concerns: json('concerns').$type<string[]>().default([]), // Problemas/necessidades que resolve
  contraindications: text('contraindications'), // Contraindicações
  ingredients: text('ingredients'), // Ingredientes principais
  howToUse: text('how_to_use'), // Modo de uso
  benefits: json('benefits').$type<string[]>().default([]), // Benefícios
  brand: varchar('brand', { length: 100 }), // Marca
  category: varchar('category', { length: 50 }), // Categoria do produto
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Enum para tipo de ajuste de estoque
 */
export const stockAdjustmentTypeEnum = pgEnum('stock_adjustment_type', ['IN', 'OUT']);

/**
 * Tabela de Ajustes de Estoque (histórico)
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
 * Tabela de logs de auditoria (Compliance e Rastreabilidade)
 */
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  userId: uuid('user_id').references(() => users.id),
  action: auditActionEnum('action').notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  oldValues: json('old_values').$type<Record<string, unknown>>(),
  newValues: json('new_values').$type<Record<string, unknown>>(),
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
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

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
  referenceId: uuid('reference_id'),
  description: text('description').notNull(),
  
  quantity: decimal('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  
  performerId: uuid('performer_id').references(() => users.id),
  addedById: uuid('added_by_id').references(() => users.id).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  
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
  
  method: varchar('method', { length: 30 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  
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