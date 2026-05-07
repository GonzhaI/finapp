import type { AppTheme } from './types';
import { palette } from './tokens';

export const darkTheme: AppTheme = {
  colors: {
    background: palette.ink[900],
    surface: '#1E1E1E',
    surfaceElevated: '#2C2C2C',
    surfaceGlass: 'rgba(30, 30, 30, 0.72)',
    text: palette.ink[50],
    textSecondary: palette.ink[400],
    textTertiary: palette.ink[500],
    textInverse: palette.ink[900],
    accent: palette.accent[400],
    accentBackground: 'rgba(10, 132, 255, 0.15)',
    income: palette.income,
    expense: palette.expense,
    warning: palette.warning,
    info: palette.info,
    border: palette.ink[700],
    borderLight: 'rgba(255, 255, 255, 0.08)',
    separator: palette.ink[800],
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',
    skeleton: palette.ink[700],
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};
