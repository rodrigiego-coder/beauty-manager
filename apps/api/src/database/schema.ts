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
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const accountStatusEnum = pgEnum('account_status', ['PENDING', 'PAID', 'OVERDUE']);
export const userRoleEnum = pgEnum('user_role', ['OWNER', 'MANAGER', 'RECEPTIONIST', 'STYLIST']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'STOCK_LOW',
  'CLIENT_INACTIVE',
  'BILL_DUE',
  'APPOINTMENT_REMINDER',
  'CHURN_RISK',
]);

export const auditActionEnum = pgEnum('audit_action', ['CREATE', 'UPDATE', 'DELETE']);

/**
 * Interface para tipagem do work_schedule
 */
export interface WorkSchedule {
  [key: string]: string | null;
}

/**
 * Interface para tipagem dos serviços incluídos no pacote
 */
export interface PackageServices {
  services: { name: string; quantity: number }[];
}

/**
 * Tabela de salões (Multi-localidade)
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
 * Tabela de clientes do salao
 */
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  phone: varchar('phone', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  aiActive: boolean('ai_active').default(true).notNull(),
  technicalNotes: text('technical_notes'),
  preferences: text('preferences'),
  lastVisitDate: date('last_visit_date'),
  churnRisk: boolean('churn_risk').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de usuários/profissionais do salão
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
 * Tabela de agendamentos
 */
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  professionalId: uuid('professional_id')
    .references(() => users.id),
  service: varchar('service', { length: 100 }).notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  time: varchar('time', { length: 5 }).notNull(),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
  status: varchar('status', { length: 20 }).default('confirmed').notNull(),
  notes: text('notes'),
  clientPackageId: integer('client_package_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de produtos (Estoque)
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  currentStock: integer('current_stock').default(0).notNull(),
  minStock: integer('min_stock').default(0).notNull(),
  unit: unitEnum('unit').default('UN').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabela de transações (Fluxo de Caixa)
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
 * Tabela de notificações do sistema
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