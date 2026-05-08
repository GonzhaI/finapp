import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
  accentColor: '#7864f0',
  setAccentColor: (accentColor) => set({ accentColor }),
}));
