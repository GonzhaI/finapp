import { eq } from 'drizzle-orm';
import { db } from '../client';
import { settings } from '../schema';
import type { ThemeMode, CurrencyCode } from '@/types';

export const settingsRepo = {
  get() {
    return db.select().from(settings).where(eq(settings.id, 1)).get();
  },

  upsert(data: {
    primaryCurrency?: CurrencyCode;
    language?: string | null;
    locale?: string;
    theme?: ThemeMode;
    accentColor?: string;
    biometricLock?: boolean;
    firstRunAt?: number;
  }) {
    const existing = db.select().from(settings).where(eq(settings.id, 1)).get();
    if (existing) {
      db.update(settings).set(data).where(eq(settings.id, 1)).run();
    } else {
      db.insert(settings)
        .values({
          id: 1,
          primaryCurrency: data.primaryCurrency ?? 'CLP',
          language: data.language ?? null,
          locale: data.locale ?? 'es-CL',
          theme: data.theme ?? 'system',
          accentColor: data.accentColor ?? '#0A84FF',
          biometricLock: data.biometricLock ?? false,
          firstRunAt: data.firstRunAt ?? Date.now(),
        })
        .run();
    }
    return db.select().from(settings).where(eq(settings.id, 1)).get();
  },
};
