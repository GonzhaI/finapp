import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '@/db/client';
import { accounts, categories, transactions, recurringRules, exchangeRates, settings, currencies } from '@/db/schema';
import { isNull } from 'drizzle-orm';
import { z } from 'zod';

const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['cash', 'debit', 'checking', 'digital_wallet', 'credit', 'savings', 'investment', 'other']),
  provider: z.string().nullable().optional(),
  currency: z.string(),
  initialBalance: z.number(),
  creditLimit: z.number().nullable().optional(),
  color: z.string(),
  icon: z.string(),
  archived: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['income', 'expense']),
  color: z.string(),
  icon: z.string(),
  parentId: z.string().nullable().optional(),
  archived: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.number(),
});

const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  kind: z.enum(['income', 'expense', 'transfer']),
  amount: z.number(),
  currency: z.string(),
  occurredAt: z.number(),
  note: z.string().nullable().optional(),
  transferPairId: z.string().nullable().optional(),
  recurringId: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable().optional(),
});

const recurringRuleSchema = z.object({
  id: z.string(),
  template: z.record(z.string(), z.unknown()),
  cron: z.string(),
  nextRunAt: z.number(),
  active: z.boolean(),
});

const exchangeRateSchema = z.object({
  id: z.string(),
  fromCurrency: z.string(),
  toCurrency: z.string(),
  rate: z.number(),
  effectiveAt: z.number(),
  createdAt: z.number(),
});

const settingsSchema = z.object({
  id: z.number(),
  primaryCurrency: z.string(),
  language: z.string().nullable().optional(),
  locale: z.string(),
  theme: z.enum(['system', 'light', 'dark']),
  accentColor: z.string(),
  biometricLock: z.boolean(),
  firstRunAt: z.number().nullable().optional(),
});

const currencySchema = z.object({
  code: z.string(),
  symbol: z.string(),
  decimalPlaces: z.number(),
  nameEs: z.string(),
  nameEn: z.string(),
});

export const backupDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  data: z.object({
    accounts: z.array(accountSchema),
    categories: z.array(categorySchema),
    transactions: z.array(transactionSchema),
    recurringRules: z.array(recurringRuleSchema),
    exchangeRates: z.array(exchangeRateSchema),
    settings: settingsSchema.nullable().optional(),
    currencies: z.array(currencySchema),
  }),
});

export type BackupData = z.infer<typeof backupDataSchema>;

function buildBackupJSON(): string {
  const data = {
    version: 1 as const,
    exportedAt: Date.now(),
    data: {
      accounts: db.select().from(accounts).all(),
      categories: db.select().from(categories).all(),
      transactions: db.select().from(transactions).where(isNull(transactions.deletedAt)).all(),
      recurringRules: db.select().from(recurringRules).all(),
      exchangeRates: db.select().from(exchangeRates).all(),
      settings: db.select().from(settings).get(),
      currencies: db.select().from(currencies).all(),
    },
  };

  return JSON.stringify(data, null, 2);
}

export async function exportToJSON(): Promise<void> {
  const json = buildBackupJSON();
  const file = new File(Paths.cache, 'finapp_backup.json');
  file.write(json, { encoding: 'utf8' });
  await shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar datos',
    UTI: 'public.json',
  });
}

function buildCSV(): string {
  const txns = db.select().from(transactions).where(isNull(transactions.deletedAt)).all();
  const cats = db.select().from(categories).all();
  const accts = db.select().from(accounts).all();

  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  const accMap = new Map(accts.map((a) => [a.id, a.name]));

  const headers = ['Fecha', 'Tipo', 'Monto', 'Moneda', 'Cuenta', 'Categoría', 'Nota', 'ID'];

  const rows = txns.map((tx) => {
    const d = new Date(tx.occurredAt);
    return [
      d.toISOString().slice(0, 10),
      tx.kind,
      String(tx.amount),
      tx.currency,
      accMap.get(tx.accountId) ?? tx.accountId,
      tx.categoryId ? catMap.get(tx.categoryId) ?? tx.categoryId : '',
      tx.note ?? '',
      tx.id,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export async function exportToCSV(): Promise<void> {
  const csv = buildCSV();
  const file = new File(Paths.cache, 'finapp_movimientos.csv');
  file.write(csv, { encoding: 'utf8' });
  await shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Exportar movimientos',
    UTI: 'public.comma-separated-values-text',
  });
}

export async function importFromJSON(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { success: false, error: 'Selección cancelada' };
    }

    const uri = result.assets[0].uri;
    const file = new File(uri);
    const content = file.textSync();
    const parsed = JSON.parse(content);
    const validated = backupDataSchema.parse(parsed);

    const { data } = validated;

    const snapshot = {
      accts: db.select().from(accounts).all(),
      cats: db.select().from(categories).all(),
      txns: db.select().from(transactions).all(),
      rules: db.select().from(recurringRules).all(),
      erates: db.select().from(exchangeRates).all(),
      sett: db.select().from(settings).get(),
      curs: db.select().from(currencies).all(),
    };

    try {
      db.delete(exchangeRates).run();
      db.delete(transactions).run();
      db.delete(recurringRules).run();
      db.delete(accounts).run();
      db.delete(categories).run();

      if (data.currencies?.length) {
        db.delete(currencies).run();
        for (const c of data.currencies) {
          db.insert(currencies).values(c).run();
        }
      }

      for (const a of data.accounts) {
        db.insert(accounts).values(a).run();
      }

      for (const c of data.categories) {
        db.insert(categories).values(c).run();
      }

      for (const tx of data.transactions) {
        db.insert(transactions).values(tx).run();
      }

      for (const r of data.recurringRules) {
        db.insert(recurringRules).values(r).run();
      }

      for (const er of data.exchangeRates) {
        db.insert(exchangeRates).values(er).run();
      }

      if (data.settings) {
        db.delete(settings).run();
        db.insert(settings).values(data.settings).run();
      }

      return { success: true };
    } catch {
      db.delete(exchangeRates).run();
      db.delete(transactions).run();
      db.delete(recurringRules).run();
      db.delete(accounts).run();
      db.delete(categories).run();
      db.delete(currencies).run();
      if (snapshot.sett) db.delete(settings).run();

      for (const c of snapshot.curs) db.insert(currencies).values(c).run();
      for (const a of snapshot.accts) db.insert(accounts).values(a).run();
      for (const c of snapshot.cats) db.insert(categories).values(c).run();
      for (const tx of snapshot.txns) db.insert(transactions).values(tx).run();
      for (const r of snapshot.rules) db.insert(recurringRules).values(r).run();
      for (const er of snapshot.erates) db.insert(exchangeRates).values(er).run();
      if (snapshot.sett) db.insert(settings).values(snapshot.sett).run();

      return { success: false, error: 'Error al insertar los datos. Se restauró la copia anterior.' };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: `JSON inválido: ${err.issues.map((e) => e.message).join(', ')}` };
    }
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

export async function clearAllData(): Promise<void> {
  db.delete(exchangeRates).run();
  db.delete(transactions).run();
  db.delete(recurringRules).run();
  db.delete(accounts).run();
  db.delete(categories).run();
  db.delete(currencies).run();
  db.delete(settings).run();
}
