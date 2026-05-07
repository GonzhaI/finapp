import { eq } from 'drizzle-orm';
import { db } from '../client';
import { recurringRules } from '../schema';

export type InsertRecurringRuleData = typeof recurringRules.$inferInsert;

export const recurringRulesRepo = {
  getAll() {
    return db.select().from(recurringRules).all();
  },

  getActive() {
    return db
      .select()
      .from(recurringRules)
      .where(eq(recurringRules.active, true))
      .all();
  },

  getById(id: string) {
    return db.select().from(recurringRules).where(eq(recurringRules.id, id)).get();
  },

  create(data: InsertRecurringRuleData) {
    db.insert(recurringRules).values(data).run();
    return db.select().from(recurringRules).where(eq(recurringRules.id, data.id)).get();
  },

  update(id: string, data: Partial<InsertRecurringRuleData>) {
    db.update(recurringRules).set(data).where(eq(recurringRules.id, id)).run();
    return db.select().from(recurringRules).where(eq(recurringRules.id, id)).get();
  },

  toggle(id: string, active: boolean) {
    db.update(recurringRules)
      .set({ active })
      .where(eq(recurringRules.id, id))
      .run();
  },

  delete(id: string) {
    db.delete(recurringRules).where(eq(recurringRules.id, id)).run();
  },
};
