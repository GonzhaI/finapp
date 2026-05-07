import { create } from 'zustand';

type Locale = 'es' | 'en';

type I18nState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useI18nStore = create<I18nState>((set) => ({
  locale: 'es',
  setLocale: (locale) => set({ locale }),
}));
