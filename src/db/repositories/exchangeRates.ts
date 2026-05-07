import { eq, and, desc } from 'drizzle-orm';
import { db } from '../client';
import { currencies, exchangeRates } from '../schema';

export const currenciesRepo = {
  getAll() {
    return db.select().from(currencies).all();
  },

  getByCode(code: string) {
    return db.select().from(currencies).where(eq(currencies.code, code)).get();
  },
};

export type InsertExchangeRateData = typeof exchangeRates.$inferInsert;

export const exchangeRatesRepo = {
  getAll() {
    return db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.effectiveAt))
      .all();
  },

  /**
   * Obtiene la tasa más reciente para un par de monedas.
   */
  getRate(from: string, to: string) {
    return db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, from),
          eq(exchangeRates.toCurrency, to),
        ),
      )
      .orderBy(desc(exchangeRates.effectiveAt))
      .limit(1)
      .get();
  },

  create(data: InsertExchangeRateData) {
    const now = Date.now();
    db.insert(exchangeRates)
      .values({ ...data, createdAt: now })
      .run();
    return db
      .select()
      .from(exchangeRates)
      .where(eq(exchangeRates.id, data.id))
      .get();
  },

  delete(id: string) {
    db.delete(exchangeRates).where(eq(exchangeRates.id, id)).run();
  },
};
