import { useCallback } from 'react';
import { useI18nStore } from '../store/i18nStore';
import es from './es.json';
import en from './en.json';

type Translations = typeof es;

/**
 * Aplana las keys de un objeto JSON de traducciones a "sección.clave".
 */
type FlattenKeys<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? `${P}${K}`
        : FlattenKeys<T[K], `${P}${K}.`>;
    }[keyof T & string]
  : never;

type TranslationKey = FlattenKeys<Translations>;

const translations: Record<string, Translations> = { es, en };

function getValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}

export function useT() {
  const locale = useI18nStore((s) => s.locale);

  const t = useCallback(
    (key: TranslationKey): string => {
      return getValue(translations[locale] ?? translations.es, key);
    },
    [locale],
  );

  return t;
}
