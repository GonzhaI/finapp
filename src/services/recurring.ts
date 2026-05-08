import { db } from '@/db/client';
import { recurringRules, transactions } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';

function advanceCron(cron: string, lastRunAt: number): number {
  const d = new Date(lastRunAt);

  switch (cron) {
    case '0 0 * * 1': {
      d.setDate(d.getDate() + 7);
      break;
    }
    case '0 0 1,15 * *': {
      const day = d.getDate();
      if (day < 15) {
        d.setDate(15);
      } else {
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
      }
      break;
    }
    case '0 0 1 * *': {
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      break;
    }
    case '0 0 1 1 *': {
      d.setFullYear(d.getFullYear() + 1);
      d.setMonth(0);
      d.setDate(1);
      break;
    }
    default:
      d.setDate(d.getDate() + 7);
  }

  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function execRecurringRules(): number {
  const now = Date.now();
  const dueRules = db
    .select()
    .from(recurringRules)
    .where(and(eq(recurringRules.active, true), lte(recurringRules.nextRunAt, now)))
    .all();

  let created = 0;

  for (const rule of dueRules) {
    try {
      const tmpl = rule.template as Record<string, unknown> | null;
      if (!tmpl) continue;

      const txId = `txn-rule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const nowMs = Date.now();

      db.insert(transactions)
        .values({
          id: txId,
          accountId: String(tmpl.accountId ?? ''),
          kind: String(tmpl.kind ?? 'expense') as 'income' | 'expense' | 'transfer',
          amount: Number(tmpl.amount ?? 0),
          currency: String(tmpl.currency ?? 'CLP'),
          occurredAt: nowMs,
          note: String(tmpl.note ?? ''),
          categoryId: tmpl.categoryId ? String(tmpl.categoryId) : null,
          recurringId: rule.id,
          createdAt: nowMs,
          updatedAt: nowMs,
          deletedAt: null,
          transferPairId: null,
        })
        .run();

      const nextAt = advanceCron(rule.cron, rule.nextRunAt);
      db.update(recurringRules)
        .set({ nextRunAt: nextAt })
        .where(eq(recurringRules.id, rule.id))
        .run();

      created++;
    } catch {
      // skip malformed rules so one failure doesn't block others
    }
  }

  return created;
}
