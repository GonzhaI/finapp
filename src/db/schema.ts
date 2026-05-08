import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Cuentas ──────────────────────────────────────────────────
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  kind: text('kind', {
    enum: ['cash', 'debit', 'checking', 'digital_wallet', 'credit', 'savings', 'investment', 'other'],
  }).notNull(),
  provider: text('provider'),
  currency: text('currency').notNull(),
  initialBalance: integer('initial_balance').notNull().default(0),
  creditLimit: integer('credit_limit'),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ── Categorías ──────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  kind: text('kind', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  parentId: text('parent_id'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

// ── Transacciones ───────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  accountId: text('account_id')
    .notNull()
    .references(() => accounts.id),
  categoryId: text('category_id').references(() => categories.id),
  kind: text('kind', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  occurredAt: integer('occurred_at').notNull(),
  note: text('note'),
  transferPairId: text('transfer_pair_id'),
  recurringId: text('recurring_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

// ── Reglas recurrentes ──────────────────────────────────────
export const recurringRules = sqliteTable('recurring_rules', {
  id: text('id').primaryKey(),
  template: text('template', { mode: 'json' }).notNull(),
  cron: text('cron').notNull(),
  nextRunAt: integer('next_run_at').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

// ── Configuración (singleton) ───────────────────────────────
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  primaryCurrency: text('primary_currency').notNull().default('CLP'),
  language: text('language'),
  locale: text('locale').notNull().default('es-CL'),
  theme: text('theme', { enum: ['system', 'light', 'dark'] })
    .notNull()
    .default('system'),
  accentColor: text('accent_color').notNull().default('#7864f0'),
  biometricLock: integer('biometric_lock', { mode: 'boolean' }).notNull().default(false),
  firstRunAt: integer('first_run_at'),
});

// ── Monedas (catálogo) ──────────────────────────────────────
export const currencies = sqliteTable('currencies', {
  code: text('code').primaryKey(),
  symbol: text('symbol').notNull(),
  decimalPlaces: integer('decimal_places').notNull(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
});

// ── Tasas de cambio ─────────────────────────────────────────
export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  fromCurrency: text('from_currency')
    .notNull()
    .references(() => currencies.code),
  toCurrency: text('to_currency')
    .notNull()
    .references(() => currencies.code),
  rate: real('rate').notNull(),
  effectiveAt: integer('effective_at').notNull(),
  createdAt: integer('created_at').notNull(),
});
