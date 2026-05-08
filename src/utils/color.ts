/**
 * Convierte un color hex a sus componentes RGB.
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

/**
 * Convierte componentes RGB a hex.
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Mezcla dos colores hex. ratio: 0 = todo color1, 1 = todo color2.
 */
function mixColors(hex1: string, hex2: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio,
  );
}

/**
 * Aclara un color hex mezclándolo con blanco.
 */
function lighten(hex: string, amount: number): string {
  return mixColors(hex, '#FFFFFF', amount);
}

/**
 * Oscurece un color hex mezclándolo con negro.
 */
function darken(hex: string, amount: number): string {
  return mixColors(hex, '#000000', amount);
}

/**
 * Calcula la luminancia relativa de un color hex.
 */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Genera una paleta de 10 tonos (50-900) desde un color base.
 * Similar a la escala de iOS HIG.
 */
export function generateAccentPalette(base: string): Record<string, string> {
  const isDark = luminance(base) < 0.4;

  if (isDark) {
    return {
      50: lighten(base, 0.9),
      100: lighten(base, 0.72),
      200: lighten(base, 0.52),
      300: lighten(base, 0.3),
      400: lighten(base, 0.12),
      500: base,
      600: darken(base, 0.15),
      700: darken(base, 0.3),
      800: darken(base, 0.5),
      900: darken(base, 0.7),
    };
  }

  return {
    50: lighten(base, 0.85),
    100: lighten(base, 0.65),
    200: lighten(base, 0.42),
    300: lighten(base, 0.22),
    400: lighten(base, 0.08),
    500: base,
    600: darken(base, 0.1),
    700: darken(base, 0.25),
    800: darken(base, 0.42),
    900: darken(base, 0.6),
  };
}

/**
 * Convierte un hex a rgba con la opacidad dada.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Determina si conviene texto blanco o negro sobre un fondo dado.
 */
export function textColorForBackground(hex: string): string {
  return luminance(hex) > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Paleta de colores de acento predefinidos estilo iOS.
 */
export const accentColorOptions = [
  { key: 'blue', color: '#0A84FF', labelEs: 'Azul', labelEn: 'Blue' },
  { key: 'teal', color: '#5AC8FA', labelEs: 'Turquesa', labelEn: 'Teal' },
  { key: 'green', color: '#30D158', labelEs: 'Verde', labelEn: 'Green' },
  { key: 'yellow', color: '#FFD60A', labelEs: 'Amarillo', labelEn: 'Yellow' },
  { key: 'orange', color: '#FF9F0A', labelEs: 'Naranja', labelEn: 'Orange' },
  { key: 'red', color: '#FF453A', labelEs: 'Rojo', labelEn: 'Red' },
  { key: 'pink', color: '#FF375F', labelEs: 'Rosa', labelEn: 'Pink' },
  { key: 'purple', color: '#BF5AF2', labelEs: 'Púrpura', labelEn: 'Purple' },
  { key: 'indigo', color: '#5856D6', labelEs: 'Índigo', labelEn: 'Indigo' },
] as const;

export type AccentColorKey = (typeof accentColorOptions)[number]['key'];
