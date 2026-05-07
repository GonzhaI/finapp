import type { spacing, radii, typography, duration, shadow } from './tokens';

export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  accent: string;
  accentBackground: string;
  income: string;
  expense: string;
  warning: string;
  info: string;
  border: string;
  borderLight: string;
  separator: string;
  glassBorder: string;
  glassHighlight: string;
  skeleton: string;
  overlay: string;
};

export type AppTheme = {
  colors: AppThemeColors;
};

export type ThemeTokens = {
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  duration: typeof duration;
  shadow: typeof shadow;
};
