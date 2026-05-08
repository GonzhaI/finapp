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
    const tmpl = rule.template as Record<string, unknown> | null;
    const accountId = tmpl?.accountId ? String(tmpl.accountId) : '';
    const kind = tmpl?.kind ? String(tmpl.kind) : '';
    const amount = Number(tmpl?.amount ?? 0);
    const currency = String(tmpl?.currency ?? 'CLP');

    const isTemplateValid = accountId && kind && amount > 0;

    while (rule.nextRunAt <= now) {
      if (isTemplateValid) {
        try {
          const nowMs = Date.now();
          const txId = `txn-rule-${nowMs}-${Math.random().toString(36).slice(2, 9)}`;

          db.insert(transactions)
            .values({
              id: txId,
              accountId,
              kind: kind as 'income' | 'expense' | 'transfer',
              amount,
              currency,
              occurredAt: nowMs,
              note: tmpl?.note ? String(tmpl.note) : null,
              categoryId: tmpl?.categoryId ? String(tmpl.categoryId) : null,
              recurringId: rule.id,
              createdAt: nowMs,
              updatedAt: nowMs,
              deletedAt: null,
              transferPairId: null,
            })
            .run();

          created++;
        } catch {
          // skip malformed insert — advance anyway to avoid infinite stuck
        }
      }

      rule.nextRunAt = advanceCron(rule.cron, rule.nextRunAt);
    }

    db.update(recurringRules)
      .set({ nextRunAt: rule.nextRunAt })
      .where(eq(recurringRules.id, rule.id))
      .run();
  }

  return created;
}
