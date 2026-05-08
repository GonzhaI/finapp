import { db } from '@/db/client';
import { accounts, transactions } from '@/db/schema';
import { eq, and, isNull, gte, lte, sql } from 'drizzle-orm';

/**
 * Obtiene el saldo actual de una cuenta:
 * initial_balance + Σ income - Σ expense (en su moneda nativa).
 */
export function getAccountBalance(accountId: string): number {
  const account = db.select().from(accounts).where(eq(accounts.id, accountId)).get();
  if (!account) return 0;

  const rows = db
    .select({
      kind: transactions.kind,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as('total'),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        isNull(transactions.deletedAt),
      ),
    )
    .groupBy(transactions.kind)
    .all();

  let balance = account.initialBalance;

  for (const row of rows) {
    if (row.kind === 'income') {
      balance += row.total;
    } else if (row.kind === 'expense') {
      balance -= row.total;
    }
    // Las transferencias no afectan el saldo porque representan
    // un par de movimientos compensados entre cuentas.
  }

  return balance;
}

/**
 * Obtiene totales de ingresos y gastos en un rango de fechas.
 */
export function getTotalsInRange(from: number, to: number) {
  const rows = db
    .select({
      kind: transactions.kind,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as('total'),
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
        isNull(transactions.deletedAt),
      ),
    )
    .groupBy(transactions.kind)
    .all();

  let income = 0;
  let expense = 0;

  for (const row of rows) {
    if (row.kind === 'income') income += row.total;
    else if (row.kind === 'expense') expense += row.total;
  }

  return { income, expense };
}

/**
 * Obtiene el inicio del mes (epoch ms) para una fecha dada.
 */
export function getMonthRange(date: Date = new Date()) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return { from, to };
}

/**
 * Obtiene la suma de todos los saldos de cuentas no archivadas.
 */
export function getTotalBalance(): number {
  const allAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.archived, false))
    .all();

  let total = 0;
  for (const acc of allAccounts) {
    total += getAccountBalance(acc.id);
  }
  return total;
}
