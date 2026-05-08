import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { spacing, radii, typography, duration, shadow } from './tokens';
import { useThemeStore } from '@/store/themeStore';
import type { AppThemeColors } from './types';

type ThemeContextValue = {
  theme: { colors: AppThemeColors };
  isDark: boolean;
};

export { spacing, radii, typography, duration, shadow };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function createDarkColors(accentHex: string): AppThemeColors {
  return {
    background: '#08090f',
    surface: 'rgba(255,255,255,0.055)',
    surfaceElevated: 'rgba(255,255,255,0.06)',
    surfaceGlass: 'rgba(255,255,255,0.055)',
    text: 'rgba(255,255,255,0.88)',
    textSecondary: 'rgba(255,255,255,0.45)',
    textTertiary: 'rgba(255,255,255,0.30)',
    textMutedAlt: 'rgba(255,255,255,0.38)',
    textInverse: '#08090f',
    textWhite: '#FFFFFF',
    accent: accentHex,
    accentBackground: 'rgba(120,100,255,0.18)',
    accentActive: 'rgba(160,140,255,0.95)',
    income: '#32d578',
    incomeBackground: 'rgba(50,210,120,0.18)',
    incomeBorder: 'rgba(50,210,120,0.3)',
    expense: '#ff6060',
    expenseBackground: 'rgba(255,80,80,0.15)',
    warning: '#ffb432',
    warningBackground: 'rgba(255,180,50,0.15)',
    info: '#32b4ff',
    infoBackground: 'rgba(50,180,255,0.15)',
    border: 'rgba(255,255,255,0.09)',
    borderLight: 'rgba(255,255,255,0.05)',
    separator: 'rgba(255,255,255,0.055)',
    glassBorder: 'rgba(255,255,255,0.09)',
    glassHighlight: 'rgba(255,255,255,0.12)',
    skeleton: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(0,0,0,0.6)',
    tabBarBg: 'rgba(8,9,15,0.9)',
    tabInactive: 'rgba(255,255,255,0.35)',
    glassFill: 'rgba(255,255,255,0.055)',
    glassFill05: 'rgba(255,255,255,0.05)',
    glassFill08: 'rgba(255,255,255,0.08)',
    glassFill15: 'rgba(255,255,255,0.15)',
  };
}

function createLightColors(accentHex: string): AppThemeColors {
  return {
    background: '#f5f6fa',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceGlass: 'rgba(255,255,255,0.7)',
    text: 'rgba(15,17,30,0.92)',
    textSecondary: 'rgba(15,17,30,0.55)',
    textTertiary: 'rgba(15,17,30,0.38)',
    textMutedAlt: 'rgba(15,17,30,0.38)',
    textInverse: '#ffffff',
    textWhite: '#ffffff',
    accent: accentHex,
    accentBackground: 'rgba(100,80,230,0.12)',
    accentActive: accentHex,
    income: '#1ca85f',
    incomeBackground: 'rgba(28,168,95,0.12)',
    incomeBorder: 'rgba(28,168,95,0.25)',
    expense: '#e63b3b',
    expenseBackground: 'rgba(230,59,59,0.10)',
    warning: '#e69412',
    warningBackground: 'rgba(230,148,18,0.12)',
    info: '#1c8fdc',
    infoBackground: 'rgba(28,143,220,0.12)',
    border: 'rgba(15,17,30,0.07)',
    borderLight: 'rgba(15,17,30,0.04)',
    separator: 'rgba(15,17,30,0.08)',
    glassBorder: 'rgba(15,17,30,0.07)',
    glassHighlight: 'rgba(15,17,30,0.04)',
    skeleton: 'rgba(15,17,30,0.06)',
    overlay: 'rgba(15,17,30,0.3)',
    tabBarBg: 'rgba(255,255,255,0.85)',
    tabInactive: 'rgba(15,17,30,0.45)',
    glassFill: 'rgba(255,255,255,0.7)',
    glassFill05: 'rgba(15,17,30,0.04)',
    glassFill08: 'rgba(15,17,30,0.06)',
    glassFill15: 'rgba(15,17,30,0.10)',
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const accentColor = useThemeStore((s) => s.accentColor);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    const colors = isDark ? createDarkColors(accentColor) : createLightColors(accentColor);
    return { theme: { colors }, isDark };
  }, [isDark, accentColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue & {
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  duration: typeof duration;
  shadow: typeof shadow;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return {
    ...ctx,
    spacing,
    radii,
    typography,
    duration,
    shadow,
  };
}
