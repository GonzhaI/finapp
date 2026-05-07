import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { accounts } from '../schema';
import type { AccountKind } from '@/types';

export type InsertAccountData = typeof accounts.$inferInsert;

export const accountsRepo = {
  getAll() {
    return db.select().from(accounts).where(eq(accounts.archived, false)).all();
  },

  getById(id: string) {
    return db.select().from(accounts).where(eq(accounts.id, id)).get();
  },

  getByKind(kind: AccountKind) {
    return db
      .select()
      .from(accounts)
      .where(and(eq(accounts.kind, kind), eq(accounts.archived, false)))
      .all();
  },

  create(data: InsertAccountData) {
    const now = Date.now();
    db.insert(accounts)
      .values({ ...data, createdAt: now, updatedAt: now })
      .run();
    return db.select().from(accounts).where(eq(accounts.id, data.id)).get();
  },

  update(id: string, data: Partial<InsertAccountData>) {
    const now = Date.now();
    db.update(accounts)
      .set({ ...data, updatedAt: now })
      .where(eq(accounts.id, id))
      .run();
    return db.select().from(accounts).where(eq(accounts.id, id)).get();
  },

  archive(id: string) {
    const now = Date.now();
    db.update(accounts)
      .set({ archived: true, updatedAt: now })
      .where(eq(accounts.id, id))
      .run();
  },

  delete(id: string) {
    db.delete(accounts).where(eq(accounts.id, id)).run();
  },
};
