import type { TextStyle } from 'react-native';

// ── Paleta base ──────────────────────────────────────────────
export const palette = {
  // Grises cálidos
  ink: {
    50: '#F8F8F7',
    100: '#EFEEEC',
    200: '#DCDAD5',
    300: '#C4C2BB',
    400: '#A9A6A0',
    500: '#8B8880',
    600: '#6B6860',
    700: '#504E48',
    800: '#383632',
    900: '#1A1917',
  },
  // Acento por defecto (iOS blue)
  accent: {
    50: '#E6F2FF',
    100: '#B3D9FF',
    200: '#80C0FF',
    300: '#4DA7FF',
    400: '#1A8EFF',
    500: '#0A84FF',
    600: '#0870DB',
    700: '#065CB7',
    800: '#044893',
    900: '#02346F',
  },
  // Semánticos
  income: '#30D158',
  expense: '#FF453A',
  warning: '#FF9F0A',
  info: '#5AC8FA',
} as const;

// ── Espaciado (escala base 4) ────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ── Radio de borde ───────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

// ── Tipografía ───────────────────────────────────────────────
export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.4,
  } as TextStyle,
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  } as TextStyle,
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '500',
  } as TextStyle,
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
  } as TextStyle,
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  } as TextStyle,
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,
} as const;

// ── Animaciones ──────────────────────────────────────────────
export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

// ── Sombras ──────────────────────────────────────────────────
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
