# DESIGN.md

Sistema de diseño y principios UX. Esta es la fuente de verdad visual del proyecto.

---

## 1. Principios

1. **Calma sobre densidad.** Mucho aire. Tipografía clara. Pocos elementos por pantalla.
2. **Forma sigue al gesto.** Los movimientos son la acción central — accesible en 1-2 toques desde cualquier lugar.
3. **Material translúcido.** Inspiración en Liquid Glass: superficies blur con sutil borde luminoso.
4. **Color con propósito.** Acento solo donde haya acción o significado (ingreso vs gasto). El resto es neutro.
5. **Transiciones fluidas.** 60fps obligatorio. Reanimated en interacciones; nunca animar en JS thread.
6. **Cero fricción.** Inputs prerellenados con valores frecuentes (última cuenta, última categoría).
7. **Privacidad visible.** El usuario siempre sabe que sus datos no salen del teléfono.

## 2. Liquid Glass desde React Native: qué es viable

iOS 26 introduce **Liquid Glass** como material nativo (translúcido, refractivo, dinámico). React Native **no expone el componente nativo directamente**, así que aproximamos:

| Efecto Liquid Glass | Aproximación en RN | Librería |
| --- | --- | --- |
| Blur de fondo dinámico | `BlurView` con `intensity` modulada | `expo-blur` |
| Bordes sutiles luminosos | `borderWidth: StyleSheet.hairlineWidth` + `borderColor` con alpha | nativo |
| Refracción / distorsión | No reproducible sin Skia/Shader | (omitir o `react-native-skia` para hero elements) |
| Highlights al tap | Animación de overlay con `useSharedValue` | `react-native-reanimated` |
| Sombras suaves | `shadowColor` + `shadowOpacity` bajo + `shadowRadius` alto | nativo |

**Componente clave:** `<GlassCard>` en `src/components/ui/glass-card/`. Wrap de `BlurView` con presets (`tint`, `intensity`, `border`).

> **Nota futura:** monitorear paquetes como `@callstack/liquid-glass` o módulos Expo nuevos que expongan `UIVisualEffectView` con material `.glass`. Migrar en cuanto exista una opción estable.

## 3. Tokens

Definidos en `src/theme/tokens.ts`. Estos son los valores base; los temas (`light.ts`, `dark.ts`) los mapean a colores semánticos.

### Colores (paleta neutra base)

```ts
export const palette = {
  // Greys (warm)
  ink:       { 50: '#F8F8F7', 100: '#EFEEEC', 200: '#DCDAD5', 400: '#A9A6A0', 600: '#5C5A55', 900: '#1A1917' },
  // Acentos (configurables por usuario en Fase 5)
  accent:    { default: '#0A84FF' /* iOS blue */ },
  // Semánticos
  income:    '#30D158',  // verde iOS
  expense:   '#FF453A',  // rojo iOS
  warning:   '#FF9F0A',
};
```

### Espaciado (escala base 4)

```
xs: 4   sm: 8   md: 12   lg: 16   xl: 24   2xl: 32   3xl: 48
```

### Radio

```
sm: 8   md: 14   lg: 22   xl: 28   pill: 999
```

### Tipografía

Fuente: **Inter** (sustituto open-source de SF Pro). Pesos: 400 / 500 / 600 / 700.

| Token | Tamaño | Line height | Uso |
| --- | --- | --- | --- |
| `display` | 34 | 41 | Saldo en dashboard |
| `title1` | 28 | 34 | Headers de sección |
| `title2` | 22 | 28 | Títulos de pantalla |
| `body` | 17 | 22 | Texto principal |
| `subhead` | 15 | 20 | Texto secundario |
| `caption` | 13 | 18 | Metadatos |

> Tracking ligeramente negativo en displays (-0.4) para emular SF Pro.

## 4. Componentes base (target)

| Componente | Responsabilidad |
| --- | --- |
| `<Text variant>` | Tipografía consistente |
| `<Button kind size>` | Acciones primarias / secundarias / ghost |
| `<Card>` | Superficie sólida |
| `<GlassCard>` | Superficie translúcida con blur |
| `<Sheet>` | Modal bottom sheet (gestos de cierre) |
| `<Input>` | Field con label flotante |
| `<AmountInput>` | Numérico optimizado (teclado decimal, formato live) |
| `<Pill>` | Tag pequeño (categoría, cuenta) |
| `<TabBar>` | Barra inferior translúcida |
| `<EmptyState>` | Vacíos con icono + mensaje |
| `<Skeleton>` | Loading shimmer |

## 5. Iconografía

- Preferencia: **SF Symbols** (vía `sf-symbols-react-native` o `expo-symbols`). Da máxima coherencia con iOS.
- Fallback: **Lucide** (`lucide-react-native`) para iconos no cubiertos por SF.
- Tamaños estándar: 16, 20, 24, 28.

## 6. Animaciones

- Library: **react-native-reanimated v3+**.
- Duraciones base: `fast 150ms`, `base 250ms`, `slow 400ms`.
- Easing: `cubic-bezier(.2, .8, .2, 1)` (iOS-like).
- Reglas:
  - Toda animación corre en UI thread (`useSharedValue`, `useAnimatedStyle`).
  - Transiciones entre rutas: fade + slight scale para modales; slide nativo para stack.
  - Haptics suaves (`Haptics.selectionAsync`) en cambios de tab y submit de form.

## 7. Layout

- Safe area siempre respetada (`react-native-safe-area-context`).
- Padding horizontal estándar: `lg (16)`.
- Listas: separadores **inset** (no full bleed) cuando son densas; sin separadores en cards apiladas.
- Scroll: `bounces` activo, indicadores ocultos por defecto.

## 8. Estados visuales

Cada elemento interactivo define al menos: `default`, `pressed`, `disabled`. Botones primarios además: `loading`.

## 9. Patrones UX

- **Capturar transacción rápido**: FAB (botón flotante) abre sheet en <300ms con foco automático en monto.
- **Categorías recientes** primero al elegir.
- **Confirmación destructiva** (borrar transacción) vía action sheet nativo.
- **Empty states con acción**: cada vacío sugiere el siguiente paso.
- **Edición inline** en montos cuando sea posible.

## 10. Qué evitar

- ❌ Modales encima de modales.
- ❌ Sombras planas, bordes duros, rellenos de color saturados.
- ❌ Animaciones decorativas que no comunican estado.
- ❌ Texto multicolor en la misma frase.
- ❌ Icons rasterizados (PNG) cuando SF Symbol o vector existe.

## 11. Referencias visuales

- Apps a observar: **Apple Wallet**, **Apple Cash**, **Copilot Money**, **Cleo**, **Linear iOS**, **Things 3**.
- Recursos: WWDC 2025 sessions sobre Liquid Glass, Human Interface Guidelines (Materials, Color, Typography).
