import type { spacing, radii, typography, duration, shadow } from './tokens';

export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMutedAlt: string;
  textInverse: string;
  textWhite: string;
  accent: string;
  accentBackground: string;
  accentActive: string;
  income: string;
  incomeBackground: string;
  incomeBorder: string;
  expense: string;
  expenseBackground: string;
  warning: string;
  warningBackground: string;
  info: string;
  infoBackground: string;
  border: string;
  borderLight: string;
  separator: string;
  glassBorder: string;
  glassHighlight: string;
  skeleton: string;
  overlay: string;
  tabBarBg: string;
  tabInactive: string;
  glassFill: string;
  glassFill05: string;
  glassFill08: string;
  glassFill15: string;
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
