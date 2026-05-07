# STACK.md

Detalle del stack técnico y por qué cada pieza está elegida.

---

## Resumen

| Capa | Pieza | Versión target |
| --- | --- | --- |
| Lenguaje | TypeScript | 5.4+ |
| Runtime | React Native | última New Architecture |
| Framework | Expo (managed) | SDK más reciente estable |
| Routing | expo-router | v3+ |
| Estado UI | Zustand | 4+ |
| Estado de datos | TanStack Query | v5 |
| ORM | Drizzle | última |
| DB | expo-sqlite | última |
| Forms | react-hook-form | 7+ |
| Validación | zod | 3+ |
| Animaciones | react-native-reanimated | 3+ |
| Gestos | react-native-gesture-handler | 2+ |
| Blur / Glass | expo-blur | última |
| Charts | victory-native (XL) o react-native-skia | última |
| Iconos | expo-symbols (SF Symbols) + lucide-react-native fallback | última |
| Haptics | expo-haptics | última |
| Auth biométrica | expo-local-authentication | última |
| File system | expo-file-system | última |
| Sharing | expo-sharing | última |
| i18n | sistema propio (JSON + hook), **es + en** desde v1 | — |

## Por qué Expo (managed)

- **Sin Mac:** EAS Build construye iOS en la nube. Sin Xcode local.
- **OTA updates:** posibilidad de empujar fixes sin republicar (no crítico para uso personal, pero útil).
- **Ecosistema integrado:** SDKs nativos preconfigurados (file system, blur, symbols, etc.).
- **Iteración rápida:** Expo Go en iPhone físico para 95% del trabajo.

## Por qué expo-router

- File-based routing → menos boilerplate.
- Stack + tabs nativos coherentes con iOS.
- Soporta layouts compartidos y rutas modales out-of-the-box.

## Por qué Zustand + TanStack Query (no Redux)

- **Zustand:** API mínima, sin providers, sin acciones boilerplate. Suficiente para tema, sesión, UI flags.
- **TanStack Query:** caché de queries del DB, invalidación quirúrgica, refetch automático. Aunque no haya backend, los datos del DB local se benefician igual.
- **Redux:** overkill para este tamaño.

## Por qué Drizzle (no Prisma, no raw SQL)

- **Type-safe** sin generación de cliente runtime (Prisma sufre en RN).
- **Migrations declarativas** generadas por CLI.
- **Funciona perfecto con expo-sqlite** y soporta New Architecture.
- API similar a SQL — fácil debug.

## Por qué expo-blur (y no soluciones nativas Liquid Glass)

- React Native aún no expone el material `glass` de iOS 26.
- `expo-blur` da un blur de fondo aceptable y multiplataforma.
- Para refracción real habría que escribir un módulo Swift custom o usar Skia — fuera de scope para v1.

## Por qué SF Symbols vía expo-symbols

- Coherencia visual exacta con iOS.
- Adaptación automática a peso/tema.
- Fallback a Lucide solo donde SF no cubra.

## Por qué Inter (no SF Pro)

- SF Pro tiene licencia restrictiva (no puede embeberse fuera de apps Apple firmadas).
- **Inter** es la sustituta open-source más cercana en métricas y diseño.
- Cuando la app corre en iOS real, podemos usar `system` font para máxima fidelidad y Inter como fallback.

## Charts: decisión pendiente

Dos opciones bajo consideración:

1. **Victory Native XL** — API más amigable, soporte amplio.
2. **react-native-skia + recharts approach** — más performante y bonito, pero más código custom.

**Recomendación inicial:** empezar con Victory Native XL en Fase 4 y migrar a Skia solo si hay problemas de rendimiento o si queremos animaciones complejas en analíticas.

## Lo que **no** vamos a usar

- ❌ **Firebase / Supabase / cualquier backend** — innecesario para uso personal local.
- ❌ **Redux / MobX** — Zustand cubre.
- ❌ **NativeBase / Tamagui / Gluestack** — preferimos componentes propios para control total del estilo Liquid Glass.
- ❌ **Styled Components** — `StyleSheet.create` es más rápido y nativo.
- ❌ **Sentry / Bugsnag** — sin telemetría por privacidad.
- ❌ **i18next** — overkill; un hook + JSON basta.
