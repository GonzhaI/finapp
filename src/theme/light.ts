import { palette } from './tokens';
import type { AppTheme } from './types';

export const lightTheme: AppTheme = {
  colors: {
    background: palette.ink[50],
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.72)',
    text: palette.ink[900],
    textSecondary: palette.ink[500],
    textTertiary: palette.ink[400],
    textInverse: '#FFFFFF',
    accent: palette.accent[500],
    accentBackground: palette.accent[50],
    income: palette.income,
    expense: palette.expense,
    warning: palette.warning,
    info: palette.info,
    border: palette.ink[200],
    borderLight: 'rgba(0, 0, 0, 0.08)',
    separator: palette.ink[100],
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    glassHighlight: 'rgba(255, 255, 255, 0.8)',
    skeleton: palette.ink[200],
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
};
