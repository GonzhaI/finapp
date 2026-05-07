import { eq, and, asc } from 'drizzle-orm';
import { db } from '../client';
import { categories } from '../schema';
import type { CategoryKind } from '@/types';

export type InsertCategoryData = typeof categories.$inferInsert;

export const categoriesRepo = {
  getAll() {
    return db
      .select()
      .from(categories)
      .where(eq(categories.archived, false))
      .orderBy(asc(categories.sortOrder))
      .all();
  },

  getByKind(kind: CategoryKind) {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.kind, kind), eq(categories.archived, false)))
      .orderBy(asc(categories.sortOrder))
      .all();
  },

  getById(id: string) {
    return db.select().from(categories).where(eq(categories.id, id)).get();
  },

  create(data: InsertCategoryData) {
    const now = Date.now();
    db.insert(categories)
      .values({ ...data, createdAt: now })
      .run();
    return db.select().from(categories).where(eq(categories.id, data.id)).get();
  },

  update(id: string, data: Partial<InsertCategoryData>) {
    db.update(categories).set(data).where(eq(categories.id, id)).run();
    return db.select().from(categories).where(eq(categories.id, id)).get();
  },

  archive(id: string) {
    db.update(categories)
      .set({ archived: true })
      .where(eq(categories.id, id))
      .run();
  },

  delete(id: string) {
    db.delete(categories).where(eq(categories.id, id)).run();
  },
};
