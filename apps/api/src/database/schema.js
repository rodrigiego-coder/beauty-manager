"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLogStatusEnum = exports.syncDirectionEnum = exports.integrationStatusEnum = exports.professionalBlocks = exports.professionalAvailabilities = exports.professionalServices = exports.services = exports.appointments = exports.messages = exports.conversations = exports.users = exports.clients = exports.subscriptionPayments = exports.subscriptionEvents = exports.invoicePayments = exports.subscriptionInvoices = exports.subscriptions = exports.salonSubscriptions = exports.salons = exports.subscriptionPlans = exports.plans = exports.depositAppliesToEnum = exports.operationModeEnum = exports.bookingRuleTypeEnum = exports.depositStatusEnum = exports.otpTypeEnum = exports.holdStatusEnum = exports.subscriptionEventTypeEnum = exports.paymentStatusEnum = exports.paymentMethodEnum = exports.invoiceStatusEnum = exports.billingPeriodEnum = exports.subscriptionPlanEnum = exports.subscriptionStatusEnum = exports.recurringPatternEnum = exports.blockStatusEnum = exports.blockTypeEnum = exports.confirmationViaEnum = exports.appointmentSourceEnum = exports.appointmentPriorityEnum = exports.locationTypeEnum = exports.confirmationStatusEnum = exports.appointmentStatusEnum = exports.auditActionEnum = exports.notificationTypeEnum = exports.userRoleEnum = exports.accountStatusEnum = exports.transactionTypeEnum = exports.serviceCategoryEnum = exports.unitEnum = void 0;
exports.commandConsumptionSnapshots = exports.serviceRecipeLines = exports.serviceRecipes = exports.inventoryLocations = exports.variantCodeEnum = exports.recipeStatusEnum = exports.serviceConsumptions = exports.supportSessions = exports.refreshTokenBlacklist = exports.auditLogs = exports.clientPackageUsages = exports.clientPackageBalances = exports.packageServices = exports.clientPackages = exports.packages = exports.notifications = exports.consumedProducts = exports.accountsReceivable = exports.accountsPayable = exports.transactions = exports.stockMovements = exports.stockAdjustments = exports.movementTypeEnum = exports.stockLocationTypeEnum = exports.stockAdjustmentTypeEnum = exports.products = exports.clientNoShows = exports.appointmentServices = exports.productRecommendationsLog = exports.productRecommendationRules = exports.clientHairProfiles = exports.scalpTypeEnum = exports.hairPorosityEnum = exports.hairLengthEnum = exports.hairThicknessEnum = exports.hairTypeEnum = exports.scheduledMessages = exports.automationSettings = exports.messageLogs = exports.messageTemplates = exports.scheduledMessageStatusEnum = exports.smsProviderEnum = exports.whatsappProviderEnum = exports.messageStatusEnum = exports.messageChannelEnum = exports.messageTemplateTypeEnum = exports.googleEventConflicts = exports.googleSyncLogs = exports.googleIntegrations = exports.conflictStatusEnum = void 0;
exports.reservationDeliveryTypeEnum = exports.reservationStatusEnum = exports.cartLinkSourceEnum = exports.cartLinkStatusEnum = exports.upsellOfferStatusEnum = exports.upsellTriggerTypeEnum = exports.subscriptionDeliveryItems = exports.subscriptionDeliveries = exports.clientProductSubscriptions = exports.productSubscriptionItems = exports.productSubscriptionPlans = exports.subscriptionPaymentMethodEnum = exports.deliveryStatusEnum = exports.deliveryTypeEnum = exports.productSubscriptionStatusEnum = exports.productSubscriptionFrequencyEnum = exports.marketingEvents = exports.loyaltyRedemptions = exports.loyaltyTransactions = exports.clientLoyaltyAccounts = exports.loyaltyRewards = exports.loyaltyTiers = exports.loyaltyPrograms = exports.marketingEventTypeEnum = exports.redemptionStatusEnum = exports.rewardTypeEnum = exports.loyaltyTransactionTypeEnum = exports.commissions = exports.commissionStatusEnum = exports.paymentDestinations = exports.paymentMethods = exports.cashMovements = exports.cashRegisters = exports.cashMovementTypeEnum = exports.cashRegisterStatusEnum = exports.feeModeEnum = exports.feeTypeEnum = exports.paymentDestinationTypeEnum = exports.paymentMethodTypeEnum = exports.commandEvents = exports.commandPayments = exports.commandItems = exports.commands = exports.commandEventTypeEnum = exports.commandPaymentMethodEnum = exports.commandItemTypeEnum = exports.commandStatusEnum = exports.productGroupItems = exports.productGroups = exports.recipeVariants = void 0;
exports.appointmentHolds = exports.onlineBookingSettings = exports.stockAdjustmentsPending = exports.triageOverrides = exports.triageAnswers = exports.triageResponses = exports.triageQuestions = exports.triageForms = exports.riskLevelEnum = exports.triageRiskCategoryEnum = exports.appointmentNotifications = exports.notificationStatusEnum = exports.appointmentNotificationTypeEnum = exports.alexisContacts = exports.aiBriefings = exports.aiBlockedTermsLog = exports.aiInteractionLogs = exports.aiMessages = exports.aiConversations = exports.aiSettings = exports.aiIntentEnum = exports.aiMessageRoleEnum = exports.aiConversationStatusEnum = exports.alexisDailyMetrics = exports.alexisResponseTemplates = exports.alexisBlockedKeywords = exports.alexisHumanTakeovers = exports.alexisComplianceLogs = exports.alexisMessages = exports.alexisSessions = exports.alexisSettings = exports.alexisViolationTypeEnum = exports.alexisComplianceRiskEnum = exports.alexisMessageDirectionEnum = exports.alexisMessageTypeEnum = exports.alexisControlModeEnum = exports.alexisSessionStatusEnum = exports.clientNotesAi = exports.dashboardSettings = exports.dashboardConversations = exports.aiInsights = exports.abTestAssignments = exports.abTests = exports.productReservations = exports.cartLinkViews = exports.cartLinks = exports.upsellOffers = exports.upsellRules = exports.abTestTypeEnum = exports.abTestStatusEnum = void 0;
exports.googleCalendarTokens = exports.professionalSchedules = exports.salonSchedules = exports.globalProductPolicies = exports.productAliases = exports.whatsappAppointmentUnits = exports.appointmentUnitStatusEnum = exports.quotaLedger = exports.salonQuotas = exports.salonAddons = exports.creditPackages = exports.addonCatalog = exports.quotaEventTypeEnum = exports.addonStatusEnum = exports.otpCodes = exports.appointmentDeposits = exports.clientBookingRules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
/**
 * Enums
 */
exports.unitEnum = (0, pg_core_1.pgEnum)('unit', ['UN', 'ML', 'KG', 'L', 'G']);
/**
 * Enum para categoria de servico
 */
exports.serviceCategoryEnum = (0, pg_core_1.pgEnum)('service_category', [
    'HAIR',
    'BARBER',
    'NAILS',
    'SKIN',
    'MAKEUP',
    'OTHER',
]);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)('transaction_type', ['INCOME', 'EXPENSE']);
exports.accountStatusEnum = (0, pg_core_1.pgEnum)('account_status', ['PENDING', 'PAID', 'OVERDUE']);
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST']);
exports.notificationTypeEnum = (0, pg_core_1.pgEnum)('notification_type', [
    'STOCK_LOW',
    'CLIENT_INACTIVE',
    'BILL_DUE',
    'APPOINTMENT_REMINDER',
    'CHURN_RISK',
]);
exports.auditActionEnum = (0, pg_core_1.pgEnum)('audit_action', [
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
exports.appointmentStatusEnum = (0, pg_core_1.pgEnum)('appointment_status', [
    'SCHEDULED',
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
]);
// Enum para Status de Confirmação
exports.confirmationStatusEnum = (0, pg_core_1.pgEnum)('confirmation_status', [
    'PENDING',
    'CONFIRMED',
    'AUTO_CONFIRMED',
]);
// Enum para Tipo de Local
exports.locationTypeEnum = (0, pg_core_1.pgEnum)('location_type', [
    'SALON',
    'HOME',
    'ONLINE',
]);
// Enum para Prioridade
exports.appointmentPriorityEnum = (0, pg_core_1.pgEnum)('appointment_priority', [
    'NORMAL',
    'VIP',
    'URGENT',
]);
// Enum para Fonte do Agendamento
exports.appointmentSourceEnum = (0, pg_core_1.pgEnum)('appointment_source', [
    'MANUAL',
    'ONLINE',
    'WHATSAPP',
    'APP',
    'ALEXIS',
]);
// Enum para Via de Confirmação
exports.confirmationViaEnum = (0, pg_core_1.pgEnum)('confirmation_via', [
    'WHATSAPP',
    'SMS',
    'EMAIL',
    'MANUAL',
]);
// Enum para Tipo de Bloqueio
exports.blockTypeEnum = (0, pg_core_1.pgEnum)('block_type', [
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
exports.blockStatusEnum = (0, pg_core_1.pgEnum)('block_status', [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
]);
// Enum para Padrão de Recorrência
exports.recurringPatternEnum = (0, pg_core_1.pgEnum)('recurring_pattern', [
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
]);
// Enums para Sistema de Assinaturas
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('subscription_status', [
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'SUSPENDED',
    'CANCELED',
]);
exports.subscriptionPlanEnum = (0, pg_core_1.pgEnum)('subscription_plan', [
    'FREE',
    'BASIC',
    'PRO',
    'PREMIUM',
]);
exports.billingPeriodEnum = (0, pg_core_1.pgEnum)('billing_period', ['MONTHLY', 'YEARLY']);
exports.invoiceStatusEnum = (0, pg_core_1.pgEnum)('invoice_status', [
    'PENDING',
    'PAID',
    'OVERDUE',
    'CANCELED',
    'FAILED',
]);
exports.paymentMethodEnum = (0, pg_core_1.pgEnum)('payment_method', [
    'PIX',
    'CARD',
    'BOLETO',
    'TRANSFER',
    'MANUAL',
]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)('payment_status', [
    'PENDING',
    'CONFIRMED',
    'FAILED',
    'REFUNDED',
]);
exports.subscriptionEventTypeEnum = (0, pg_core_1.pgEnum)('subscription_event_type', [
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
exports.holdStatusEnum = (0, pg_core_1.pgEnum)('hold_status', [
    'ACTIVE',
    'CONVERTED',
    'EXPIRED',
    'RELEASED',
]);
// Enum para Tipo de OTP
exports.otpTypeEnum = (0, pg_core_1.pgEnum)('otp_type', [
    'PHONE_VERIFICATION',
    'BOOKING_CONFIRMATION',
    'CANCEL_BOOKING',
]);
// Enum para Status de Depósito
exports.depositStatusEnum = (0, pg_core_1.pgEnum)('deposit_status', [
    'PENDING',
    'PAID',
    'REFUNDED',
    'FORFEITED',
]);
// Enum para Tipo de Regra de Booking
exports.bookingRuleTypeEnum = (0, pg_core_1.pgEnum)('booking_rule_type', [
    'BLOCKED',
    'VIP_ONLY',
    'DEPOSIT_REQUIRED',
    'RESTRICTED_SERVICES',
]);
// Enum para Modo de Operação do Booking Online
exports.operationModeEnum = (0, pg_core_1.pgEnum)('operation_mode', [
    'SECRETARY_ONLY',
    'SECRETARY_AND_ONLINE',
    'SECRETARY_WITH_LINK',
]);
// Enum para Aplicação de Depósito
exports.depositAppliesToEnum = (0, pg_core_1.pgEnum)('deposit_applies_to', [
    'ALL',
    'NEW_CLIENTS',
    'SPECIFIC_SERVICES',
    'SELECTED_CLIENTS',
]);
/**
 * Tabela de Planos de Assinatura (plans)
 */
exports.plans = (0, pg_core_1.pgTable)('plans', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    priceMonthly: (0, pg_core_1.decimal)('price_monthly', { precision: 10, scale: 2 }).notNull(),
    priceYearly: (0, pg_core_1.decimal)('price_yearly', { precision: 10, scale: 2 }),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('BRL').notNull(),
    maxUsers: (0, pg_core_1.integer)('max_users').notNull(),
    maxClients: (0, pg_core_1.integer)('max_clients').notNull(),
    maxSalons: (0, pg_core_1.integer)('max_salons').default(1).notNull(),
    features: (0, pg_core_1.json)('features').$type().default([]),
    hasFiscal: (0, pg_core_1.boolean)('has_fiscal').default(false).notNull(),
    hasAutomation: (0, pg_core_1.boolean)('has_automation').default(false).notNull(),
    hasReports: (0, pg_core_1.boolean)('has_reports').default(false).notNull(),
    hasAI: (0, pg_core_1.boolean)('has_ai').default(false).notNull(),
    trialDays: (0, pg_core_1.integer)('trial_days').default(14),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Planos de Assinatura Legada (manter para compatibilidade)
 */
exports.subscriptionPlans = (0, pg_core_1.pgTable)('subscription_plans', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    code: (0, exports.subscriptionPlanEnum)('code').notNull(),
    description: (0, pg_core_1.text)('description'),
    monthlyPrice: (0, pg_core_1.decimal)('monthly_price', { precision: 10, scale: 2 }).notNull(),
    yearlyPrice: (0, pg_core_1.decimal)('yearly_price', { precision: 10, scale: 2 }),
    features: (0, pg_core_1.json)('features').$type().notNull(),
    trialDays: (0, pg_core_1.integer)('trial_days').default(7),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de saloes (Multi-localidade)
 */
exports.salons = (0, pg_core_1.pgTable)('salons', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 100 }).unique(), // URL amigável para booking online
    address: (0, pg_core_1.text)('address'),
    locationUrl: (0, pg_core_1.text)('location_url'), // Link do Google Maps
    wazeUrl: (0, pg_core_1.text)('waze_url'), // Link do Waze
    taxId: (0, pg_core_1.varchar)('tax_id', { length: 20 }), // CNPJ
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Assinaturas dos Saloes (Nova)
 */
exports.salonSubscriptions = (0, pg_core_1.pgTable)('salon_subscriptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    planId: (0, pg_core_1.uuid)('plan_id').references(() => exports.plans.id).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('TRIALING').notNull(),
    billingPeriod: (0, pg_core_1.varchar)('billing_period', { length: 10 }).default('MONTHLY').notNull(),
    startsAt: (0, pg_core_1.timestamp)('starts_at').defaultNow().notNull(),
    trialEndsAt: (0, pg_core_1.timestamp)('trial_ends_at'),
    currentPeriodStart: (0, pg_core_1.timestamp)('current_period_start').notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)('current_period_end').notNull(),
    cancelAtPeriodEnd: (0, pg_core_1.boolean)('cancel_at_period_end').default(false).notNull(),
    canceledAt: (0, pg_core_1.timestamp)('canceled_at'),
    maxUsersOverride: (0, pg_core_1.integer)('max_users_override'),
    mercadoPagoCustomerId: (0, pg_core_1.varchar)('mercado_pago_customer_id', { length: 255 }),
    mercadoPagoSubscriptionId: (0, pg_core_1.varchar)('mercado_pago_subscription_id', { length: 255 }),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Assinaturas Legada (manter para compatibilidade)
 */
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    planId: (0, pg_core_1.integer)('plan_id').references(() => exports.subscriptionPlans.id).notNull(),
    status: (0, exports.subscriptionStatusEnum)('status').default('TRIALING').notNull(),
    currentPeriodStart: (0, pg_core_1.timestamp)('current_period_start').notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)('current_period_end').notNull(),
    canceledAt: (0, pg_core_1.timestamp)('canceled_at'),
    trialEndsAt: (0, pg_core_1.timestamp)('trial_ends_at'),
    gracePeriodEndsAt: (0, pg_core_1.timestamp)('grace_period_ends_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Faturas de Assinatura
 */
exports.subscriptionInvoices = (0, pg_core_1.pgTable)('subscription_invoices', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    subscriptionId: (0, pg_core_1.uuid)('subscription_id').references(() => exports.salonSubscriptions.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    invoiceNumber: (0, pg_core_1.varchar)('invoice_number', { length: 50 }).notNull().unique(),
    referencePeriodStart: (0, pg_core_1.timestamp)('reference_period_start').notNull(),
    referencePeriodEnd: (0, pg_core_1.timestamp)('reference_period_end').notNull(),
    dueDate: (0, pg_core_1.timestamp)('due_date').notNull(),
    totalAmount: (0, pg_core_1.decimal)('total_amount', { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('BRL').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 20 }),
    mercadoPagoPaymentId: (0, pg_core_1.varchar)('mercado_pago_payment_id', { length: 255 }),
    mercadoPagoPreferenceId: (0, pg_core_1.varchar)('mercado_pago_preference_id', { length: 255 }),
    pixQrCode: (0, pg_core_1.text)('pix_qr_code'),
    pixQrCodeBase64: (0, pg_core_1.text)('pix_qr_code_base64'),
    pixExpiresAt: (0, pg_core_1.timestamp)('pix_expires_at'),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Pagamentos de Faturas
 */
exports.invoicePayments = (0, pg_core_1.pgTable)('invoice_payments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    invoiceId: (0, pg_core_1.uuid)('invoice_id').references(() => exports.subscriptionInvoices.id).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    method: (0, pg_core_1.varchar)('method', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    mercadoPagoPaymentId: (0, pg_core_1.varchar)('mercado_pago_payment_id', { length: 255 }),
    transactionData: (0, pg_core_1.json)('transaction_data').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Eventos de Assinatura (Auditoria)
 */
exports.subscriptionEvents = (0, pg_core_1.pgTable)('subscription_events', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    subscriptionId: (0, pg_core_1.uuid)('subscription_id').references(() => exports.salonSubscriptions.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(),
    previousValue: (0, pg_core_1.text)('previous_value'),
    newValue: (0, pg_core_1.text)('new_value'),
    metadata: (0, pg_core_1.json)('metadata').$type(),
    performedById: (0, pg_core_1.uuid)('performed_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Pagamentos de Assinatura Legada (manter para compatibilidade)
 */
exports.subscriptionPayments = (0, pg_core_1.pgTable)('subscription_payments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    subscriptionId: (0, pg_core_1.integer)('subscription_id').references(() => exports.subscriptions.id).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: (0, pg_core_1.date)('due_date').notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }),
    transactionId: (0, pg_core_1.varchar)('transaction_id', { length: 255 }),
    status: (0, exports.accountStatusEnum)('status').default('PENDING').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de clientes do salao
 */
exports.clients = (0, pg_core_1.pgTable)('clients', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    birthDate: (0, pg_core_1.date)('birth_date'),
    aiActive: (0, pg_core_1.boolean)('ai_active').default(true).notNull(),
    technicalNotes: (0, pg_core_1.text)('technical_notes'),
    preferences: (0, pg_core_1.text)('preferences'),
    lastVisitDate: (0, pg_core_1.date)('last_visit_date'),
    totalVisits: (0, pg_core_1.integer)('total_visits').default(0).notNull(),
    churnRisk: (0, pg_core_1.boolean)('churn_risk').default(false).notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de usuarios/profissionais do salao
 */
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    role: (0, exports.userRoleEnum)('role').default('STYLIST').notNull(),
    commissionRate: (0, pg_core_1.decimal)('commission_rate', { precision: 5, scale: 2 }).default('0.50'),
    workSchedule: (0, pg_core_1.json)('work_schedule').$type(),
    specialties: (0, pg_core_1.text)('specialties'),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    // Token para criação/reset de senha (enviado via WhatsApp)
    passwordResetToken: (0, pg_core_1.varchar)('password_reset_token', { length: 64 }).unique(),
    passwordResetExpires: (0, pg_core_1.timestamp)('password_reset_expires'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de conversas/sessoes de chat
 */
exports.conversations = (0, pg_core_1.pgTable)('conversations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    clientId: (0, pg_core_1.uuid)('client_id')
        .references(() => exports.clients.id)
        .notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('active').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de mensagens
 */
exports.messages = (0, pg_core_1.pgTable)('messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    conversationId: (0, pg_core_1.uuid)('conversation_id')
        .references(() => exports.conversations.id)
        .notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    toolCalls: (0, pg_core_1.text)('tool_calls'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de agendamentos (v3.0 - Completa)
 */
exports.appointments = (0, pg_core_1.pgTable)('appointments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Cliente
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }),
    clientEmail: (0, pg_core_1.varchar)('client_email', { length: 255 }),
    // Profissional e serviço
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id),
    service: (0, pg_core_1.varchar)('service', { length: 100 }).notNull(),
    // Data e hora
    date: (0, pg_core_1.varchar)('date', { length: 10 }).notNull(),
    time: (0, pg_core_1.varchar)('time', { length: 5 }).notNull(),
    startTime: (0, pg_core_1.varchar)('start_time', { length: 5 }),
    endTime: (0, pg_core_1.varchar)('end_time', { length: 5 }),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    bufferBefore: (0, pg_core_1.integer)('buffer_before').default(0).notNull(),
    bufferAfter: (0, pg_core_1.integer)('buffer_after').default(0).notNull(),
    // Local
    locationType: (0, exports.locationTypeEnum)('location_type').default('SALON').notNull(),
    address: (0, pg_core_1.text)('address'),
    // Status
    status: (0, exports.appointmentStatusEnum)('status').default('SCHEDULED').notNull(),
    confirmationStatus: (0, exports.confirmationStatusEnum)('confirmation_status').default('PENDING').notNull(),
    confirmedAt: (0, pg_core_1.timestamp)('confirmed_at'),
    confirmedVia: (0, exports.confirmationViaEnum)('confirmed_via'),
    // Prioridade e visual
    priority: (0, exports.appointmentPriorityEnum)('priority').default('NORMAL').notNull(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    // Preço
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).default('0').notNull(),
    // Notas
    notes: (0, pg_core_1.text)('notes'),
    internalNotes: (0, pg_core_1.text)('internal_notes'),
    // Vinculação
    commandId: (0, pg_core_1.uuid)('command_id'),
    clientPackageId: (0, pg_core_1.integer)('client_package_id'),
    // Lembretes e histórico
    reminderSentAt: (0, pg_core_1.timestamp)('reminder_sent_at'),
    noShowCount: (0, pg_core_1.integer)('no_show_count').default(0).notNull(),
    source: (0, exports.appointmentSourceEnum)('source').default('MANUAL').notNull(),
    // Auditoria
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    updatedById: (0, pg_core_1.uuid)('updated_by_id').references(() => exports.users.id),
    cancelledById: (0, pg_core_1.uuid)('cancelled_by_id').references(() => exports.users.id),
    cancellationReason: (0, pg_core_1.text)('cancellation_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    // ==================== CAMPOS PARA AGENDAMENTO ONLINE ====================
    // Referência ao hold temporário que originou
    holdId: (0, pg_core_1.uuid)('hold_id'),
    // Referência ao depósito (se exigido)
    depositId: (0, pg_core_1.uuid)('deposit_id'),
    // Verificação de telefone
    verifiedPhone: (0, pg_core_1.boolean)('verified_phone').default(false),
    // Token de acesso do cliente (para cancelamento/reagendamento)
    clientAccessToken: (0, pg_core_1.uuid)('client_access_token'),
    clientAccessTokenExpiresAt: (0, pg_core_1.timestamp)('client_access_token_expires_at'),
    // Rastreamento online
    bookedOnlineAt: (0, pg_core_1.timestamp)('booked_online_at'),
    clientIp: (0, pg_core_1.varchar)('client_ip', { length: 45 }),
    // Reagendamento
    rescheduledFromId: (0, pg_core_1.uuid)('rescheduled_from_id'),
    rescheduledToId: (0, pg_core_1.uuid)('rescheduled_to_id'),
    rescheduleCount: (0, pg_core_1.integer)('reschedule_count').default(0),
    // Google Calendar
    googleEventId: (0, pg_core_1.varchar)('google_event_id', { length: 255 }),
});
/**
 * Tabela de servicos do salao (v3.0 - Enhanced)
 */
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    category: (0, exports.serviceCategoryEnum)('category').default('HAIR').notNull(),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes').default(60).notNull(),
    basePrice: (0, pg_core_1.decimal)('base_price', { precision: 10, scale: 2 }).notNull(),
    commissionPercentage: (0, pg_core_1.decimal)('commission_percentage', { precision: 5, scale: 2 }).default('0').notNull(),
    // Novos campos para agendamento v3.0
    bufferBefore: (0, pg_core_1.integer)('buffer_before').default(0).notNull(),
    bufferAfter: (0, pg_core_1.integer)('buffer_after').default(0).notNull(),
    allowEncaixe: (0, pg_core_1.boolean)('allow_encaixe').default(false).notNull(),
    requiresRoom: (0, pg_core_1.boolean)('requires_room').default(false).notNull(),
    allowHomeService: (0, pg_core_1.boolean)('allow_home_service').default(false).notNull(),
    homeServiceFee: (0, pg_core_1.decimal)('home_service_fee', { precision: 10, scale: 2 }).default('0').notNull(),
    maxAdvanceBookingDays: (0, pg_core_1.integer)('max_advance_booking_days').default(30).notNull(),
    minAdvanceBookingHours: (0, pg_core_1.integer)('min_advance_booking_hours').default(1).notNull(),
    allowOnlineBooking: (0, pg_core_1.boolean)('allow_online_booking').default(true).notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Matriz Profissional × Serviço (especialidades / P0.3)
 * Join N:N entre users (profissionais) e services.
 * PK composta evita necessidade de uuid generator.
 */
exports.professionalServices = (0, pg_core_1.pgTable)('professional_services', {
    professionalId: (0, pg_core_1.uuid)('professional_id')
        .references(() => exports.users.id, { onDelete: 'cascade' })
        .notNull(),
    serviceId: (0, pg_core_1.integer)('service_id')
        .references(() => exports.services.id, { onDelete: 'cascade' })
        .notNull(),
    enabled: (0, pg_core_1.boolean)('enabled').default(true).notNull(),
    priority: (0, pg_core_1.integer)('priority').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.primaryKey)({ columns: [table.professionalId, table.serviceId] }),
]);
/**
 * Tabela de disponibilidade dos profissionais (horários de trabalho)
 */
exports.professionalAvailabilities = (0, pg_core_1.pgTable)('professional_availabilities', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    dayOfWeek: (0, pg_core_1.integer)('day_of_week').notNull(), // 0=Dom, 1=Seg, ..., 6=Sáb
    startTime: (0, pg_core_1.varchar)('start_time', { length: 5 }).notNull(), // HH:MM
    endTime: (0, pg_core_1.varchar)('end_time', { length: 5 }).notNull(),
    breakStartTime: (0, pg_core_1.varchar)('break_start_time', { length: 5 }), // Almoço início
    breakEndTime: (0, pg_core_1.varchar)('break_end_time', { length: 5 }), // Almoço fim
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de bloqueios/folgas/férias dos profissionais
 */
exports.professionalBlocks = (0, pg_core_1.pgTable)('professional_blocks', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    type: (0, exports.blockTypeEnum)('type').notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    startDate: (0, pg_core_1.varchar)('start_date', { length: 10 }).notNull(), // YYYY-MM-DD
    endDate: (0, pg_core_1.varchar)('end_date', { length: 10 }).notNull(),
    startTime: (0, pg_core_1.varchar)('start_time', { length: 5 }), // null = dia inteiro
    endTime: (0, pg_core_1.varchar)('end_time', { length: 5 }),
    allDay: (0, pg_core_1.boolean)('all_day').default(true).notNull(),
    recurring: (0, pg_core_1.boolean)('recurring').default(false).notNull(),
    recurringPattern: (0, exports.recurringPatternEnum)('recurring_pattern'),
    recurringDays: (0, pg_core_1.json)('recurring_days'), // Ex: [1,3,5] para seg/qua/sex
    recurringEndDate: (0, pg_core_1.varchar)('recurring_end_date', { length: 10 }),
    status: (0, exports.blockStatusEnum)('status').default('APPROVED').notNull(),
    requiresApproval: (0, pg_core_1.boolean)('requires_approval').default(false).notNull(),
    approvedById: (0, pg_core_1.uuid)('approved_by_id').references(() => exports.users.id),
    approvedAt: (0, pg_core_1.timestamp)('approved_at'),
    rejectionReason: (0, pg_core_1.text)('rejection_reason'),
    // Campos para sincronização com calendários externos
    externalSource: (0, pg_core_1.varchar)('external_source', { length: 50 }), // 'GOOGLE', 'OUTLOOK', etc.
    externalEventId: (0, pg_core_1.varchar)('external_event_id', { length: 255 }), // ID do evento no calendário externo
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ==================== INTEGRAÇÃO GOOGLE CALENDAR ====================
/**
 * Enum para status da integração
 */
exports.integrationStatusEnum = (0, pg_core_1.pgEnum)('integration_status', [
    'ACTIVE',
    'ERROR',
    'DISCONNECTED',
    'TOKEN_EXPIRED',
]);
/**
 * Enum para direção de sincronização
 */
exports.syncDirectionEnum = (0, pg_core_1.pgEnum)('sync_direction', [
    'GOOGLE_TO_APP',
    'APP_TO_GOOGLE',
    'BIDIRECTIONAL',
]);
/**
 * Enum para status do log de sincronização
 */
exports.syncLogStatusEnum = (0, pg_core_1.pgEnum)('sync_log_status', [
    'SUCCESS',
    'PARTIAL',
    'ERROR',
]);
/**
 * Enum para status do conflito
 */
exports.conflictStatusEnum = (0, pg_core_1.pgEnum)('conflict_status', [
    'PENDING',
    'RESOLVED_KEEP_LOCAL',
    'RESOLVED_KEEP_GOOGLE',
    'RESOLVED_MERGE',
    'IGNORED',
]);
/**
 * Tabela de integrações com Google Calendar
 */
exports.googleIntegrations = (0, pg_core_1.pgTable)('google_integrations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    googleAccountEmail: (0, pg_core_1.varchar)('google_account_email', { length: 255 }).notNull(),
    accessToken: (0, pg_core_1.text)('access_token').notNull(),
    refreshToken: (0, pg_core_1.text)('refresh_token').notNull(),
    tokenExpiresAt: (0, pg_core_1.timestamp)('token_expires_at').notNull(),
    calendarId: (0, pg_core_1.varchar)('calendar_id', { length: 255 }).default('primary').notNull(),
    syncDirection: (0, exports.syncDirectionEnum)('sync_direction').default('GOOGLE_TO_APP').notNull(),
    syncEnabled: (0, pg_core_1.boolean)('sync_enabled').default(true).notNull(),
    lastSyncAt: (0, pg_core_1.timestamp)('last_sync_at'),
    lastSyncStatus: (0, exports.integrationStatusEnum)('last_sync_status'),
    status: (0, exports.integrationStatusEnum)('status').default('ACTIVE').notNull(),
    errorMessage: (0, pg_core_1.text)('error_message'),
    settings: (0, pg_core_1.json)('settings'), // Configurações adicionais (ex: cores, filtros)
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de logs de sincronização
 */
exports.googleSyncLogs = (0, pg_core_1.pgTable)('google_sync_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    integrationId: (0, pg_core_1.uuid)('integration_id').references(() => exports.googleIntegrations.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    syncType: (0, pg_core_1.varchar)('sync_type', { length: 50 }).notNull(), // 'FULL', 'INCREMENTAL', 'MANUAL'
    direction: (0, exports.syncDirectionEnum)('direction').notNull(),
    status: (0, exports.syncLogStatusEnum)('status').notNull(),
    eventsCreated: (0, pg_core_1.integer)('events_created').default(0).notNull(),
    eventsUpdated: (0, pg_core_1.integer)('events_updated').default(0).notNull(),
    eventsDeleted: (0, pg_core_1.integer)('events_deleted').default(0).notNull(),
    conflictsFound: (0, pg_core_1.integer)('conflicts_found').default(0).notNull(),
    errorMessage: (0, pg_core_1.text)('error_message'),
    details: (0, pg_core_1.json)('details'), // Detalhes adicionais da sincronização
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
});
/**
 * Tabela de conflitos de eventos
 */
exports.googleEventConflicts = (0, pg_core_1.pgTable)('google_event_conflicts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    integrationId: (0, pg_core_1.uuid)('integration_id').references(() => exports.googleIntegrations.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    localBlockId: (0, pg_core_1.uuid)('local_block_id').references(() => exports.professionalBlocks.id),
    googleEventId: (0, pg_core_1.varchar)('google_event_id', { length: 255 }),
    conflictType: (0, pg_core_1.varchar)('conflict_type', { length: 50 }).notNull(), // 'TIME_OVERLAP', 'DUPLICATE', 'MODIFIED_BOTH'
    localData: (0, pg_core_1.json)('local_data'), // Dados do evento local
    googleData: (0, pg_core_1.json)('google_data'), // Dados do evento do Google
    status: (0, exports.conflictStatusEnum)('status').default('PENDING').notNull(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    resolvedById: (0, pg_core_1.uuid)('resolved_by_id').references(() => exports.users.id),
    resolution: (0, pg_core_1.varchar)('resolution', { length: 50 }), // Descrição da resolução
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== MÓDULO DE AUTOMAÇÃO WHATSAPP/SMS ====================
/**
 * Enum para tipo de template
 */
exports.messageTemplateTypeEnum = (0, pg_core_1.pgEnum)('message_template_type', [
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
exports.messageChannelEnum = (0, pg_core_1.pgEnum)('message_channel', [
    'WHATSAPP',
    'SMS',
    'BOTH',
]);
/**
 * Enum para status de mensagem
 */
exports.messageStatusEnum = (0, pg_core_1.pgEnum)('message_status', [
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
]);
/**
 * Enum para provedor WhatsApp
 */
exports.whatsappProviderEnum = (0, pg_core_1.pgEnum)('whatsapp_provider', [
    'META',
    'TWILIO',
    'ZENVIA',
    'ZAPI',
]);
/**
 * Enum para provedor SMS
 */
exports.smsProviderEnum = (0, pg_core_1.pgEnum)('sms_provider', [
    'TWILIO',
    'ZENVIA',
    'AWS_SNS',
]);
/**
 * Enum para status de mensagem agendada
 */
exports.scheduledMessageStatusEnum = (0, pg_core_1.pgEnum)('scheduled_message_status', [
    'PENDING',
    'SENT',
    'CANCELLED',
]);
/**
 * Tabela de templates de mensagens
 */
exports.messageTemplates = (0, pg_core_1.pgTable)('message_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    type: (0, exports.messageTemplateTypeEnum)('type').notNull(),
    channel: (0, exports.messageChannelEnum)('channel').default('WHATSAPP').notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }), // Para email futuro
    content: (0, pg_core_1.text)('content').notNull(), // Com variáveis: {{nome}}, {{data}}, etc.
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    triggerHoursBefore: (0, pg_core_1.integer)('trigger_hours_before'), // Para lembretes automáticos
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de histórico de mensagens enviadas
 */
exports.messageLogs = (0, pg_core_1.pgTable)('message_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    templateId: (0, pg_core_1.uuid)('template_id').references(() => exports.messageTemplates.id),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    channel: (0, exports.messageChannelEnum)('channel').notNull(),
    phoneNumber: (0, pg_core_1.varchar)('phone_number', { length: 20 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    status: (0, exports.messageStatusEnum)('status').default('PENDING').notNull(),
    externalId: (0, pg_core_1.varchar)('external_id', { length: 255 }), // ID do provedor
    errorMessage: (0, pg_core_1.text)('error_message'),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    cost: (0, pg_core_1.decimal)('cost', { precision: 10, scale: 4 }), // Custo do SMS
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de configurações de automação por salão
 */
exports.automationSettings = (0, pg_core_1.pgTable)('automation_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    // WhatsApp
    whatsappEnabled: (0, pg_core_1.boolean)('whatsapp_enabled').default(false).notNull(),
    whatsappProvider: (0, exports.whatsappProviderEnum)('whatsapp_provider').default('META').notNull(),
    whatsappApiKey: (0, pg_core_1.text)('whatsapp_api_key'), // Criptografado
    whatsappPhoneNumberId: (0, pg_core_1.varchar)('whatsapp_phone_number_id', { length: 100 }),
    whatsappBusinessAccountId: (0, pg_core_1.varchar)('whatsapp_business_account_id', { length: 100 }),
    // SMS
    smsEnabled: (0, pg_core_1.boolean)('sms_enabled').default(false).notNull(),
    smsProvider: (0, exports.smsProviderEnum)('sms_provider').default('TWILIO').notNull(),
    smsApiKey: (0, pg_core_1.text)('sms_api_key'), // Criptografado
    smsAccountSid: (0, pg_core_1.varchar)('sms_account_sid', { length: 100 }),
    smsPhoneNumber: (0, pg_core_1.varchar)('sms_phone_number', { length: 20 }),
    // Lembretes
    reminderEnabled: (0, pg_core_1.boolean)('reminder_enabled').default(true).notNull(),
    reminderHoursBefore: (0, pg_core_1.integer)('reminder_hours_before').default(24).notNull(),
    // Confirmação
    confirmationEnabled: (0, pg_core_1.boolean)('confirmation_enabled').default(true).notNull(),
    confirmationHoursBefore: (0, pg_core_1.integer)('confirmation_hours_before').default(48).notNull(),
    // Aniversário
    birthdayEnabled: (0, pg_core_1.boolean)('birthday_enabled').default(true).notNull(),
    birthdayTime: (0, pg_core_1.varchar)('birthday_time', { length: 5 }).default('09:00').notNull(),
    birthdayDiscountPercent: (0, pg_core_1.integer)('birthday_discount_percent'),
    // Review
    reviewRequestEnabled: (0, pg_core_1.boolean)('review_request_enabled').default(false).notNull(),
    reviewRequestHoursAfter: (0, pg_core_1.integer)('review_request_hours_after').default(2).notNull(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de mensagens agendadas
 */
exports.scheduledMessages = (0, pg_core_1.pgTable)('scheduled_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    templateId: (0, pg_core_1.uuid)('template_id').references(() => exports.messageTemplates.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    channel: (0, exports.messageChannelEnum)('channel').notNull(),
    scheduledFor: (0, pg_core_1.timestamp)('scheduled_for').notNull(),
    status: (0, exports.scheduledMessageStatusEnum)('status').default('PENDING').notNull(),
    cancelledReason: (0, pg_core_1.text)('cancelled_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== MÓDULO DE INTELIGÊNCIA DE PRODUTO ====================
/**
 * Enum para tipo de cabelo
 */
exports.hairTypeEnum = (0, pg_core_1.pgEnum)('hair_type', [
    'STRAIGHT', // Liso
    'WAVY', // Ondulado
    'CURLY', // Cacheado
    'COILY', // Crespo
]);
/**
 * Enum para espessura do fio
 */
exports.hairThicknessEnum = (0, pg_core_1.pgEnum)('hair_thickness', [
    'FINE', // Fino
    'MEDIUM', // Médio
    'THICK', // Grosso
]);
/**
 * Enum para comprimento
 */
exports.hairLengthEnum = (0, pg_core_1.pgEnum)('hair_length', [
    'SHORT', // Curto
    'MEDIUM', // Médio
    'LONG', // Longo
    'EXTRA_LONG', // Extra longo
]);
/**
 * Enum para porosidade
 */
exports.hairPorosityEnum = (0, pg_core_1.pgEnum)('hair_porosity', [
    'LOW', // Baixa
    'NORMAL', // Normal
    'HIGH', // Alta
]);
/**
 * Enum para tipo de couro cabeludo
 */
exports.scalpTypeEnum = (0, pg_core_1.pgEnum)('scalp_type', [
    'NORMAL', // Normal
    'OILY', // Oleoso
    'DRY', // Seco
    'SENSITIVE', // Sensível
]);
/**
 * Tabela de perfil capilar do cliente
 */
exports.clientHairProfiles = (0, pg_core_1.pgTable)('client_hair_profiles', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull().unique(),
    hairType: (0, exports.hairTypeEnum)('hair_type'),
    hairThickness: (0, exports.hairThicknessEnum)('hair_thickness'),
    hairLength: (0, exports.hairLengthEnum)('hair_length'),
    hairPorosity: (0, exports.hairPorosityEnum)('hair_porosity'),
    scalpType: (0, exports.scalpTypeEnum)('scalp_type'),
    chemicalHistory: (0, pg_core_1.json)('chemical_history').$type().default([]),
    mainConcerns: (0, pg_core_1.json)('main_concerns').$type().default([]),
    allergies: (0, pg_core_1.text)('allergies'),
    currentProducts: (0, pg_core_1.text)('current_products'),
    notes: (0, pg_core_1.text)('notes'),
    lastAssessmentDate: (0, pg_core_1.date)('last_assessment_date'),
    lastAssessedById: (0, pg_core_1.uuid)('last_assessed_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de regras de recomendação de produtos
 */
exports.productRecommendationRules = (0, pg_core_1.pgTable)('product_recommendation_rules', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id), // null = regra global
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    conditions: (0, pg_core_1.json)('conditions').$type().notNull(),
    recommendedProducts: (0, pg_core_1.json)('recommended_products').$type().default([]),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    priority: (0, pg_core_1.integer)('priority').default(0).notNull(),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de log de recomendações
 */
exports.productRecommendationsLog = (0, pg_core_1.pgTable)('product_recommendations_log', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id'),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    ruleId: (0, pg_core_1.uuid)('rule_id').references(() => exports.productRecommendationRules.id),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    reason: (0, pg_core_1.text)('reason'),
    wasAccepted: (0, pg_core_1.boolean)('was_accepted'),
    acceptedAt: (0, pg_core_1.timestamp)('accepted_at'),
    rejectedAt: (0, pg_core_1.timestamp)('rejected_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de múltiplos serviços por agendamento
 */
exports.appointmentServices = (0, pg_core_1.pgTable)('appointment_services', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    order: (0, pg_core_1.integer)('order').default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de histórico de no-shows dos clientes
 */
exports.clientNoShows = (0, pg_core_1.pgTable)('client_no_shows', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id).notNull(),
    date: (0, pg_core_1.varchar)('date', { length: 10 }).notNull(),
    blocked: (0, pg_core_1.boolean)('blocked').default(false).notNull(),
    blockedUntil: (0, pg_core_1.varchar)('blocked_until', { length: 10 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de produtos (Estoque) - Com campos de inteligência de produto
 */
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    costPrice: (0, pg_core_1.decimal)('cost_price', { precision: 10, scale: 2 }).notNull(),
    salePrice: (0, pg_core_1.decimal)('sale_price', { precision: 10, scale: 2 }).notNull(),
    // Estoques separados (PACOTE 1 - Estoque Moderno)
    stockRetail: (0, pg_core_1.integer)('stock_retail').default(0).notNull(),
    stockInternal: (0, pg_core_1.integer)('stock_internal').default(0).notNull(),
    minStockRetail: (0, pg_core_1.integer)('min_stock_retail').default(0).notNull(),
    minStockInternal: (0, pg_core_1.integer)('min_stock_internal').default(0).notNull(),
    unit: (0, exports.unitEnum)('unit').default('UN').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    // Flags Retail/Backbar (indica onde o produto pode ser usado)
    isRetail: (0, pg_core_1.boolean)('is_retail').default(true).notNull(),
    isBackbar: (0, pg_core_1.boolean)('is_backbar').default(false).notNull(),
    // Campos de Inteligência de Produto
    hairTypes: (0, pg_core_1.json)('hair_types').$type().default([]), // Tipos de cabelo indicados
    concerns: (0, pg_core_1.json)('concerns').$type().default([]), // Problemas/necessidades que resolve
    contraindications: (0, pg_core_1.text)('contraindications'), // Contraindicações
    ingredients: (0, pg_core_1.text)('ingredients'), // Ingredientes principais
    howToUse: (0, pg_core_1.text)('how_to_use'), // Modo de uso
    benefits: (0, pg_core_1.json)('benefits').$type().default([]), // Benefícios
    brand: (0, pg_core_1.varchar)('brand', { length: 100 }), // Marca
    category: (0, pg_core_1.varchar)('category', { length: 50 }), // Categoria do produto
    // Catálogo padrão do sistema (Alexis)
    catalogCode: (0, pg_core_1.varchar)('catalog_code', { length: 100 }), // Código estável para produtos padrão (ex: 'REVELARIUM_EKO_VITALI')
    isSystemDefault: (0, pg_core_1.boolean)('is_system_default').default(false).notNull(), // true = produto padrão do sistema
    alexisEnabled: (0, pg_core_1.boolean)('alexis_enabled').default(true).notNull(), // Controle por salão: IA pode recomendar?
    alexisMeta: (0, pg_core_1.json)('alexis_meta').$type(), // Metadados estruturados para Alexis
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Enum para tipo de ajuste de estoque (LEGADO - manter para compatibilidade)
 */
exports.stockAdjustmentTypeEnum = (0, pg_core_1.pgEnum)('stock_adjustment_type', ['IN', 'OUT']);
/**
 * Enum para localização do estoque (RETAIL = venda, INTERNAL = consumo interno)
 */
exports.stockLocationTypeEnum = (0, pg_core_1.pgEnum)('stock_location_type', ['RETAIL', 'INTERNAL']);
/**
 * Enum para tipo de movimento de estoque
 */
exports.movementTypeEnum = (0, pg_core_1.pgEnum)('movement_type', [
    'SALE', // Venda para cliente
    'SERVICE_CONSUMPTION', // Consumo em serviço
    'PURCHASE', // Compra/entrada
    'TRANSFER', // Transferência entre locações
    'ADJUSTMENT', // Ajuste manual
    'RETURN', // Devolução
    'CANCELED', // Cancelamento (estorno)
]);
/**
 * Tabela de Ajustes de Estoque (LEGADO - manter para compatibilidade)
 */
exports.stockAdjustments = (0, pg_core_1.pgTable)('stock_adjustments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    type: (0, exports.stockAdjustmentTypeEnum)('type').notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    previousStock: (0, pg_core_1.integer)('previous_stock').notNull(),
    newStock: (0, pg_core_1.integer)('new_stock').notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Movimentos de Estoque (NOVO - substitui stockAdjustments)
 * Registra todas as movimentações de estoque com localização (RETAIL/INTERNAL)
 */
exports.stockMovements = (0, pg_core_1.pgTable)('stock_movements', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    locationType: (0, exports.stockLocationTypeEnum)('location_type').notNull(),
    delta: (0, pg_core_1.integer)('delta').notNull(), // positivo = entrada, negativo = saída
    movementType: (0, exports.movementTypeEnum)('movement_type').notNull(),
    referenceType: (0, pg_core_1.varchar)('reference_type', { length: 50 }), // 'command', 'appointment', 'purchase', etc.
    referenceId: (0, pg_core_1.uuid)('reference_id'), // ID do registro relacionado
    transferGroupId: (0, pg_core_1.uuid)('transfer_group_id'), // Agrupa transferências entre locações
    reason: (0, pg_core_1.text)('reason'),
    createdByUserId: (0, pg_core_1.uuid)('created_by_user_id').references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de transacoes (Fluxo de Caixa)
 */
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    type: (0, exports.transactionTypeEnum)('type').notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 100 }).notNull(),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }),
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(),
    description: (0, pg_core_1.text)('description'),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de contas a pagar
 */
exports.accountsPayable = (0, pg_core_1.pgTable)('accounts_payable', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    supplierName: (0, pg_core_1.varchar)('supplier_name', { length: 255 }).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: (0, pg_core_1.date)('due_date').notNull(),
    status: (0, exports.accountStatusEnum)('status').default('PENDING').notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 100 }),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de contas a receber (Fiado)
 */
exports.accountsReceivable = (0, pg_core_1.pgTable)('accounts_receivable', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    clientId: (0, pg_core_1.uuid)('client_id')
        .references(() => exports.clients.id)
        .notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: (0, pg_core_1.date)('due_date').notNull(),
    status: (0, exports.accountStatusEnum)('status').default('PENDING').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de produtos consumidos em atendimentos (Custo Real)
 */
exports.consumedProducts = (0, pg_core_1.pgTable)('consumed_products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id')
        .references(() => exports.appointments.id)
        .notNull(),
    productId: (0, pg_core_1.integer)('product_id')
        .references(() => exports.products.id)
        .notNull(),
    quantityUsed: (0, pg_core_1.decimal)('quantity_used', { precision: 10, scale: 3 }).notNull(),
    costAtTime: (0, pg_core_1.decimal)('cost_at_time', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de notificacoes do sistema
 */
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    type: (0, exports.notificationTypeEnum)('type').notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    read: (0, pg_core_1.boolean)('read').default(false).notNull(),
    referenceId: (0, pg_core_1.varchar)('reference_id', { length: 100 }),
    referenceType: (0, pg_core_1.varchar)('reference_type', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de pacotes (Fidelidade)
 */
exports.packages = (0, pg_core_1.pgTable)('packages', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    servicesIncluded: (0, pg_core_1.json)('services_included').$type().notNull(),
    totalSessions: (0, pg_core_1.integer)('total_sessions').notNull(),
    expirationDays: (0, pg_core_1.integer)('expiration_days').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de pacotes adquiridos por clientes
 */
exports.clientPackages = (0, pg_core_1.pgTable)('client_packages', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    clientId: (0, pg_core_1.uuid)('client_id')
        .references(() => exports.clients.id)
        .notNull(),
    packageId: (0, pg_core_1.integer)('package_id')
        .references(() => exports.packages.id)
        .notNull(),
    remainingSessions: (0, pg_core_1.integer)('remaining_sessions').notNull(),
    purchaseDate: (0, pg_core_1.timestamp)('purchase_date').defaultNow().notNull(),
    expirationDate: (0, pg_core_1.date)('expiration_date').notNull(),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de serviços incluídos em cada pacote
 * Define quais serviços e quantas sessões de cada o pacote oferece
 */
exports.packageServices = (0, pg_core_1.pgTable)('package_services', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    packageId: (0, pg_core_1.integer)('package_id').references(() => exports.packages.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    sessionsIncluded: (0, pg_core_1.integer)('sessions_included').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de saldo de sessões por serviço do cliente
 * Rastreia quantas sessões de cada serviço o cliente ainda tem disponível
 */
exports.clientPackageBalances = (0, pg_core_1.pgTable)('client_package_balances', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientPackageId: (0, pg_core_1.integer)('client_package_id').references(() => exports.clientPackages.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    totalSessions: (0, pg_core_1.integer)('total_sessions').notNull(),
    remainingSessions: (0, pg_core_1.integer)('remaining_sessions').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de histórico de uso de sessões (auditoria)
 * Registra cada uso de sessão do pacote, vinculado à comanda/item
 */
exports.clientPackageUsages = (0, pg_core_1.pgTable)('client_package_usages', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientPackageId: (0, pg_core_1.integer)('client_package_id').references(() => exports.clientPackages.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id),
    commandItemId: (0, pg_core_1.uuid)('command_item_id').references(() => exports.commandItems.id),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('CONSUMED').notNull(),
    consumedAt: (0, pg_core_1.timestamp)('consumed_at').defaultNow().notNull(),
    revertedAt: (0, pg_core_1.timestamp)('reverted_at'),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueCommandItem: (0, pg_core_1.unique)().on(table.salonId, table.commandItemId),
}));
/**
 * Tabela de logs de auditoria (Compliance e Rastreabilidade)
 * Estendida com campos adicionais para auditoria forense
 */
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id),
    userName: (0, pg_core_1.varchar)('user_name', { length: 255 }),
    userRole: (0, pg_core_1.varchar)('user_role', { length: 50 }),
    action: (0, exports.auditActionEnum)('action').notNull(),
    entity: (0, pg_core_1.varchar)('entity', { length: 100 }).notNull(),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }).notNull(),
    oldValues: (0, pg_core_1.json)('old_values').$type(),
    newValues: (0, pg_core_1.json)('new_values').$type(),
    metadata: (0, pg_core_1.json)('metadata').$type(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow().notNull(),
});
/**
 * Tabela de Refresh Tokens Invalidados (Blacklist para Logout)
 */
exports.refreshTokenBlacklist = (0, pg_core_1.pgTable)('refresh_token_blacklist', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    token: (0, pg_core_1.text)('token').notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Sessões de Suporte Delegado (SUPER_ADMIN)
 * Permite que administradores acessem temporariamente um salão específico
 * para suporte técnico, com auditoria completa.
 */
exports.supportSessions = (0, pg_core_1.pgTable)('support_sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    adminUserId: (0, pg_core_1.uuid)('admin_user_id').references(() => exports.users.id).notNull(),
    targetSalonId: (0, pg_core_1.uuid)('target_salon_id').references(() => exports.salons.id).notNull(),
    token: (0, pg_core_1.varchar)('token', { length: 64 }).notNull().unique(),
    reason: (0, pg_core_1.text)('reason'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(), // PENDING, CONSUMED, EXPIRED, REVOKED
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    consumedAt: (0, pg_core_1.timestamp)('consumed_at'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Consumo de Produtos por Serviço (BOM - Bill of Materials)
 * Define quais produtos são consumidos automaticamente ao executar um serviço
 */
exports.serviceConsumptions = (0, pg_core_1.pgTable)('service_consumptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    quantity: (0, pg_core_1.decimal)('quantity', { precision: 10, scale: 3 }).notNull(),
    unit: (0, pg_core_1.varchar)('unit', { length: 5 }).default('UN').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =====================================================
// SISTEMA DE RECEITAS E CONSUMO AUTOMÁTICO
// =====================================================
/**
 * Enum para status da receita
 */
exports.recipeStatusEnum = (0, pg_core_1.pgEnum)('recipe_status', ['ACTIVE', 'ARCHIVED']);
/**
 * Enum para códigos de variação (Curto/Médio/Longo)
 */
exports.variantCodeEnum = (0, pg_core_1.pgEnum)('variant_code', [
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
exports.inventoryLocations = (0, pg_core_1.pgTable)('inventory_locations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull(), // 'LOJA', 'SALAO', 'ALMOXARIFADO'
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Receitas de serviços (cabeçalho com versionamento)
 * Cada serviço pode ter múltiplas versões de receita, apenas uma ACTIVE
 */
exports.serviceRecipes = (0, pg_core_1.pgTable)('service_recipes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    version: (0, pg_core_1.integer)('version').default(1).notNull(),
    status: (0, exports.recipeStatusEnum)('status').default('ACTIVE').notNull(),
    effectiveFrom: (0, pg_core_1.date)('effective_from').defaultNow().notNull(),
    notes: (0, pg_core_1.text)('notes'),
    // Precificação calculada
    estimatedCost: (0, pg_core_1.decimal)('estimated_cost', { precision: 10, scale: 2 }),
    targetMarginPercent: (0, pg_core_1.decimal)('target_margin_percent', { precision: 5, scale: 2 }).default('60'),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Linhas da receita (produtos e quantidades)
 * Cada linha representa um produto com quantidade padrão e buffer
 */
exports.serviceRecipeLines = (0, pg_core_1.pgTable)('service_recipe_lines', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    recipeId: (0, pg_core_1.uuid)('recipe_id').references(() => exports.serviceRecipes.id, { onDelete: 'cascade' }).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    productGroupId: (0, pg_core_1.uuid)('product_group_id'), // Para substituições futuras (referência será adicionada depois)
    quantityStandard: (0, pg_core_1.decimal)('quantity_standard', { precision: 10, scale: 3 }).notNull(), // quantidade ideal
    quantityBuffer: (0, pg_core_1.decimal)('quantity_buffer', { precision: 10, scale: 3 }).default('0').notNull(), // folga
    unit: (0, pg_core_1.varchar)('unit', { length: 10 }).notNull(), // ML, G, UN
    isRequired: (0, pg_core_1.boolean)('is_required').default(true).notNull(),
    notes: (0, pg_core_1.text)('notes'), // "cabelo longo usa mais"
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Snapshot do consumo aplicado automaticamente (imutável, para auditoria)
 * Registra exatamente o que foi consumido em cada serviço de uma comanda
 */
exports.commandConsumptionSnapshots = (0, pg_core_1.pgTable)('command_consumption_snapshots', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id).notNull(),
    commandItemId: (0, pg_core_1.uuid)('command_item_id').references(() => exports.commandItems.id).notNull(),
    // Referência da receita
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    recipeId: (0, pg_core_1.uuid)('recipe_id').references(() => exports.serviceRecipes.id),
    recipeVersion: (0, pg_core_1.integer)('recipe_version'),
    variantCode: (0, exports.variantCodeEnum)('variant_code').default('DEFAULT'),
    variantMultiplier: (0, pg_core_1.decimal)('variant_multiplier', { precision: 3, scale: 2 }).default('1'),
    // Produto consumido (snapshot)
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    productName: (0, pg_core_1.varchar)('product_name', { length: 255 }).notNull(),
    // Quantidades
    quantityStandard: (0, pg_core_1.decimal)('quantity_standard', { precision: 10, scale: 3 }).notNull(),
    quantityBuffer: (0, pg_core_1.decimal)('quantity_buffer', { precision: 10, scale: 3 }).notNull(),
    quantityApplied: (0, pg_core_1.decimal)('quantity_applied', { precision: 10, scale: 3 }).notNull(), // standard + buffer
    unit: (0, pg_core_1.varchar)('unit', { length: 10 }).notNull(),
    // Custos
    costAtTime: (0, pg_core_1.decimal)('cost_at_time', { precision: 10, scale: 2 }).notNull(), // custo unitário
    totalCost: (0, pg_core_1.decimal)('total_cost', { precision: 10, scale: 2 }).notNull(), // qty * cost
    // Rastreabilidade
    stockMovementId: (0, pg_core_1.uuid)('stock_movement_id').references(() => exports.stockMovements.id),
    postedAt: (0, pg_core_1.timestamp)('posted_at'), // quando baixou no estoque
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at'),
    // PILAR 2: Idempotência
    dedupeKey: (0, pg_core_1.varchar)('dedupe_key', { length: 255 }), // commandItemId:productId:recipeVersion:variantCode
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Variações da receita (Curto/Médio/Longo)
 * Permite ajustar quantidades automaticamente por tamanho de cabelo
 */
exports.recipeVariants = (0, pg_core_1.pgTable)('recipe_variants', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    recipeId: (0, pg_core_1.uuid)('recipe_id').references(() => exports.serviceRecipes.id, { onDelete: 'cascade' }).notNull(),
    code: (0, exports.variantCodeEnum)('code').notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull(),
    multiplier: (0, pg_core_1.decimal)('multiplier', { precision: 3, scale: 2 }).default('1').notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Grupos de produtos (para substituições)
 * Permite definir produtos alternativos para uma mesma linha de receita
 */
exports.productGroups = (0, pg_core_1.pgTable)('product_groups', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Itens do grupo de produtos
 * Lista os produtos que fazem parte de um grupo de substituição
 */
exports.productGroupItems = (0, pg_core_1.pgTable)('product_group_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    groupId: (0, pg_core_1.uuid)('group_id').references(() => exports.productGroups.id, { onDelete: 'cascade' }).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    priority: (0, pg_core_1.integer)('priority').default(1).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Enums para Comandas
 */
exports.commandStatusEnum = (0, pg_core_1.pgEnum)('command_status', [
    'OPEN',
    'IN_SERVICE',
    'WAITING_PAYMENT',
    'CLOSED',
    'CANCELED'
]);
exports.commandItemTypeEnum = (0, pg_core_1.pgEnum)('command_item_type', ['SERVICE', 'PRODUCT']);
exports.commandPaymentMethodEnum = (0, pg_core_1.pgEnum)('command_payment_method', [
    'CASH',
    'CARD_CREDIT',
    'CARD_DEBIT',
    'PIX',
    'VOUCHER',
    'TRANSFER',
    'OTHER'
]);
exports.commandEventTypeEnum = (0, pg_core_1.pgEnum)('command_event_type', [
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
exports.commands = (0, pg_core_1.pgTable)('commands', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    cardNumber: (0, pg_core_1.varchar)('card_number', { length: 20 }).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('OPEN').notNull(),
    openedAt: (0, pg_core_1.timestamp)('opened_at').defaultNow().notNull(),
    openedById: (0, pg_core_1.uuid)('opened_by_id').references(() => exports.users.id).notNull(),
    serviceClosedAt: (0, pg_core_1.timestamp)('service_closed_at'),
    serviceClosedById: (0, pg_core_1.uuid)('service_closed_by_id').references(() => exports.users.id),
    cashierClosedAt: (0, pg_core_1.timestamp)('cashier_closed_at'),
    cashierClosedById: (0, pg_core_1.uuid)('cashier_closed_by_id').references(() => exports.users.id),
    totalGross: (0, pg_core_1.decimal)('total_gross', { precision: 10, scale: 2 }).default('0'),
    totalDiscounts: (0, pg_core_1.decimal)('total_discounts', { precision: 10, scale: 2 }).default('0'),
    totalNet: (0, pg_core_1.decimal)('total_net', { precision: 10, scale: 2 }).default('0'),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Itens da Comanda
 */
exports.commandItems = (0, pg_core_1.pgTable)('command_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull(),
    referenceId: (0, pg_core_1.varchar)('reference_id', { length: 50 }), // ID de serviço/produto (integer como string)
    description: (0, pg_core_1.text)('description').notNull(),
    quantity: (0, pg_core_1.decimal)('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
    unitPrice: (0, pg_core_1.decimal)('unit_price', { precision: 10, scale: 2 }).notNull(),
    discount: (0, pg_core_1.decimal)('discount', { precision: 10, scale: 2 }).default('0'),
    totalPrice: (0, pg_core_1.decimal)('total_price', { precision: 10, scale: 2 }).notNull(),
    performerId: (0, pg_core_1.uuid)('performer_id').references(() => exports.users.id),
    addedById: (0, pg_core_1.uuid)('added_by_id').references(() => exports.users.id).notNull(),
    addedAt: (0, pg_core_1.timestamp)('added_at').defaultNow().notNull(),
    // Variação da receita (para serviços com tamanho de cabelo)
    variantId: (0, pg_core_1.uuid)('variant_id').references(() => exports.recipeVariants.id),
    // Package session consumption (when item is paid by package)
    clientPackageId: (0, pg_core_1.integer)('client_package_id').references(() => exports.clientPackages.id),
    clientPackageUsageId: (0, pg_core_1.integer)('client_package_usage_id'), // FK managed at app level (avoids circular ref)
    paidByPackage: (0, pg_core_1.boolean)('paid_by_package').default(false),
    canceledAt: (0, pg_core_1.timestamp)('canceled_at'),
    canceledById: (0, pg_core_1.uuid)('canceled_by_id').references(() => exports.users.id),
    cancelReason: (0, pg_core_1.text)('cancel_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Pagamentos da Comanda
 */
exports.commandPayments = (0, pg_core_1.pgTable)('command_payments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id).notNull(),
    // Campos legados (mantidos para compatibilidade)
    method: (0, pg_core_1.varchar)('method', { length: 30 }), // Agora opcional para novos pagamentos
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    // Novos campos para formas de pagamento configuráveis
    paymentMethodId: (0, pg_core_1.uuid)('payment_method_id').references(() => exports.paymentMethods.id),
    paymentDestinationId: (0, pg_core_1.uuid)('payment_destination_id').references(() => exports.paymentDestinations.id),
    // Valores bruto, taxa e líquido
    grossAmount: (0, pg_core_1.decimal)('gross_amount', { precision: 10, scale: 2 }),
    feeAmount: (0, pg_core_1.decimal)('fee_amount', { precision: 10, scale: 2 }).default('0'),
    netAmount: (0, pg_core_1.decimal)('net_amount', { precision: 10, scale: 2 }),
    receivedById: (0, pg_core_1.uuid)('received_by_id').references(() => exports.users.id).notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at').defaultNow().notNull(),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Eventos/Auditoria da Comanda
 */
exports.commandEvents = (0, pg_core_1.pgTable)('command_events', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id).notNull(),
    actorId: (0, pg_core_1.uuid)('actor_id').references(() => exports.users.id).notNull(),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 30 }).notNull(),
    metadata: (0, pg_core_1.json)('metadata').$type().default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Enums para Formas de Pagamento Configuráveis
 */
exports.paymentMethodTypeEnum = (0, pg_core_1.pgEnum)('payment_method_type', [
    'CASH',
    'PIX',
    'CARD_CREDIT',
    'CARD_DEBIT',
    'TRANSFER',
    'VOUCHER',
    'OTHER',
]);
exports.paymentDestinationTypeEnum = (0, pg_core_1.pgEnum)('payment_destination_type', [
    'BANK',
    'CARD_MACHINE',
    'CASH_DRAWER',
    'OTHER',
]);
exports.feeTypeEnum = (0, pg_core_1.pgEnum)('fee_type', ['DISCOUNT', 'FEE']);
exports.feeModeEnum = (0, pg_core_1.pgEnum)('fee_mode', ['PERCENT', 'FIXED']);
/**
 * Enums para Caixa
 */
exports.cashRegisterStatusEnum = (0, pg_core_1.pgEnum)('cash_register_status', ['OPEN', 'CLOSED']);
exports.cashMovementTypeEnum = (0, pg_core_1.pgEnum)('cash_movement_type', ['WITHDRAWAL', 'DEPOSIT']);
/**
 * Tabela de Caixas
 */
exports.cashRegisters = (0, pg_core_1.pgTable)('cash_registers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('OPEN').notNull(),
    openingBalance: (0, pg_core_1.decimal)('opening_balance', { precision: 10, scale: 2 }).default('0').notNull(),
    closingBalance: (0, pg_core_1.decimal)('closing_balance', { precision: 10, scale: 2 }),
    expectedBalance: (0, pg_core_1.decimal)('expected_balance', { precision: 10, scale: 2 }),
    difference: (0, pg_core_1.decimal)('difference', { precision: 10, scale: 2 }),
    totalSales: (0, pg_core_1.decimal)('total_sales', { precision: 10, scale: 2 }).default('0').notNull(),
    totalCash: (0, pg_core_1.decimal)('total_cash', { precision: 10, scale: 2 }).default('0').notNull(),
    totalCard: (0, pg_core_1.decimal)('total_card', { precision: 10, scale: 2 }).default('0').notNull(),
    totalPix: (0, pg_core_1.decimal)('total_pix', { precision: 10, scale: 2 }).default('0').notNull(),
    totalWithdrawals: (0, pg_core_1.decimal)('total_withdrawals', { precision: 10, scale: 2 }).default('0').notNull(),
    totalDeposits: (0, pg_core_1.decimal)('total_deposits', { precision: 10, scale: 2 }).default('0').notNull(),
    openedAt: (0, pg_core_1.timestamp)('opened_at').defaultNow().notNull(),
    openedById: (0, pg_core_1.uuid)('opened_by_id').references(() => exports.users.id).notNull(),
    closedAt: (0, pg_core_1.timestamp)('closed_at'),
    closedById: (0, pg_core_1.uuid)('closed_by_id').references(() => exports.users.id),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Movimentos do Caixa (Sangrias e Suprimentos)
 */
exports.cashMovements = (0, pg_core_1.pgTable)('cash_movements', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    cashRegisterId: (0, pg_core_1.uuid)('cash_register_id').references(() => exports.cashRegisters.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull(), // WITHDRAWAL ou DEPOSIT
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    performedById: (0, pg_core_1.uuid)('performed_by_id').references(() => exports.users.id).notNull(),
    performedAt: (0, pg_core_1.timestamp)('performed_at').defaultNow().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Formas de Pagamento Configuráveis
 */
exports.paymentMethods = (0, pg_core_1.pgTable)('payment_methods', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(), // CASH, PIX, CARD_CREDIT, CARD_DEBIT, TRANSFER, VOUCHER, OTHER
    // Regra de taxa/desconto
    feeType: (0, pg_core_1.varchar)('fee_type', { length: 20 }), // DISCOUNT ou FEE
    feeMode: (0, pg_core_1.varchar)('fee_mode', { length: 20 }), // PERCENT ou FIXED
    feeValue: (0, pg_core_1.decimal)('fee_value', { precision: 10, scale: 2 }).default('0'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Destinos do Dinheiro
 */
exports.paymentDestinations = (0, pg_core_1.pgTable)('payment_destinations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(), // BANK, CARD_MACHINE, CASH_DRAWER, OTHER
    // Metadados opcionais
    bankName: (0, pg_core_1.varchar)('bank_name', { length: 100 }),
    lastDigits: (0, pg_core_1.varchar)('last_digits', { length: 10 }),
    description: (0, pg_core_1.text)('description'),
    // Regra adicional de taxa (opcional, sobrescreve método)
    feeType: (0, pg_core_1.varchar)('fee_type', { length: 20 }),
    feeMode: (0, pg_core_1.varchar)('fee_mode', { length: 20 }),
    feeValue: (0, pg_core_1.decimal)('fee_value', { precision: 10, scale: 2 }).default('0'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    active: (0, pg_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Enum para status de comissao
 */
exports.commissionStatusEnum = (0, pg_core_1.pgEnum)('commission_status', ['PENDING', 'PAID', 'CANCELLED']);
/**
 * Tabela de Comissoes
 */
exports.commissions = (0, pg_core_1.pgTable)('commissions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id).notNull(),
    commandItemId: (0, pg_core_1.uuid)('command_item_id').references(() => exports.commandItems.id).notNull(),
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    itemDescription: (0, pg_core_1.varchar)('item_description', { length: 255 }).notNull(),
    itemValue: (0, pg_core_1.decimal)('item_value', { precision: 10, scale: 2 }).notNull(),
    commissionPercentage: (0, pg_core_1.decimal)('commission_percentage', { precision: 5, scale: 2 }).notNull(),
    commissionValue: (0, pg_core_1.decimal)('commission_value', { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    paidById: (0, pg_core_1.uuid)('paid_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ==================== MÓDULO DE FIDELIDADE & GAMIFICAÇÃO ====================
/**
 * Enum para tipo de transação de fidelidade
 */
exports.loyaltyTransactionTypeEnum = (0, pg_core_1.pgEnum)('loyalty_transaction_type', [
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
exports.rewardTypeEnum = (0, pg_core_1.pgEnum)('reward_type', [
    'DISCOUNT_VALUE',
    'DISCOUNT_PERCENT',
    'FREE_SERVICE',
    'FREE_PRODUCT',
    'GIFT',
]);
/**
 * Enum para status de resgate
 */
exports.redemptionStatusEnum = (0, pg_core_1.pgEnum)('redemption_status', [
    'PENDING',
    'USED',
    'EXPIRED',
    'CANCELLED',
]);
/**
 * Enum para tipo de evento de marketing
 */
exports.marketingEventTypeEnum = (0, pg_core_1.pgEnum)('marketing_event_type', [
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
exports.loyaltyPrograms = (0, pg_core_1.pgTable)('loyalty_programs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).default('Programa de Fidelidade').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    pointsPerRealService: (0, pg_core_1.decimal)('points_per_real_service', { precision: 5, scale: 2 }).default('1').notNull(),
    pointsPerRealProduct: (0, pg_core_1.decimal)('points_per_real_product', { precision: 5, scale: 2 }).default('1').notNull(),
    pointsExpireDays: (0, pg_core_1.integer)('points_expire_days'), // null = não expira
    minimumRedeemPoints: (0, pg_core_1.integer)('minimum_redeem_points').default(100).notNull(),
    welcomePoints: (0, pg_core_1.integer)('welcome_points').default(0).notNull(),
    birthdayPoints: (0, pg_core_1.integer)('birthday_points').default(0).notNull(),
    referralPoints: (0, pg_core_1.integer)('referral_points').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Níveis do Programa de Fidelidade
 */
exports.loyaltyTiers = (0, pg_core_1.pgTable)('loyalty_tiers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    programId: (0, pg_core_1.uuid)('program_id').references(() => exports.loyaltyPrograms.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull(),
    minPoints: (0, pg_core_1.integer)('min_points').default(0).notNull(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }).default('#6B7280').notNull(),
    icon: (0, pg_core_1.varchar)('icon', { length: 50 }),
    benefits: (0, pg_core_1.json)('benefits').$type().default({}),
    pointsMultiplier: (0, pg_core_1.decimal)('points_multiplier', { precision: 3, scale: 2 }).default('1').notNull(),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Recompensas Disponíveis
 */
exports.loyaltyRewards = (0, pg_core_1.pgTable)('loyalty_rewards', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    programId: (0, pg_core_1.uuid)('program_id').references(() => exports.loyaltyPrograms.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(), // DISCOUNT_VALUE, DISCOUNT_PERCENT, FREE_SERVICE, FREE_PRODUCT, GIFT
    pointsCost: (0, pg_core_1.integer)('points_cost').notNull(),
    value: (0, pg_core_1.decimal)('value', { precision: 10, scale: 2 }), // valor do desconto ou produto
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id),
    minTier: (0, pg_core_1.varchar)('min_tier', { length: 20 }), // nível mínimo para resgatar
    maxRedemptionsPerClient: (0, pg_core_1.integer)('max_redemptions_per_client'),
    totalAvailable: (0, pg_core_1.integer)('total_available'), // estoque de recompensas
    validDays: (0, pg_core_1.integer)('valid_days').default(30).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Contas de Fidelidade dos Clientes
 */
exports.clientLoyaltyAccounts = (0, pg_core_1.pgTable)('client_loyalty_accounts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull().unique(),
    programId: (0, pg_core_1.uuid)('program_id').references(() => exports.loyaltyPrograms.id).notNull(),
    currentPoints: (0, pg_core_1.integer)('current_points').default(0).notNull(),
    totalPointsEarned: (0, pg_core_1.integer)('total_points_earned').default(0).notNull(),
    totalPointsRedeemed: (0, pg_core_1.integer)('total_points_redeemed').default(0).notNull(),
    currentTierId: (0, pg_core_1.uuid)('current_tier_id').references(() => exports.loyaltyTiers.id),
    tierAchievedAt: (0, pg_core_1.timestamp)('tier_achieved_at'),
    nextTierProgress: (0, pg_core_1.integer)('next_tier_progress').default(0).notNull(),
    referralCode: (0, pg_core_1.varchar)('referral_code', { length: 20 }).notNull().unique(),
    referredById: (0, pg_core_1.uuid)('referred_by_id').references(() => exports.clients.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Tabela de Transações de Fidelidade
 */
exports.loyaltyTransactions = (0, pg_core_1.pgTable)('loyalty_transactions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.clientLoyaltyAccounts.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull(), // EARN, REDEEM, EXPIRE, ADJUST, BONUS, REFERRAL
    points: (0, pg_core_1.integer)('points').notNull(), // positivo para ganho, negativo para gasto
    balance: (0, pg_core_1.integer)('balance').notNull(), // saldo após transação
    description: (0, pg_core_1.varchar)('description', { length: 255 }).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    rewardId: (0, pg_core_1.uuid)('reward_id').references(() => exports.loyaltyRewards.id),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Resgates de Recompensas
 */
exports.loyaltyRedemptions = (0, pg_core_1.pgTable)('loyalty_redemptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.clientLoyaltyAccounts.id).notNull(),
    rewardId: (0, pg_core_1.uuid)('reward_id').references(() => exports.loyaltyRewards.id).notNull(),
    transactionId: (0, pg_core_1.uuid)('transaction_id').references(() => exports.loyaltyTransactions.id).notNull(),
    pointsSpent: (0, pg_core_1.integer)('points_spent').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(), // PENDING, USED, EXPIRED, CANCELLED
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull().unique(), // código do voucher gerado
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    usedInCommandId: (0, pg_core_1.uuid)('used_in_command_id').references(() => exports.commands.id),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Tabela de Eventos de Marketing
 */
exports.marketingEvents = (0, pg_core_1.pgTable)('marketing_events', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(),
    context: (0, pg_core_1.json)('context').$type().default({}),
    value: (0, pg_core_1.decimal)('value', { precision: 10, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== PRODUCT SUBSCRIPTIONS ====================
// Enum para frequência de assinatura de produto
exports.productSubscriptionFrequencyEnum = (0, pg_core_1.pgEnum)('product_subscription_frequency', [
    'MONTHLY',
    'BIMONTHLY',
    'QUARTERLY',
]);
// Enum para status da assinatura de produto
exports.productSubscriptionStatusEnum = (0, pg_core_1.pgEnum)('product_subscription_status', [
    'ACTIVE',
    'PAUSED',
    'CANCELLED',
    'EXPIRED',
]);
// Enum para tipo de entrega
exports.deliveryTypeEnum = (0, pg_core_1.pgEnum)('delivery_type', [
    'PICKUP',
    'DELIVERY',
]);
// Enum para status da entrega
exports.deliveryStatusEnum = (0, pg_core_1.pgEnum)('delivery_status', [
    'PENDING',
    'PREPARING',
    'READY',
    'DELIVERED',
    'CANCELLED',
]);
// Enum para método de pagamento de assinatura
exports.subscriptionPaymentMethodEnum = (0, pg_core_1.pgEnum)('subscription_payment_method', [
    'PIX',
    'CARD',
    'CASH_ON_DELIVERY',
]);
// Planos de assinatura de produtos
exports.productSubscriptionPlans = (0, pg_core_1.pgTable)('product_subscription_plans', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    billingPeriod: (0, pg_core_1.varchar)('billing_period', { length: 20 }).notNull().default('MONTHLY'),
    originalPrice: (0, pg_core_1.decimal)('original_price', { precision: 10, scale: 2 }).notNull(),
    discountPercent: (0, pg_core_1.decimal)('discount_percent', { precision: 5, scale: 2 }).default('0'),
    finalPrice: (0, pg_core_1.decimal)('final_price', { precision: 10, scale: 2 }).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    maxSubscribers: (0, pg_core_1.integer)('max_subscribers'),
    currentSubscribers: (0, pg_core_1.integer)('current_subscribers').default(0),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 500 }),
    benefits: (0, pg_core_1.json)('benefits').$type().default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Itens do plano de assinatura
exports.productSubscriptionItems = (0, pg_core_1.pgTable)('product_subscription_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    planId: (0, pg_core_1.uuid)('plan_id').references(() => exports.productSubscriptionPlans.id).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    quantity: (0, pg_core_1.decimal)('quantity', { precision: 10, scale: 2 }).default('1').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Assinaturas de clientes
exports.clientProductSubscriptions = (0, pg_core_1.pgTable)('client_product_subscriptions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull(),
    planId: (0, pg_core_1.uuid)('plan_id').references(() => exports.productSubscriptionPlans.id).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('ACTIVE'),
    deliveryType: (0, pg_core_1.varchar)('delivery_type', { length: 20 }).default('PICKUP'),
    deliveryAddress: (0, pg_core_1.text)('delivery_address'),
    startDate: (0, pg_core_1.date)('start_date').notNull(),
    nextDeliveryDate: (0, pg_core_1.date)('next_delivery_date').notNull(),
    lastDeliveryDate: (0, pg_core_1.date)('last_delivery_date'),
    totalDeliveries: (0, pg_core_1.integer)('total_deliveries').default(0),
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 20 }).default('PIX'),
    mercadoPagoSubscriptionId: (0, pg_core_1.varchar)('mercado_pago_subscription_id', { length: 255 }),
    notes: (0, pg_core_1.text)('notes'),
    pausedAt: (0, pg_core_1.timestamp)('paused_at'),
    pauseReason: (0, pg_core_1.text)('pause_reason'),
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at'),
    cancelReason: (0, pg_core_1.text)('cancel_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Entregas de assinaturas
exports.subscriptionDeliveries = (0, pg_core_1.pgTable)('subscription_deliveries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    subscriptionId: (0, pg_core_1.uuid)('subscription_id').references(() => exports.clientProductSubscriptions.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    scheduledDate: (0, pg_core_1.date)('scheduled_date').notNull(),
    deliveredDate: (0, pg_core_1.date)('delivered_date'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('PENDING'),
    deliveryType: (0, pg_core_1.varchar)('delivery_type', { length: 20 }).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id),
    totalAmount: (0, pg_core_1.decimal)('total_amount', { precision: 10, scale: 2 }).notNull(),
    notes: (0, pg_core_1.text)('notes'),
    preparedById: (0, pg_core_1.uuid)('prepared_by_id').references(() => exports.users.id),
    deliveredById: (0, pg_core_1.uuid)('delivered_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Itens da entrega
exports.subscriptionDeliveryItems = (0, pg_core_1.pgTable)('subscription_delivery_items', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    deliveryId: (0, pg_core_1.uuid)('delivery_id').references(() => exports.subscriptionDeliveries.id).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    quantity: (0, pg_core_1.decimal)('quantity', { precision: 10, scale: 2 }).notNull(),
    unitPrice: (0, pg_core_1.decimal)('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: (0, pg_core_1.decimal)('total_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== FASE D: UPSELL & COMÉRCIO CONVERSACIONAL ====================
// Enum para tipo de gatilho de upsell
exports.upsellTriggerTypeEnum = (0, pg_core_1.pgEnum)('upsell_trigger_type', [
    'SERVICE',
    'PRODUCT',
    'HAIR_PROFILE',
    'APPOINTMENT',
]);
// Enum para status da oferta de upsell
exports.upsellOfferStatusEnum = (0, pg_core_1.pgEnum)('upsell_offer_status', [
    'SHOWN',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED',
]);
// Enum para status do link de carrinho
exports.cartLinkStatusEnum = (0, pg_core_1.pgEnum)('cart_link_status', [
    'ACTIVE',
    'CONVERTED',
    'EXPIRED',
    'CANCELLED',
]);
// Enum para origem do link
exports.cartLinkSourceEnum = (0, pg_core_1.pgEnum)('cart_link_source', [
    'WHATSAPP',
    'SMS',
    'EMAIL',
    'MANUAL',
]);
// Enum para status da reserva
exports.reservationStatusEnum = (0, pg_core_1.pgEnum)('reservation_status', [
    'PENDING',
    'CONFIRMED',
    'READY',
    'DELIVERED',
    'CANCELLED',
]);
// Enum para tipo de entrega da reserva
exports.reservationDeliveryTypeEnum = (0, pg_core_1.pgEnum)('reservation_delivery_type', [
    'PICKUP',
    'DELIVERY',
]);
// Enum para status do teste A/B
exports.abTestStatusEnum = (0, pg_core_1.pgEnum)('ab_test_status', [
    'DRAFT',
    'RUNNING',
    'PAUSED',
    'COMPLETED',
]);
// Enum para tipo do teste A/B
exports.abTestTypeEnum = (0, pg_core_1.pgEnum)('ab_test_type', [
    'MESSAGE',
    'OFFER',
    'DISCOUNT',
    'TIMING',
]);
// Regras de Upsell
exports.upsellRules = (0, pg_core_1.pgTable)('upsell_rules', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    triggerType: (0, pg_core_1.varchar)('trigger_type', { length: 20 }).notNull(),
    triggerServiceIds: (0, pg_core_1.json)('trigger_service_ids').$type().default([]),
    triggerProductIds: (0, pg_core_1.json)('trigger_product_ids').$type().default([]),
    triggerHairTypes: (0, pg_core_1.json)('trigger_hair_types').$type().default([]),
    recommendedProducts: (0, pg_core_1.json)('recommended_products').$type().default([]),
    recommendedServices: (0, pg_core_1.json)('recommended_services').$type().default([]),
    displayMessage: (0, pg_core_1.text)('display_message'),
    discountPercent: (0, pg_core_1.decimal)('discount_percent', { precision: 5, scale: 2 }).default('0'),
    validFrom: (0, pg_core_1.date)('valid_from'),
    validUntil: (0, pg_core_1.date)('valid_until'),
    maxUsesTotal: (0, pg_core_1.integer)('max_uses_total'),
    maxUsesPerClient: (0, pg_core_1.integer)('max_uses_per_client'),
    currentUses: (0, pg_core_1.integer)('current_uses').default(0),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    priority: (0, pg_core_1.integer)('priority').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Ofertas de Upsell mostradas
exports.upsellOffers = (0, pg_core_1.pgTable)('upsell_offers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    ruleId: (0, pg_core_1.uuid)('rule_id').references(() => exports.upsellRules.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('SHOWN'),
    offeredProducts: (0, pg_core_1.json)('offered_products').$type().default([]),
    offeredServices: (0, pg_core_1.json)('offered_services').$type().default([]),
    totalOriginalPrice: (0, pg_core_1.decimal)('total_original_price', { precision: 10, scale: 2 }).notNull(),
    totalDiscountedPrice: (0, pg_core_1.decimal)('total_discounted_price', { precision: 10, scale: 2 }).notNull(),
    acceptedAt: (0, pg_core_1.timestamp)('accepted_at'),
    declinedAt: (0, pg_core_1.timestamp)('declined_at'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Links de Pré-carrinho
exports.cartLinks = (0, pg_core_1.pgTable)('cart_links', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull().unique(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }),
    items: (0, pg_core_1.json)('items').$type().default([]),
    totalAmount: (0, pg_core_1.decimal)('total_amount', { precision: 10, scale: 2 }).notNull(),
    discountAmount: (0, pg_core_1.decimal)('discount_amount', { precision: 10, scale: 2 }).default('0'),
    finalAmount: (0, pg_core_1.decimal)('final_amount', { precision: 10, scale: 2 }).notNull(),
    message: (0, pg_core_1.text)('message'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('ACTIVE'),
    convertedAt: (0, pg_core_1.timestamp)('converted_at'),
    convertedCommandId: (0, pg_core_1.uuid)('converted_command_id').references(() => exports.commands.id),
    source: (0, pg_core_1.varchar)('source', { length: 20 }).default('MANUAL'),
    campaignId: (0, pg_core_1.uuid)('campaign_id'),
    viewCount: (0, pg_core_1.integer)('view_count').default(0),
    lastViewedAt: (0, pg_core_1.timestamp)('last_viewed_at'),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Visualizações dos Links
exports.cartLinkViews = (0, pg_core_1.pgTable)('cart_link_views', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    cartLinkId: (0, pg_core_1.uuid)('cart_link_id').references(() => exports.cartLinks.id).notNull(),
    viewedAt: (0, pg_core_1.timestamp)('viewed_at').defaultNow().notNull(),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 50 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    convertedToReservation: (0, pg_core_1.boolean)('converted_to_reservation').default(false),
});
// Reservas de Produtos
exports.productReservations = (0, pg_core_1.pgTable)('product_reservations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }).notNull(),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }).notNull(),
    cartLinkId: (0, pg_core_1.uuid)('cart_link_id').references(() => exports.cartLinks.id),
    items: (0, pg_core_1.json)('items').$type().default([]),
    totalAmount: (0, pg_core_1.decimal)('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('PENDING'),
    deliveryType: (0, pg_core_1.varchar)('delivery_type', { length: 20 }).default('PICKUP'),
    deliveryAddress: (0, pg_core_1.text)('delivery_address'),
    scheduledPickupDate: (0, pg_core_1.date)('scheduled_pickup_date'),
    notes: (0, pg_core_1.text)('notes'),
    confirmedAt: (0, pg_core_1.timestamp)('confirmed_at'),
    confirmedById: (0, pg_core_1.uuid)('confirmed_by_id').references(() => exports.users.id),
    readyAt: (0, pg_core_1.timestamp)('ready_at'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at'),
    cancellationReason: (0, pg_core_1.text)('cancellation_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Testes A/B
exports.abTests = (0, pg_core_1.pgTable)('ab_tests', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('DRAFT'),
    variantA: (0, pg_core_1.json)('variant_a').$type().default({}),
    variantB: (0, pg_core_1.json)('variant_b').$type().default({}),
    variantAViews: (0, pg_core_1.integer)('variant_a_views').default(0),
    variantAConversions: (0, pg_core_1.integer)('variant_a_conversions').default(0),
    variantBViews: (0, pg_core_1.integer)('variant_b_views').default(0),
    variantBConversions: (0, pg_core_1.integer)('variant_b_conversions').default(0),
    winningVariant: (0, pg_core_1.varchar)('winning_variant', { length: 1 }),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    endedAt: (0, pg_core_1.timestamp)('ended_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Atribuições de Teste A/B
exports.abTestAssignments = (0, pg_core_1.pgTable)('ab_test_assignments', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    testId: (0, pg_core_1.uuid)('test_id').references(() => exports.abTests.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }),
    variant: (0, pg_core_1.varchar)('variant', { length: 1 }).notNull(),
    converted: (0, pg_core_1.boolean)('converted').default(false),
    convertedAt: (0, pg_core_1.timestamp)('converted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== FASE E: IA ASSISTENTE ====================
// Insights gerados pela IA
exports.aiInsights = (0, pg_core_1.pgTable)('ai_insights', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(), // DAILY_BRIEFING, ALERT, OPPORTUNITY, TASK, TIP, CLIENT_INSIGHT
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    priority: (0, pg_core_1.varchar)('priority', { length: 10 }).notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
    category: (0, pg_core_1.varchar)('category', { length: 20 }).notNull().default('GENERAL'), // SALES, CLIENTS, INVENTORY, TEAM, FINANCE, SCHEDULE
    data: (0, pg_core_1.json)('data').$type(),
    actionUrl: (0, pg_core_1.varchar)('action_url', { length: 255 }),
    actionLabel: (0, pg_core_1.varchar)('action_label', { length: 100 }),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    isDismissed: (0, pg_core_1.boolean)('is_dismissed').default(false),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ==================== BELLE - IA DO DASHBOARD ====================
// Conversas com a Belle (chat do dashboard)
exports.dashboardConversations = (0, pg_core_1.pgTable)('dashboard_conversations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 10 }).notNull(), // user, assistant
    content: (0, pg_core_1.text)('content').notNull(),
    context: (0, pg_core_1.json)('context').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Configurações da Belle por salão
exports.dashboardSettings = (0, pg_core_1.pgTable)('dashboard_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(true),
    assistantName: (0, pg_core_1.varchar)('assistant_name', { length: 50 }).default('Belle'),
    personality: (0, pg_core_1.varchar)('personality', { length: 20 }).default('FRIENDLY'), // FRIENDLY, PROFESSIONAL, CASUAL
    dailyBriefingEnabled: (0, pg_core_1.boolean)('daily_briefing_enabled').default(true),
    dailyBriefingTime: (0, pg_core_1.varchar)('daily_briefing_time', { length: 5 }).default('08:00'),
    alertsEnabled: (0, pg_core_1.boolean)('alerts_enabled').default(true),
    tipsEnabled: (0, pg_core_1.boolean)('tips_enabled').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Notas sobre clientes geradas/assistidas pela IA
exports.clientNotesAi = (0, pg_core_1.pgTable)('client_notes_ai', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id).notNull(),
    noteType: (0, pg_core_1.varchar)('note_type', { length: 20 }).notNull(), // PREFERENCE, ALLERGY, PERSONALITY, IMPORTANT
    content: (0, pg_core_1.text)('content').notNull(),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ==================== ALEXIS - IA PARA WHATSAPP & DASHBOARD ====================
// Enum para status da sessão ALEXIS
exports.alexisSessionStatusEnum = (0, pg_core_1.pgEnum)('alexis_session_status', [
    'ACTIVE',
    'HUMAN_CONTROL',
    'PAUSED',
    'ENDED',
]);
// Enum para modo de controle
exports.alexisControlModeEnum = (0, pg_core_1.pgEnum)('alexis_control_mode', [
    'AI', // ALEXIS respondendo
    'HUMAN', // Humano respondendo (#eu)
    'HYBRID', // Colaborativo
]);
// Enum para tipo de mensagem ALEXIS
exports.alexisMessageTypeEnum = (0, pg_core_1.pgEnum)('alexis_message_type', [
    'TEXT',
    'AUDIO',
    'IMAGE',
    'DOCUMENT',
    'LOCATION',
    'CONTACT',
    'TEMPLATE',
]);
// Enum para direção da mensagem
exports.alexisMessageDirectionEnum = (0, pg_core_1.pgEnum)('alexis_message_direction', [
    'INBOUND', // Cliente -> Salão
    'OUTBOUND', // Salão -> Cliente
]);
// Enum para nível de risco de compliance
exports.alexisComplianceRiskEnum = (0, pg_core_1.pgEnum)('alexis_compliance_risk', [
    'NONE',
    'LOW',
    'MEDIUM',
    'HIGH',
    'BLOCKED',
]);
// Enum para tipo de violação
exports.alexisViolationTypeEnum = (0, pg_core_1.pgEnum)('alexis_violation_type', [
    'MEDICAL_ADVICE', // Conselho médico (ANVISA)
    'PRESCRIPTION', // Prescrição medicamentosa
    'HEALTH_CLAIM', // Alegações de saúde não autorizadas
    'PERSONAL_DATA', // Vazamento de dados pessoais (LGPD)
    'UNAUTHORIZED_SHARE', // Compartilhamento não autorizado
    'PROFANITY', // Linguagem imprópria
    'DISCRIMINATION', // Discriminação
    'SPAM', // Spam/Marketing agressivo
]);
// Configurações do ALEXIS por salão
exports.alexisSettings = (0, pg_core_1.pgTable)('alexis_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(true),
    assistantName: (0, pg_core_1.varchar)('assistant_name', { length: 50 }).default('ALEXIS'),
    welcomeMessage: (0, pg_core_1.text)('welcome_message').default('Olá! Sou ALEXIS, assistente virtual do salão. Como posso ajudar?'),
    personality: (0, pg_core_1.varchar)('personality', { length: 20 }).default('PROFESSIONAL'),
    language: (0, pg_core_1.varchar)('language', { length: 10 }).default('pt-BR'),
    // Compliance ANVISA/LGPD
    complianceLevel: (0, pg_core_1.varchar)('compliance_level', { length: 10 }).default('STRICT'), // STRICT, MODERATE, RELAXED
    anvisaWarningsEnabled: (0, pg_core_1.boolean)('anvisa_warnings_enabled').default(true),
    lgpdConsentRequired: (0, pg_core_1.boolean)('lgpd_consent_required').default(true),
    dataRetentionDays: (0, pg_core_1.integer)('data_retention_days').default(365),
    // Controle de IA
    autoResponseEnabled: (0, pg_core_1.boolean)('auto_response_enabled').default(true),
    maxResponsesPerMinute: (0, pg_core_1.integer)('max_responses_per_minute').default(10),
    humanTakeoverKeywords: (0, pg_core_1.json)('human_takeover_keywords').$type().default(['#eu', 'falar com humano', 'atendente']),
    aiResumeKeywords: (0, pg_core_1.json)('ai_resume_keywords').$type().default(['#ia', 'voltar alexis', 'voltar robô']),
    // Horários de atendimento
    operatingHoursEnabled: (0, pg_core_1.boolean)('operating_hours_enabled').default(false),
    operatingHoursStart: (0, pg_core_1.varchar)('operating_hours_start', { length: 5 }).default('08:00'),
    operatingHoursEnd: (0, pg_core_1.varchar)('operating_hours_end', { length: 5 }).default('20:00'),
    outOfHoursMessage: (0, pg_core_1.text)('out_of_hours_message').default('Estamos fora do horário de atendimento. Retornaremos em breve!'),
    // Integrações
    whatsappIntegrationId: (0, pg_core_1.varchar)('whatsapp_integration_id', { length: 255 }),
    webhookUrl: (0, pg_core_1.varchar)('webhook_url', { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Sessões de conversa ALEXIS
exports.alexisSessions = (0, pg_core_1.pgTable)('alexis_sessions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }).notNull(),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('ACTIVE'),
    controlMode: (0, pg_core_1.varchar)('control_mode', { length: 10 }).notNull().default('AI'),
    // Consentimento LGPD
    lgpdConsentGiven: (0, pg_core_1.boolean)('lgpd_consent_given').default(false),
    lgpdConsentAt: (0, pg_core_1.timestamp)('lgpd_consent_at'),
    // Contexto da conversa
    context: (0, pg_core_1.json)('context').$type().default({}),
    // Métricas
    messageCount: (0, pg_core_1.integer)('message_count').default(0),
    aiResponseCount: (0, pg_core_1.integer)('ai_response_count').default(0),
    humanResponseCount: (0, pg_core_1.integer)('human_response_count').default(0),
    // Controle
    lastMessageAt: (0, pg_core_1.timestamp)('last_message_at'),
    humanTakeoverAt: (0, pg_core_1.timestamp)('human_takeover_at'),
    humanTakeoverById: (0, pg_core_1.uuid)('human_takeover_by_id').references(() => exports.users.id),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    endedAt: (0, pg_core_1.timestamp)('ended_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Mensagens ALEXIS
exports.alexisMessages = (0, pg_core_1.pgTable)('alexis_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.alexisSessions.id).notNull(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    direction: (0, pg_core_1.varchar)('direction', { length: 10 }).notNull(), // INBOUND, OUTBOUND
    messageType: (0, pg_core_1.varchar)('message_type', { length: 20 }).notNull().default('TEXT'),
    content: (0, pg_core_1.text)('content').notNull(),
    mediaUrl: (0, pg_core_1.varchar)('media_url', { length: 500 }),
    // Quem respondeu
    respondedBy: (0, pg_core_1.varchar)('responded_by', { length: 10 }).notNull(), // AI, HUMAN
    respondedById: (0, pg_core_1.uuid)('responded_by_id').references(() => exports.users.id),
    // Compliance - 3 camadas
    preProcessingCheck: (0, pg_core_1.json)('pre_processing_check').$type(),
    aiProcessingCheck: (0, pg_core_1.json)('ai_processing_check').$type(),
    postProcessingCheck: (0, pg_core_1.json)('post_processing_check').$type(),
    complianceRisk: (0, pg_core_1.varchar)('compliance_risk', { length: 10 }).default('NONE'),
    // WhatsApp metadata
    whatsappMessageId: (0, pg_core_1.varchar)('whatsapp_message_id', { length: 100 }),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Logs de compliance ALEXIS
exports.alexisComplianceLogs = (0, pg_core_1.pgTable)('alexis_compliance_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.alexisSessions.id),
    messageId: (0, pg_core_1.uuid)('message_id').references(() => exports.alexisMessages.id),
    violationType: (0, pg_core_1.varchar)('violation_type', { length: 30 }).notNull(),
    riskLevel: (0, pg_core_1.varchar)('risk_level', { length: 10 }).notNull(),
    originalContent: (0, pg_core_1.text)('original_content').notNull(),
    sanitizedContent: (0, pg_core_1.text)('sanitized_content'),
    detectionLayer: (0, pg_core_1.varchar)('detection_layer', { length: 20 }).notNull(), // PRE, DURING, POST
    action: (0, pg_core_1.varchar)('action', { length: 20 }).notNull(), // BLOCKED, FLAGGED, SANITIZED, ALLOWED
    details: (0, pg_core_1.json)('details').$type(),
    reviewedById: (0, pg_core_1.uuid)('reviewed_by_id').references(() => exports.users.id),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at'),
    reviewNotes: (0, pg_core_1.text)('review_notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Takeovers humanos
exports.alexisHumanTakeovers = (0, pg_core_1.pgTable)('alexis_human_takeovers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.alexisSessions.id).notNull(),
    takenOverById: (0, pg_core_1.uuid)('taken_over_by_id').references(() => exports.users.id).notNull(),
    reason: (0, pg_core_1.varchar)('reason', { length: 50 }).notNull(), // COMMAND, KEYWORD, MANUAL, ESCALATION
    triggerMessage: (0, pg_core_1.text)('trigger_message'),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    endedAt: (0, pg_core_1.timestamp)('ended_at'),
    // Resumo do atendimento humano
    messagesDuringTakeover: (0, pg_core_1.integer)('messages_during_takeover').default(0),
    resolution: (0, pg_core_1.text)('resolution'),
    returnedToAi: (0, pg_core_1.boolean)('returned_to_ai').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Palavras-chave bloqueadas (ANVISA/LGPD)
exports.alexisBlockedKeywords = (0, pg_core_1.pgTable)('alexis_blocked_keywords', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id), // null = global
    keyword: (0, pg_core_1.varchar)('keyword', { length: 100 }).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 30 }).notNull(), // ANVISA, LGPD, PROFANITY, CUSTOM
    violationType: (0, pg_core_1.varchar)('violation_type', { length: 30 }).notNull(),
    severity: (0, pg_core_1.varchar)('severity', { length: 10 }).notNull().default('HIGH'), // LOW, MEDIUM, HIGH, CRITICAL
    action: (0, pg_core_1.varchar)('action', { length: 20 }).notNull().default('BLOCK'), // BLOCK, WARN, FLAG, SANITIZE
    replacement: (0, pg_core_1.text)('replacement'), // Texto de substituição se action = SANITIZE
    warningMessage: (0, pg_core_1.text)('warning_message'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Templates de respostas ALEXIS
exports.alexisResponseTemplates = (0, pg_core_1.pgTable)('alexis_response_templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 30 }).notNull(), // GREETING, SCHEDULING, SERVICES, PRICES, HOURS, FAQ, GOODBYE
    triggerKeywords: (0, pg_core_1.json)('trigger_keywords').$type().default([]),
    content: (0, pg_core_1.text)('content').notNull(),
    variables: (0, pg_core_1.json)('variables').$type().default([]), // {{client_name}}, {{salon_name}}, etc.
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    usageCount: (0, pg_core_1.integer)('usage_count').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Métricas diárias ALEXIS
exports.alexisDailyMetrics = (0, pg_core_1.pgTable)('alexis_daily_metrics', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    date: (0, pg_core_1.date)('date').notNull(),
    totalSessions: (0, pg_core_1.integer)('total_sessions').default(0),
    totalMessages: (0, pg_core_1.integer)('total_messages').default(0),
    aiResponses: (0, pg_core_1.integer)('ai_responses').default(0),
    humanResponses: (0, pg_core_1.integer)('human_responses').default(0),
    humanTakeovers: (0, pg_core_1.integer)('human_takeovers').default(0),
    avgResponseTime: (0, pg_core_1.decimal)('avg_response_time', { precision: 10, scale: 2 }), // segundos
    complianceBlocks: (0, pg_core_1.integer)('compliance_blocks').default(0),
    complianceFlags: (0, pg_core_1.integer)('compliance_flags').default(0),
    appointmentsBooked: (0, pg_core_1.integer)('appointments_booked').default(0),
    questionsAnswered: (0, pg_core_1.integer)('questions_answered').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== AI TABLES - ALEXIS V2 (WHATSAPP & DASHBOARD) ====================
// Enum para status da conversa AI
exports.aiConversationStatusEnum = (0, pg_core_1.pgEnum)('ai_conversation_status', [
    'AI_ACTIVE', // Alexis respondendo
    'HUMAN_ACTIVE', // Atendente respondendo (#eu)
    'CLOSED', // Conversa encerrada
]);
// Enum para role de mensagem AI
exports.aiMessageRoleEnum = (0, pg_core_1.pgEnum)('ai_message_role', [
    'client', // Mensagem do cliente
    'ai', // Resposta da Alexis
    'human', // Resposta do atendente
    'system', // Mensagem de sistema (#eu, #ia)
]);
// Enum para intenção detectada
exports.aiIntentEnum = (0, pg_core_1.pgEnum)('ai_intent', [
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
exports.aiSettings = (0, pg_core_1.pgTable)('ai_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(true),
    assistantName: (0, pg_core_1.varchar)('assistant_name', { length: 50 }).default('Alexis'),
    // Mensagens customizáveis
    greetingMessage: (0, pg_core_1.text)('greeting_message').default('Olá! Sou a Alexis, assistente virtual do salão. Como posso ajudar? 😊'),
    humanTakeoverMessage: (0, pg_core_1.text)('human_takeover_message').default('Ops! Agora você será atendida por alguém da nossa equipe. Estou por aqui se precisar depois. 😊'),
    aiResumeMessage: (0, pg_core_1.text)('ai_resume_message').default('Voltei! Se quiser, posso continuar te ajudando por aqui. 💇‍♀️'),
    // Comandos de controle
    humanTakeoverCommand: (0, pg_core_1.varchar)('human_takeover_command', { length: 20 }).default('#eu'),
    aiResumeCommand: (0, pg_core_1.varchar)('ai_resume_command', { length: 20 }).default('#ia'),
    // Funcionalidades
    autoSchedulingEnabled: (0, pg_core_1.boolean)('auto_scheduling_enabled').default(true),
    // Horário de funcionamento
    workingHoursStart: (0, pg_core_1.varchar)('working_hours_start', { length: 5 }).default('08:00'),
    workingHoursEnd: (0, pg_core_1.varchar)('working_hours_end', { length: 5 }).default('20:00'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Conversas WhatsApp
exports.aiConversations = (0, pg_core_1.pgTable)('ai_conversations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }).notNull(),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }),
    // Status: AI_ACTIVE, HUMAN_ACTIVE, CLOSED
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('AI_ACTIVE'),
    // Atendente que assumiu (#eu)
    humanAgentId: (0, pg_core_1.uuid)('human_agent_id').references(() => exports.users.id),
    humanTakeoverAt: (0, pg_core_1.timestamp)('human_takeover_at'),
    aiResumedAt: (0, pg_core_1.timestamp)('ai_resumed_at'),
    lastMessageAt: (0, pg_core_1.timestamp)('last_message_at'),
    messagesCount: (0, pg_core_1.integer)('messages_count').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Mensagens da conversa
exports.aiMessages = (0, pg_core_1.pgTable)('ai_messages', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    conversationId: (0, pg_core_1.uuid)('conversation_id').references(() => exports.aiConversations.id).notNull(),
    // Role: client, ai, human, system
    role: (0, pg_core_1.varchar)('role', { length: 10 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    // Intenção detectada
    intent: (0, pg_core_1.varchar)('intent', { length: 30 }),
    // Compliance
    wasBlocked: (0, pg_core_1.boolean)('was_blocked').default(false),
    blockReason: (0, pg_core_1.varchar)('block_reason', { length: 50 }),
    // Flag para comandos (#eu, #ia) - NÃO são enviados ao cliente
    isCommand: (0, pg_core_1.boolean)('is_command').default(false),
    // Metadata adicional
    metadata: (0, pg_core_1.json)('metadata').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Logs de interação (auditoria)
exports.aiInteractionLogs = (0, pg_core_1.pgTable)('ai_interaction_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    conversationId: (0, pg_core_1.uuid)('conversation_id').references(() => exports.aiConversations.id),
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }).notNull(),
    messageIn: (0, pg_core_1.text)('message_in').notNull(),
    messageOut: (0, pg_core_1.text)('message_out').notNull(),
    intent: (0, pg_core_1.varchar)('intent', { length: 30 }),
    wasBlocked: (0, pg_core_1.boolean)('was_blocked').default(false),
    blockReason: (0, pg_core_1.varchar)('block_reason', { length: 50 }),
    tokensUsed: (0, pg_core_1.integer)('tokens_used'),
    responseTimeMs: (0, pg_core_1.integer)('response_time_ms'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Log de termos bloqueados (ANVISA/LGPD)
exports.aiBlockedTermsLog = (0, pg_core_1.pgTable)('ai_blocked_terms_log', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    conversationId: (0, pg_core_1.uuid)('conversation_id').references(() => exports.aiConversations.id),
    originalMessage: (0, pg_core_1.text)('original_message').notNull(),
    blockedTerms: (0, pg_core_1.json)('blocked_terms').$type().notNull(),
    // Camada: INPUT (antes da IA) ou OUTPUT (resposta da IA)
    layer: (0, pg_core_1.varchar)('layer', { length: 10 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Briefings do dashboard
exports.aiBriefings = (0, pg_core_1.pgTable)('ai_briefings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    userRole: (0, pg_core_1.varchar)('user_role', { length: 20 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    // Dados usados para gerar o briefing
    data: (0, pg_core_1.json)('data').$type(),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Contatos da Alexis (DELTA - humanizacao)
exports.alexisContacts = (0, pg_core_1.pgTable)('alexis_contacts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at').defaultNow().notNull(),
    lastGreetedAt: (0, pg_core_1.timestamp)('last_greeted_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    salonPhoneUnique: (0, pg_core_1.unique)().on(table.salonId, table.phone),
}));
// ============================================
// APPOINTMENT NOTIFICATIONS (Notificações WhatsApp)
// ============================================
/**
 * Tipo de notificação de agendamento
 */
exports.appointmentNotificationTypeEnum = (0, pg_core_1.pgEnum)('appointment_notification_type', [
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
exports.notificationStatusEnum = (0, pg_core_1.pgEnum)('notification_status', [
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
exports.appointmentNotifications = (0, pg_core_1.pgTable)('appointment_notifications', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Referência ao agendamento
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    // Destinatário
    recipientPhone: (0, pg_core_1.varchar)('recipient_phone', { length: 20 }).notNull(),
    recipientName: (0, pg_core_1.varchar)('recipient_name', { length: 255 }),
    // Tipo e conteúdo
    notificationType: (0, exports.appointmentNotificationTypeEnum)('notification_type').notNull(),
    templateKey: (0, pg_core_1.varchar)('template_key', { length: 100 }),
    templateVariables: (0, pg_core_1.json)('template_variables').$type(),
    customMessage: (0, pg_core_1.text)('custom_message'),
    // Agendamento
    scheduledFor: (0, pg_core_1.timestamp)('scheduled_for').notNull(),
    // Status e rastreamento
    status: (0, exports.notificationStatusEnum)('status').default('PENDING').notNull(),
    providerMessageId: (0, pg_core_1.varchar)('provider_message_id', { length: 255 }),
    // Tentativas e erros
    attempts: (0, pg_core_1.integer)('attempts').default(0).notNull(),
    maxAttempts: (0, pg_core_1.integer)('max_attempts').default(3).notNull(),
    lastAttemptAt: (0, pg_core_1.timestamp)('last_attempt_at'),
    lastError: (0, pg_core_1.text)('last_error'),
    // Entrega
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    // Resposta do cliente (para confirmações)
    clientResponse: (0, pg_core_1.varchar)('client_response', { length: 50 }),
    clientRespondedAt: (0, pg_core_1.timestamp)('client_responded_at'),
    // Auditoria
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    processedAt: (0, pg_core_1.timestamp)('processed_at'),
    // PILAR 2: Idempotência
    dedupeKey: (0, pg_core_1.varchar)('dedupe_key', { length: 255 }), // Chave única para evitar duplicação
    processingStartedAt: (0, pg_core_1.timestamp)('processing_started_at'),
    processingWorkerId: (0, pg_core_1.varchar)('processing_worker_id', { length: 50 }),
});
// ============================================
// SISTEMA DE TRIAGEM (Pré-Avaliação Digital)
// ============================================
/**
 * Categoria de risco para perguntas de triagem
 */
exports.triageRiskCategoryEnum = (0, pg_core_1.pgEnum)('triage_risk_category', [
    'CHEMICAL_HISTORY', // Histórico químico
    'HEALTH_CONDITION', // Condições de saúde
    'HAIR_INTEGRITY', // Integridade do fio
    'ALLERGY', // Alergias
    'CUSTOM', // Personalizada
]);
/**
 * Nível de risco
 */
exports.riskLevelEnum = (0, pg_core_1.pgEnum)('risk_level', [
    'CRITICAL', // Vermelho - Proíbe o procedimento
    'HIGH', // Laranja - Requer atenção especial
    'MEDIUM', // Amarelo - Cuidado
    'LOW', // Verde - Informativo
]);
/**
 * Formulários de triagem por tipo de serviço
 */
exports.triageForms = (0, pg_core_1.pgTable)('triage_forms', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Identificação
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    // Vinculação a serviços
    serviceCategory: (0, pg_core_1.varchar)('service_category', { length: 100 }),
    serviceIds: (0, pg_core_1.json)('service_ids').$type(),
    // Versionamento
    version: (0, pg_core_1.integer)('version').default(1).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    // Termo de responsabilidade
    consentTitle: (0, pg_core_1.varchar)('consent_title', { length: 255 }).default('TERMO DE RESPONSABILIDADE E VERACIDADE'),
    consentText: (0, pg_core_1.text)('consent_text').notNull(),
    requiresConsent: (0, pg_core_1.boolean)('requires_consent').default(true).notNull(),
    // Auditoria
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Perguntas do formulário de triagem
 */
exports.triageQuestions = (0, pg_core_1.pgTable)('triage_questions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    formId: (0, pg_core_1.uuid)('form_id').references(() => exports.triageForms.id, { onDelete: 'cascade' }).notNull(),
    // Categorização
    category: (0, exports.triageRiskCategoryEnum)('category').notNull(),
    categoryLabel: (0, pg_core_1.varchar)('category_label', { length: 150 }),
    // Pergunta
    questionText: (0, pg_core_1.text)('question_text').notNull(),
    helpText: (0, pg_core_1.text)('help_text'),
    // Tipo de resposta
    answerType: (0, pg_core_1.varchar)('answer_type', { length: 20 }).default('BOOLEAN').notNull(),
    options: (0, pg_core_1.json)('options').$type(),
    // Risco associado
    riskLevel: (0, exports.riskLevelEnum)('risk_level').default('MEDIUM').notNull(),
    riskTriggerValue: (0, pg_core_1.varchar)('risk_trigger_value', { length: 50 }).default('SIM'),
    riskMessage: (0, pg_core_1.text)('risk_message'),
    // Ação quando risco detectado
    blocksProcedure: (0, pg_core_1.boolean)('blocks_procedure').default(false),
    requiresNote: (0, pg_core_1.boolean)('requires_note').default(false),
    // Ordenação
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0).notNull(),
    isRequired: (0, pg_core_1.boolean)('is_required').default(true).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Respostas do cliente por agendamento
 */
exports.triageResponses = (0, pg_core_1.pgTable)('triage_responses', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Vínculos
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id).notNull(),
    formId: (0, pg_core_1.uuid)('form_id').references(() => exports.triageForms.id).notNull(),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    // Dados do formulário no momento (snapshot)
    formVersion: (0, pg_core_1.integer)('form_version').notNull(),
    // Status
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    // Análise de risco
    hasRisks: (0, pg_core_1.boolean)('has_risks').default(false),
    riskSummary: (0, pg_core_1.json)('risk_summary').$type(),
    overallRiskLevel: (0, exports.riskLevelEnum)('overall_risk_level'),
    // Consentimento
    consentAccepted: (0, pg_core_1.boolean)('consent_accepted').default(false),
    consentAcceptedAt: (0, pg_core_1.timestamp)('consent_accepted_at'),
    consentIpAddress: (0, pg_core_1.varchar)('consent_ip_address', { length: 45 }),
    // Metadados
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    completedVia: (0, pg_core_1.varchar)('completed_via', { length: 20 }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    // Token para acesso público (LEGACY - usar tokenHash)
    accessToken: (0, pg_core_1.varchar)('access_token', { length: 64 }),
    // PILAR 1: Segurança do Token
    tokenHash: (0, pg_core_1.varchar)('token_hash', { length: 64 }), // SHA-256 do token
    usedAt: (0, pg_core_1.timestamp)('used_at'), // Marca uso único
    accessAttempts: (0, pg_core_1.integer)('access_attempts').default(0),
    lastAccessIp: (0, pg_core_1.varchar)('last_access_ip', { length: 45 }),
    lastAccessUserAgent: (0, pg_core_1.text)('last_access_user_agent'),
    invalidatedAt: (0, pg_core_1.timestamp)('invalidated_at'),
    invalidatedReason: (0, pg_core_1.varchar)('invalidated_reason', { length: 100 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Respostas individuais de cada pergunta
 */
exports.triageAnswers = (0, pg_core_1.pgTable)('triage_answers', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    responseId: (0, pg_core_1.uuid)('response_id').references(() => exports.triageResponses.id, { onDelete: 'cascade' }).notNull(),
    questionId: (0, pg_core_1.uuid)('question_id').references(() => exports.triageQuestions.id).notNull(),
    // Resposta
    answerValue: (0, pg_core_1.varchar)('answer_value', { length: 255 }),
    answerText: (0, pg_core_1.text)('answer_text'),
    // Risco detectado nesta resposta
    triggeredRisk: (0, pg_core_1.boolean)('triggered_risk').default(false),
    riskLevel: (0, exports.riskLevelEnum)('risk_level'),
    riskMessage: (0, pg_core_1.text)('risk_message'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ============================================
// PILAR 3: EXTENSÕES DE AUDITORIA
// ============================================
/**
 * Overrides de triagem
 * Quando profissional ignora alertas de triagem com justificativa
 */
exports.triageOverrides = (0, pg_core_1.pgTable)('triage_overrides', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    triageId: (0, pg_core_1.uuid)('triage_id').references(() => exports.triageResponses.id).notNull(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id).notNull(),
    // Quem autorizou
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    userName: (0, pg_core_1.varchar)('user_name', { length: 255 }).notNull(),
    userRole: (0, pg_core_1.varchar)('user_role', { length: 50 }).notNull(),
    // Justificativa obrigatória (mínimo 20 caracteres enforçado no service)
    reason: (0, pg_core_1.text)('reason').notNull(),
    // Rastreabilidade
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    overriddenAt: (0, pg_core_1.timestamp)('overridden_at').defaultNow().notNull(),
});
/**
 * Pendências de estoque
 * Quando quantidade é insuficiente no momento do consumo
 */
exports.stockAdjustmentsPending = (0, pg_core_1.pgTable)('stock_adjustments_pending', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    commandId: (0, pg_core_1.uuid)('command_id').references(() => exports.commands.id),
    commandItemId: (0, pg_core_1.uuid)('command_item_id').references(() => exports.commandItems.id),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    quantityNeeded: (0, pg_core_1.decimal)('quantity_needed', { precision: 10, scale: 3 }).notNull(),
    quantityAvailable: (0, pg_core_1.decimal)('quantity_available', { precision: 10, scale: 3 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    resolvedById: (0, pg_core_1.uuid)('resolved_by_id').references(() => exports.users.id),
    resolutionNote: (0, pg_core_1.text)('resolution_note'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// ==================== MÓDULO DE AGENDAMENTO ONLINE ====================
/**
 * Configurações de Agendamento Online por Salão
 * Controla todas as regras e preferências do sistema de booking online
 */
exports.onlineBookingSettings = (0, pg_core_1.pgTable)('online_booking_settings', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull().unique(),
    // Habilitação geral
    enabled: (0, pg_core_1.boolean)('enabled').default(false).notNull(),
    // Modo de operação
    operationMode: (0, exports.operationModeEnum)('operation_mode').default('SECRETARY_ONLY'),
    // Antecedência de agendamento
    minAdvanceHours: (0, pg_core_1.integer)('min_advance_hours').default(2).notNull(),
    maxAdvanceDays: (0, pg_core_1.integer)('max_advance_days').default(30).notNull(),
    // Intervalo entre slots
    slotIntervalMinutes: (0, pg_core_1.integer)('slot_interval_minutes').default(30),
    // Permitir agendamento no mesmo dia
    allowSameDayBooking: (0, pg_core_1.boolean)('allow_same_day_booking').default(true),
    // Duração do hold (reserva temporária)
    holdDurationMinutes: (0, pg_core_1.integer)('hold_duration_minutes').default(10).notNull(),
    // Política de cancelamento
    cancellationHours: (0, pg_core_1.integer)('cancellation_hours').default(24).notNull(),
    cancellationPolicy: (0, pg_core_1.text)('cancellation_policy'),
    allowRescheduling: (0, pg_core_1.boolean)('allow_rescheduling').default(true).notNull(),
    maxReschedules: (0, pg_core_1.integer)('max_reschedules').default(2).notNull(),
    // Verificação de telefone
    requirePhoneVerification: (0, pg_core_1.boolean)('require_phone_verification').default(true).notNull(),
    // Depósito/sinal
    requireDeposit: (0, pg_core_1.boolean)('require_deposit').default(false).notNull(),
    depositType: (0, pg_core_1.varchar)('deposit_type', { length: 20 }).default('NONE'), // NONE, FIXED, PERCENTAGE
    depositValue: (0, pg_core_1.decimal)('deposit_value', { precision: 10, scale: 2 }).default('0'),
    depositMinServices: (0, pg_core_1.decimal)('deposit_min_services', { precision: 10, scale: 2 }).default('100'),
    depositAppliesTo: (0, exports.depositAppliesToEnum)('deposit_applies_to').default('ALL'),
    // Regras para novos clientes
    allowNewClients: (0, pg_core_1.boolean)('allow_new_clients').default(true).notNull(),
    newClientRequiresApproval: (0, pg_core_1.boolean)('new_client_requires_approval').default(false).notNull(),
    newClientDepositRequired: (0, pg_core_1.boolean)('new_client_deposit_required').default(false).notNull(),
    // Limites
    maxDailyBookings: (0, pg_core_1.integer)('max_daily_bookings'),
    maxWeeklyBookingsPerClient: (0, pg_core_1.integer)('max_weekly_bookings_per_client').default(3),
    // Mensagens customizadas
    welcomeMessage: (0, pg_core_1.text)('welcome_message'),
    confirmationMessage: (0, pg_core_1.text)('confirmation_message'),
    cancellationMessage: (0, pg_core_1.text)('cancellation_message'),
    // Termos e condições
    termsUrl: (0, pg_core_1.varchar)('terms_url', { length: 500 }),
    requireTermsAcceptance: (0, pg_core_1.boolean)('require_terms_acceptance').default(false),
    // Integração WhatsApp
    sendWhatsappConfirmation: (0, pg_core_1.boolean)('send_whatsapp_confirmation').default(true),
    sendWhatsappReminder: (0, pg_core_1.boolean)('send_whatsapp_reminder').default(true),
    reminderHoursBefore: (0, pg_core_1.integer)('reminder_hours_before').default(24),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Holds (reservas temporárias) de Agendamento
 * Bloqueia horário por tempo limitado enquanto cliente completa booking
 */
exports.appointmentHolds = (0, pg_core_1.pgTable)('appointment_holds', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Horário reservado
    professionalId: (0, pg_core_1.uuid)('professional_id').references(() => exports.users.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    date: (0, pg_core_1.varchar)('date', { length: 10 }).notNull(),
    startTime: (0, pg_core_1.varchar)('start_time', { length: 5 }).notNull(),
    endTime: (0, pg_core_1.varchar)('end_time', { length: 5 }).notNull(),
    // Dados do cliente (pode ser temporário)
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }).notNull(),
    clientName: (0, pg_core_1.varchar)('client_name', { length: 255 }),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    // Status e controle
    status: (0, exports.holdStatusEnum)('status').default('ACTIVE').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    // Se convertido em agendamento
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    convertedAt: (0, pg_core_1.timestamp)('converted_at'),
    // Rastreamento
    sessionId: (0, pg_core_1.varchar)('session_id', { length: 100 }),
    clientIp: (0, pg_core_1.varchar)('client_ip', { length: 45 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Regras de Booking por Cliente
 * Permite bloquear ou aplicar regras especiais para clientes específicos
 */
exports.clientBookingRules = (0, pg_core_1.pgTable)('client_booking_rules', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Identificação do cliente (phone ou clientId)
    clientPhone: (0, pg_core_1.varchar)('client_phone', { length: 20 }),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    // Tipo de regra
    ruleType: (0, exports.bookingRuleTypeEnum)('rule_type').notNull(),
    // Configuração da regra
    reason: (0, pg_core_1.text)('reason'),
    restrictedServiceIds: (0, pg_core_1.json)('restricted_service_ids').$type(),
    // Validade
    startsAt: (0, pg_core_1.timestamp)('starts_at').defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    // Quem criou
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id).notNull(),
    // Status
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Depósitos de Agendamento
 * Registra sinais/depósitos pagos para confirmar agendamentos
 */
exports.appointmentDeposits = (0, pg_core_1.pgTable)('appointment_deposits', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Vinculação
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    holdId: (0, pg_core_1.uuid)('hold_id').references(() => exports.appointmentHolds.id),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => exports.clients.id),
    // Valor
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    // Status do depósito
    status: (0, exports.depositStatusEnum)('status').default('PENDING').notNull(),
    // Dados do pagamento
    paymentMethod: (0, exports.paymentMethodEnum)('payment_method'),
    paymentReference: (0, pg_core_1.varchar)('payment_reference', { length: 255 }),
    mercadoPagoPaymentId: (0, pg_core_1.varchar)('mercado_pago_payment_id', { length: 100 }),
    pixCode: (0, pg_core_1.text)('pix_code'),
    pixQrCodeBase64: (0, pg_core_1.text)('pix_qr_code_base64'),
    // Datas
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    refundedAt: (0, pg_core_1.timestamp)('refunded_at'),
    forfeitedAt: (0, pg_core_1.timestamp)('forfeited_at'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    // Motivo (para refund/forfeit)
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Códigos OTP para verificação
 * Usados para verificar telefone e confirmar ações sensíveis
 */
exports.otpCodes = (0, pg_core_1.pgTable)('otp_codes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    // Tipo de verificação
    type: (0, exports.otpTypeEnum)('type').notNull(),
    // Destino
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).notNull(),
    // Código
    code: (0, pg_core_1.varchar)('code', { length: 6 }).notNull(),
    // Controle
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    attempts: (0, pg_core_1.integer)('attempts').default(0).notNull(),
    maxAttempts: (0, pg_core_1.integer)('max_attempts').default(3).notNull(),
    // Vinculação opcional
    holdId: (0, pg_core_1.uuid)('hold_id').references(() => exports.appointmentHolds.id),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id),
    // Rastreamento
    clientIp: (0, pg_core_1.varchar)('client_ip', { length: 45 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// ==================== MÓDULO DE ADD-ONS E QUOTAS (WhatsApp) ====================
/**
 * Enum para status de add-on do salão
 */
exports.addonStatusEnum = (0, pg_core_1.pgEnum)('addon_status', ['ACTIVE', 'SUSPENDED', 'CANCELED']);
/**
 * Enum para tipo de evento de quota (ledger)
 */
exports.quotaEventTypeEnum = (0, pg_core_1.pgEnum)('quota_event_type', [
    'CONSUME', // Consumo de quota (agendamento enviou mensagem)
    'PURCHASE', // Compra de créditos extras
    'GRANT', // Concessão manual ou ativação de add-on
    'ADJUST', // Ajuste manual (admin)
    'REFUND', // Estorno
]);
/**
 * Catálogo de Add-ons disponíveis
 * Ex: WHATSAPP_BASIC_120, WHATSAPP_PRO_160
 */
exports.addonCatalog = (0, pg_core_1.pgTable)('addon_catalog', {
    code: (0, pg_core_1.varchar)('code', { length: 50 }).primaryKey(),
    family: (0, pg_core_1.varchar)('family', { length: 30 }).notNull(), // WHATSAPP
    tier: (0, pg_core_1.varchar)('tier', { length: 20 }).notNull(), // BASIC, PRO
    quotaType: (0, pg_core_1.varchar)('quota_type', { length: 50 }).notNull(), // WHATSAPP_APPOINTMENT
    quotaAmount: (0, pg_core_1.integer)('quota_amount').notNull(), // 120, 160, 200, 240
    priceCents: (0, pg_core_1.integer)('price_cents').notNull(), // 2990, 3990, ...
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Pacotes de créditos extras
 * Ex: WHATSAPP_EXTRA_20 = +20 agendamentos por R$10
 */
exports.creditPackages = (0, pg_core_1.pgTable)('credit_packages', {
    code: (0, pg_core_1.varchar)('code', { length: 50 }).primaryKey(),
    quotaType: (0, pg_core_1.varchar)('quota_type', { length: 50 }).notNull(), // WHATSAPP_APPOINTMENT
    qty: (0, pg_core_1.integer)('qty').notNull(), // 20
    priceCents: (0, pg_core_1.integer)('price_cents').notNull(), // 1000
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Add-ons ativos por salão
 * Indica quais add-ons o salão contratou
 */
exports.salonAddons = (0, pg_core_1.pgTable)('salon_addons', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    addonCode: (0, pg_core_1.varchar)('addon_code', { length: 50 }).references(() => exports.addonCatalog.code).notNull(),
    status: (0, exports.addonStatusEnum)('status').default('ACTIVE').notNull(),
    currentPeriodStart: (0, pg_core_1.timestamp)('current_period_start'),
    currentPeriodEnd: (0, pg_core_1.timestamp)('current_period_end'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
/**
 * Quotas mensais por salão
 * Controla saldo de agendamentos WhatsApp por mês
 */
exports.salonQuotas = (0, pg_core_1.pgTable)('salon_quotas', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    periodYyyymm: (0, pg_core_1.integer)('period_yyyymm').notNull(), // 202601
    whatsappIncluded: (0, pg_core_1.integer)('whatsapp_included').default(0).notNull(),
    whatsappUsed: (0, pg_core_1.integer)('whatsapp_used').default(0).notNull(),
    whatsappExtraPurchased: (0, pg_core_1.integer)('whatsapp_extra_purchased').default(0).notNull(),
    whatsappExtraUsed: (0, pg_core_1.integer)('whatsapp_extra_used').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueSalonPeriod: (0, pg_core_1.unique)().on(table.salonId, table.periodYyyymm),
}));
/**
 * Ledger de quotas (auditoria)
 * Registra todos os eventos de consumo, compra, ajuste
 */
exports.quotaLedger = (0, pg_core_1.pgTable)('quota_ledger', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    periodYyyymm: (0, pg_core_1.integer)('period_yyyymm').notNull(),
    eventType: (0, exports.quotaEventTypeEnum)('event_type').notNull(),
    quotaType: (0, pg_core_1.varchar)('quota_type', { length: 50 }).notNull(), // WHATSAPP_APPOINTMENT
    qty: (0, pg_core_1.integer)('qty').notNull(), // pode ser negativo (consumo)
    refType: (0, pg_core_1.varchar)('ref_type', { length: 30 }), // APPOINTMENT, MANUAL, INVOICE
    refId: (0, pg_core_1.varchar)('ref_id', { length: 100 }),
    metadata: (0, pg_core_1.json)('metadata').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
/**
 * Enum para status de unidade de agendamento WhatsApp
 */
exports.appointmentUnitStatusEnum = (0, pg_core_1.pgEnum)('appointment_unit_status', [
    'PENDING', // Aguardando envio
    'SENT', // Enviado com sucesso
    'FAILED', // Falhou no envio
]);
/**
 * Unidades de agendamento WhatsApp
 * Rastreia cada agendamento que deve consumir quota
 * Status: PENDING -> SENT ou FAILED
 */
exports.whatsappAppointmentUnits = (0, pg_core_1.pgTable)('whatsapp_appointment_units', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    appointmentId: (0, pg_core_1.uuid)('appointment_id').references(() => exports.appointments.id).notNull(),
    origin: (0, pg_core_1.text)('origin').default('AUTOMATION').notNull(), // AUTOMATION, MANUAL
    status: (0, exports.appointmentUnitStatusEnum)('status').default('PENDING').notNull(),
    firstTemplateCode: (0, pg_core_1.text)('first_template_code'), // Ex: appointment_reminder_24h
    providerMessageId: (0, pg_core_1.text)('provider_message_id'), // ID da mensagem no provedor
    lastError: (0, pg_core_1.text)('last_error'), // Último erro (se FAILED)
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueSalonAppointment: (0, pg_core_1.unique)().on(table.salonId, table.appointmentId),
}));
// ==================== ALEXIS PRODUCT CATALOG ====================
/**
 * Aliases de produtos para busca (multi-tenant)
 * Permite que "blindagem", "protetor térmico" encontrem o produto correto
 */
exports.productAliases = (0, pg_core_1.pgTable)('product_aliases', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    salonId: (0, pg_core_1.uuid)('salon_id').references(() => exports.salons.id).notNull(),
    productId: (0, pg_core_1.integer)('product_id').references(() => exports.products.id).notNull(),
    alias: (0, pg_core_1.varchar)('alias', { length: 255 }).notNull(),
    aliasNorm: (0, pg_core_1.varchar)('alias_norm', { length: 255 }).notNull(), // lowercase, sem acentos
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueSalonAliasNorm: (0, pg_core_1.unique)().on(table.salonId, table.aliasNorm),
    productIdx: (0, pg_core_1.index)('product_aliases_product_idx').on(table.productId),
    aliasNormIdx: (0, pg_core_1.index)('product_aliases_alias_norm_idx').on(table.aliasNorm),
}));
/**
 * Políticas globais de produtos (suporte/admin)
 * Permite desabilitar recomendação de produtos por catalog_code sem tocar em cada salão
 */
exports.globalProductPolicies = (0, pg_core_1.pgTable)('global_product_policies', {
    catalogCode: (0, pg_core_1.varchar)('catalog_code', { length: 100 }).primaryKey(),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(true).notNull(),
    reason: (0, pg_core_1.text)('reason'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    updatedBy: (0, pg_core_1.varchar)('updated_by', { length: 255 }),
});
// ==================== SCHEDULES & AVAILABILITY ====================
/**
 * Horário de funcionamento do salão
 * Define os dias/horários em que o salão está aberto
 */
exports.salonSchedules = (0, pg_core_1.pgTable)('salon_schedules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    salonId: (0, pg_core_1.uuid)('salon_id').notNull().references(() => exports.salons.id, { onDelete: 'cascade' }),
    dayOfWeek: (0, pg_core_1.integer)('day_of_week').notNull(), // 0=domingo, 6=sábado
    isOpen: (0, pg_core_1.boolean)('is_open').notNull().default(true),
    openTime: (0, pg_core_1.time)('open_time'),
    closeTime: (0, pg_core_1.time)('close_time'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    salonIdx: (0, pg_core_1.index)('salon_schedules_salon_idx').on(table.salonId),
    uniqueSalonDay: (0, pg_core_1.unique)().on(table.salonId, table.dayOfWeek),
}));
/**
 * Horário de trabalho do profissional
 * Define os dias/horários em que o profissional trabalha
 */
exports.professionalSchedules = (0, pg_core_1.pgTable)('professional_schedules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    professionalId: (0, pg_core_1.uuid)('professional_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    salonId: (0, pg_core_1.uuid)('salon_id').notNull().references(() => exports.salons.id, { onDelete: 'cascade' }),
    dayOfWeek: (0, pg_core_1.integer)('day_of_week').notNull(), // 0=domingo, 6=sábado
    isWorking: (0, pg_core_1.boolean)('is_working').notNull().default(true),
    startTime: (0, pg_core_1.time)('start_time'),
    endTime: (0, pg_core_1.time)('end_time'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    professionalIdx: (0, pg_core_1.index)('professional_schedules_professional_idx').on(table.professionalId),
    uniqueProfessionalDay: (0, pg_core_1.unique)().on(table.professionalId, table.dayOfWeek),
}));
// ==================== GOOGLE CALENDAR INTEGRATION ====================
/**
 * Tokens OAuth2 do Google Calendar por usuário
 * Permite sincronização bidirecional entre o sistema e o Google Calendar
 */
exports.googleCalendarTokens = (0, pg_core_1.pgTable)('google_calendar_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    salonId: (0, pg_core_1.uuid)('salon_id').notNull().references(() => exports.salons.id, { onDelete: 'cascade' }),
    // OAuth tokens
    accessToken: (0, pg_core_1.text)('access_token').notNull(),
    refreshToken: (0, pg_core_1.text)('refresh_token').notNull(),
    tokenExpiry: (0, pg_core_1.timestamp)('token_expiry').notNull(),
    // Configurações de sincronização
    calendarId: (0, pg_core_1.varchar)('calendar_id', { length: 255 }).default('primary'),
    syncEnabled: (0, pg_core_1.boolean)('sync_enabled').default(true),
    lastSyncAt: (0, pg_core_1.timestamp)('last_sync_at'),
    // Auditoria
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('google_calendar_tokens_user_idx').on(table.userId),
    uniqueUserSalon: (0, pg_core_1.unique)().on(table.userId, table.salonId),
}));
//# sourceMappingURL=schema.js.map