import { db } from '@/db/client';
import { transactions, categories } from '@/db/schema';
import { eq, and, isNull, gte, lte, sql, desc } from 'drizzle-orm';

export interface CategoryBreakdown {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

/** Obtiene el gasto agrupado por categoría en un rango de fechas */
export function getExpensesByCategory(from: number, to: number): CategoryBreakdown[] {
  const rows = db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as('total'),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.kind, 'expense'),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
        isNull(transactions.deletedAt),
      ),
    )
    .groupBy(transactions.categoryId)
    .orderBy(desc(sql`total`))
    .all();

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return rows.map((row) => {
    const cat = row.categoryId
      ? db.select().from(categories).where(eq(categories.id, row.categoryId)).get()
      : null;

    return {
      categoryId: row.categoryId,
      categoryName: cat?.name ?? 'Sin categoría',
      categoryColor: cat?.color ?? '#888888',
      categoryIcon: cat?.icon ?? 'questionmark',
      total: row.total,
      percentage: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0,
    };
  });
}

/** Obtiene el ingreso agrupado por categoría en un rango de fechas */
export function getIncomeByCategory(from: number, to: number): CategoryBreakdown[] {
  const rows = db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.as('total'),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.kind, 'income'),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
        isNull(transactions.deletedAt),
      ),
    )
    .groupBy(transactions.categoryId)
    .orderBy(desc(sql`total`))
    .all();

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return rows.map((row) => {
    const cat = row.categoryId
      ? db.select().from(categories).where(eq(categories.id, row.categoryId)).get()
      : null;

    return {
      categoryId: row.categoryId,
      categoryName: cat?.name ?? 'Sin categoría',
      categoryColor: cat?.color ?? '#888888',
      categoryIcon: cat?.icon ?? 'questionmark',
      total: row.total,
      percentage: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0,
    };
  });
}

/** Obtiene resumen mensual de los últimos N meses */
export function getMonthlySummary(months: number = 6): MonthlySummary[] {
  const now = new Date();
  const result: MonthlySummary[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = date.getTime();
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

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

    const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    result.push({ month: monthLabel, income, expense });
  }

  return result;
}

/** Obtiene los top gastos individuales en un rango */
export function getTopExpenses(from: number, to: number, limit: number = 10) {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.kind, 'expense'),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
        isNull(transactions.deletedAt),
      ),
    )
    .orderBy(desc(transactions.amount))
    .limit(limit)
    .all();
}
