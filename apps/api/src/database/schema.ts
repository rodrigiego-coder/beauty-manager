import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * Tabela de clientes do salao
 */
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  aiActive: boolean('ai_active').default(true).notNull(),
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
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, closed
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
  role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  toolCalls: text('tool_calls'), // JSON das tools chamadas
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tabela de agendamentos
 */
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),
  service: varchar('service', { length: 100 }).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar('time', { length: 5 }).notNull(), // HH:MM
  duration: integer('duration').notNull(), // minutos
  price: integer('price').notNull(), // centavos
  status: varchar('status', { length: 20 }).default('confirmed').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types inferidos do schema
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
