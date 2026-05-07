import { eq, desc, and, isNull, gte, lte } from 'drizzle-orm';
import { db } from '../client';
import { transactions } from '../schema';
import type { TransactionKind } from '@/types';

export type InsertTransactionData = typeof transactions.$inferInsert;

export const transactionsRepo = {
  getAll(limit = 50) {
    return db
      .select()
      .from(transactions)
      .where(isNull(transactions.deletedAt))
      .orderBy(desc(transactions.occurredAt))
      .limit(limit)
      .all();
  },

  getById(id: string) {
    return db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
      .get();
  },

  getByAccount(accountId: string) {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, accountId),
          isNull(transactions.deletedAt),
        ),
      )
      .orderBy(desc(transactions.occurredAt))
      .all();
  },

  getByDateRange(from: number, to: number) {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.occurredAt, from),
          lte(transactions.occurredAt, to),
          isNull(transactions.deletedAt),
        ),
      )
      .orderBy(desc(transactions.occurredAt))
      .all();
  },

  getByKind(kind: TransactionKind) {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.kind, kind),
          isNull(transactions.deletedAt),
        ),
      )
      .orderBy(desc(transactions.occurredAt))
      .all();
  },

  create(data: InsertTransactionData) {
    const now = Date.now();
    db.insert(transactions)
      .values({ ...data, createdAt: now, updatedAt: now })
      .run();
    return db.select().from(transactions).where(eq(transactions.id, data.id)).get();
  },

  update(id: string, data: Partial<InsertTransactionData>) {
    const now = Date.now();
    db.update(transactions)
      .set({ ...data, updatedAt: now })
      .where(eq(transactions.id, id))
      .run();
    return db.select().from(transactions).where(eq(transactions.id, id)).get();
  },

  softDelete(id: string) {
    const now = Date.now();
    db.update(transactions)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(transactions.id, id))
      .run();
  },
};
