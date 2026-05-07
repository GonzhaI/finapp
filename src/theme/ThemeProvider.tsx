import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme } from './light';
import { darkTheme } from './dark';
import { spacing, radii, typography, duration, shadow } from './tokens';
import { useThemeStore } from '../store/themeStore';
import type { AppThemeColors } from './types';

type ThemeContextValue = {
  theme: { colors: AppThemeColors };
  isDark: boolean;
};

export { spacing, radii, typography, duration, shadow };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
    }),
    [isDark],
  );

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
