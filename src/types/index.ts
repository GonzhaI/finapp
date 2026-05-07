/** Tipos de cuenta soportados */
export type AccountKind =
  | 'cash'
  | 'debit'
  | 'checking'
  | 'digital_wallet'
  | 'credit'
  | 'savings'
  | 'investment'
  | 'other';

/** Tipos de transacción */
export type TransactionKind = 'income' | 'expense' | 'transfer';

/** Tipos de categoría */
export type CategoryKind = 'income' | 'expense';

/** Modo de tema */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Locale soportado */
export type Locale = 'es' | 'en';

/** Código de moneda ISO 4217 */
export type CurrencyCode = string;

/** Entidad Account */
export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  provider: string | null;
  currency: CurrencyCode;
  initialBalance: number;
  creditLimit: number | null;
  color: string;
  icon: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};

/** Entidad Category */
export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  icon: string;
  parentId: string | null;
  archived: boolean;
  sortOrder: number;
  createdAt: number;
};

/** Entidad Transaction */
export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  kind: TransactionKind;
  amount: number;
  currency: CurrencyCode;
  occurredAt: number;
  note: string | null;
  transferPairId: string | null;
  recurringId: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

/** Entidad RecurringRule */
export type RecurringRule = {
  id: string;
  template: Record<string, unknown>;
  cron: string;
  nextRunAt: number;
  active: boolean;
};

/** Entidad Settings (singleton) */
export type Settings = {
  id: number;
  primaryCurrency: CurrencyCode;
  language: string | null;
  locale: string;
  theme: ThemeMode;
  accentColor: string;
  biometricLock: boolean;
  firstRunAt: number;
};
