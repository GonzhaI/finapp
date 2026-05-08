import { create } from 'zustand';
import { getSupportedCurrencies } from '@/utils/currency';

export const supportedCurrencies = getSupportedCurrencies();

export const localeOptions = [
  { value: 'es-CL', labelEs: 'Chile', labelEn: 'Chile' },
  { value: 'es-AR', labelEs: 'Argentina', labelEn: 'Argentina' },
  { value: 'es-MX', labelEs: 'México', labelEn: 'Mexico' },
  { value: 'es-PE', labelEs: 'Perú', labelEn: 'Peru' },
  { value: 'es-UY', labelEs: 'Uruguay', labelEn: 'Uruguay' },
  { value: 'en-US', labelEs: 'Estados Unidos', labelEn: 'United States' },
  { value: 'es-ES', labelEs: 'España', labelEn: 'Spain' },
  { value: 'en-GB', labelEs: 'Reino Unido', labelEn: 'United Kingdom' },
] as const;

type SettingsState = {
  primaryCurrency: string;
  setPrimaryCurrency: (currency: string) => void;
  locale: string;
  setLocale: (locale: string) => void;
  biometricLock: boolean;
  setBiometricLock: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  primaryCurrency: 'CLP',
  setPrimaryCurrency: (primaryCurrency) => set({ primaryCurrency }),
  locale: 'es-CL',
  setLocale: (locale) => set({ locale }),
  biometricLock: false,
  setBiometricLock: (biometricLock) => set({ biometricLock }),
}));
