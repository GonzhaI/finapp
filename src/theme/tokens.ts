import type { TextStyle } from 'react-native';

// ── Paleta Liquid Glass (dark-only) ─────────────────────────
export const palette = {
  bgApp: '#08090f',

  purple: {
    accent: '#7864f0',
    bg: 'rgba(100,80,220,0.55)',
    glassBg: 'rgba(120,100,255,0.18)',
    muted: 'rgba(120,100,255,0.2)',
    active: 'rgba(160,140,255,0.95)',
    chartGradientTop: 'rgba(120,100,240,0.9)',
    chartGradientBottom: 'rgba(80,60,200,0.8)',
  },

  green: {
    accent: '#32d578',
    bg: 'rgba(30,180,140,0.35)',
    glassBg: 'rgba(50,210,120,0.18)',
    border: 'rgba(50,210,120,0.3)',
    bgIcon: 'rgba(50,210,120,0.2)',
  },

  red: {
    accent: '#ff6060',
    glassBg: 'rgba(255,80,80,0.18)',
    bgIcon: 'rgba(255,80,80,0.15)',
  },

  amber: {
    accent: '#ffb432',
    glassBg: 'rgba(255,180,50,0.18)',
    bgIcon: 'rgba(255,180,50,0.15)',
  },

  blue: {
    accent: '#32b4ff',
    bg: 'rgba(40,140,255,0.4)',
    glassBg: 'rgba(50,180,255,0.18)',
    bgIcon: 'rgba(50,180,255,0.15)',
  },

  magenta: {
    bg: 'rgba(180,60,120,0.28)',
  },

  indigo: {
    bg: 'rgba(80,60,200,0.45)',
    muted: 'rgba(160,100,255,0.2)',
  },

  teal: {
    bg: 'rgba(30,180,130,0.3)',
  },
} as const;

// ── Superficies glass ──────────────────────────────────────
export const glass = {
  fill: 'rgba(255,255,255,0.055)',
  fill05: 'rgba(255,255,255,0.05)',
  fill04: 'rgba(255,255,255,0.04)',
  fill06: 'rgba(255,255,255,0.06)',
  fill08: 'rgba(255,255,255,0.08)',
  fill10: 'rgba(255,255,255,0.1)',
  fill12: 'rgba(255,255,255,0.12)',
  fill15: 'rgba(255,255,255,0.15)',
  border: 'rgba(255,255,255,0.09)',
  borderLight: 'rgba(255,255,255,0.05)',
  border08: 'rgba(255,255,255,0.08)',
  highlight: 'rgba(255,255,255,0.12)',
  separator: 'rgba(255,255,255,0.055)',
  tabBarBg: 'rgba(8,9,15,0.9)',
} as const;

// ── Texto ──────────────────────────────────────────────────
export const textColor = {
  primary: 'rgba(255,255,255,0.88)',
  secondary: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.30)',
  mutedAlt: 'rgba(255,255,255,0.38)',
  inverse: '#08090f',
  white: '#FFFFFF',
  white78: 'rgba(255,255,255,0.78)',
  white35: 'rgba(255,255,255,0.35)',
  white20: 'rgba(255,255,255,0.2)',
  tabInactive: 'rgba(255,255,255,0.35)',
} as const;

// ── Espaciado (escala base 4) ──────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ── Radio de borde ─────────────────────────────────────────
export const radii = {
  sm: 8,
  iconBg: 9,
  md: 14,
  lg: 18,
  xl: 20,
  pill: 999,
  toggle: 11,
  iconRounded: 12,
  item: 14,
  card16: 16,
  card18: 18,
  card20: 20,
} as const;

// ── Tipografía ─────────────────────────────────────────────
export const typography = {
  hero: {
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '300' as const,
    letterSpacing: -2,
  } as TextStyle,
  screenTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  } as TextStyle,
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  } as TextStyle,
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '500' as const,
  } as TextStyle,
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
  } as TextStyle,
  statValue: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500' as const,
  } as TextStyle,
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
  } as TextStyle,
  itemName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  } as TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400' as const,
  } as TextStyle,
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  } as TextStyle,
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  } as TextStyle,
  label10: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  } as TextStyle,
  micro: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500' as const,
  } as TextStyle,
} as const;

// ── Animaciones ────────────────────────────────────────────
export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
  countUp: 600,
  chart: 500,
} as const;

// ── Sombras ────────────────────────────────────────────────
export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
