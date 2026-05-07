# PLAN.md

Hoja de ruta accionable del proyecto. Cada bloque es una **fase** con sus tareas. Marca con `[x]` lo completado, deja `[ ]` lo pendiente. Mantén el documento corto: las decisiones de fondo van en `docs/adr/`.

> **Estado actual:** Fase 2 (sistema de diseño + i18n) avanzada. Componentes base, tema claro/oscuro, i18n, y utilidades listos. Próximo paso: Fase 3 (capa de datos).

---

## Fase 0 — Planificación y documentación 📚

- [x] Definir alcance del producto (uso personal, local-first).
- [x] Elegir stack base (RN + Expo + TS).
- [x] Crear estructura de directorios.
- [x] Crear documentación base (README, PLAN, SETUP, ARCHITECTURE, DESIGN, CONTRIBUTING, CLAUDE).
- [x] Documentar modelo de datos preliminar (`docs/DATA_MODEL.md`).
- [ ] Validar las **preguntas abiertas** (ver final de este archivo).

## Fase 1 — Bootstrap del proyecto Expo ⚙️

- [x] Inicializar proyecto: `npx create-expo-app@latest . --template blank-typescript`.
- [x] Configurar `tsconfig.json` estricto + alias `@/*` → `src/*`.
- [x] Instalar dependencias core: `expo-router`, `expo-sqlite`, `drizzle-orm`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `expo-blur`, `react-native-reanimated`, `react-native-gesture-handler`.
- [x] Configurar ESLint + Prettier (config en `eslint.config.mjs` y `.prettierrc`).
- [x] Configurar Expo Router (entry point + layout raíz).
- [x] Configurar EAS (`eas.json` con perfiles dev, preview, production). `easet login` + `easet init` pendiente por ser interactivo.
- [x] Probar build en Expo Go desde iPhone físico (escaneo QR).
- [ ] Crear primer **EAS development build** instalable en iPhone.

## Fase 2 — Sistema de diseño + i18n 🎨

- [x] Definir tokens de tema (`src/theme/tokens.ts`): colores, espaciado, radios, tipografía.
- [x] Implementar tema claro y oscuro con detección automática.
- [x] Componentes base (`src/components/ui/`): `Text`, `Button`, `Card`, `GlassCard`, `Input`, `Pill`, `EmptyState`, `Skeleton`.
- [x] Implementar `GlassCard` con `expo-blur` + bordes sutiles (aproximación a Liquid Glass).
- [ ] Definir paleta de iconos (SF Symbols vía `expo-symbols` o fallback a Lucide).
- [x] Cargar fuente principal (Inter como sustituto de SF Pro).
- [x] **i18n bilingüe**: estructura `src/i18n/{es,en}.json` + hook `useT(key)` con detección de locale del sistema.
- [x] Helpers de **formato multi-moneda** (`src/utils/currency.ts`) usando `Intl.NumberFormat`.
- [x] Tipos compartidos en `src/types/index.ts` (Account, Transaction, Category, etc.).
- [ ] Storybook ligero o pantalla `/dev/playground` para previsualizar componentes.

## Fase 3 — Capa de datos 🗄️

- [x] Definir esquema en Drizzle (`src/db/schema.ts`) según `docs/DATA_MODEL.md`.
- [x] Configurar conexión `expo-sqlite` + Drizzle.
- [x] Sistema de migraciones (`src/db/migrations/`).
- [x] Tipos de cuenta soportados: `cash`, `debit`, `checking`, `digital_wallet`, `credit`, `savings`, `investment`, `other`.
- [x] Tabla `currencies` precargada (CLP, USD, EUR, ARS, BRL, GBP, MXN, PEN, UYU).
- [x] Tabla `exchange_rates` para conversión manual (par moneda + tasa + fecha).
- [x] Tabla `recurring_rules` (incluida en v1, no postergada).
- [x] Seed con datos de ejemplo (categorías, monedas, cuentas default).
- [x] Repositorios (`src/db/repositories/`): `accounts`, `categories`, `transactions`, `recurringRules`, `exchangeRates`, `settings`.
- ❌ Sin tabla `budgets` en v1 (pospuesto a v2).
- [x] Hooks de query con TanStack Query (`src/hooks/queries/`): mutations y queries para cada entidad.
- [x] `QueryClientProvider` integrado en layout raíz.

## Fase 4 — Pantallas principales 📱

- [ ] **Home / Dashboard** — saldo total (consolidado en moneda principal), ingresos vs gastos del mes, últimos movimientos, próximos cobros recurrentes.
- [ ] **Movimientos** — lista filtrable + agrupada por día.
- [ ] **Nuevo movimiento** — sheet modal con form (monto, moneda, categoría, cuenta, fecha, nota).
- [ ] **Analíticas** — gráficos por categoría, evolución, top gastos.
- [ ] **Cuentas** — listado por tipo (cash / debit / checking / wallet / credit), detalle, transferencia entre cuentas (incluso entre monedas distintas).
- [ ] **Categorías** — CRUD con icono + color.
- [ ] **Recurrentes** — pantalla dedicada para crear/pausar/editar reglas (sueldo, suscripciones, etc.).
- [ ] **Ajustes** — tema, moneda principal, idioma (es/en), tasas de cambio, respaldo, borrar datos.

## Fase 5 — Personalización y pulido ✨

- [ ] Selector de **acento de color** (la app cambia paleta al instante).
- [ ] Modo automático/claro/oscuro.
- [ ] Selector de moneda principal y formato regional.
- [ ] Editor de tasas de cambio (manual: ej. `1 USD = 950 CLP`).
- [ ] Animaciones de transición entre pantallas (Reanimated + shared element).
- [ ] Haptics en acciones clave (`expo-haptics`).
- [ ] Bloqueo con Face ID al abrir (`expo-local-authentication`) — _nice-to-have_.

## Fase 6 — Backups y export 💾

- [ ] Export a JSON (Share sheet de iOS).
- [ ] Export a CSV.
- [ ] Import desde JSON (con validación zod).
- ~~iCloud Drive~~ — fuera de scope; backup manual basta según decisión del autor.

## Fase 7 — QA y release personal 🚢

- [ ] Tests de utilidades críticas (cálculos, formateadores) con Vitest o Jest.
- [ ] Probar en iPhone real con uso diario durante 1-2 semanas.
- [ ] Pulir copy, vacíos, estados de error.
- [ ] Build de producción y instalación vía TestFlight (uso interno) o Ad-Hoc.

---

## ✅ Decisiones del producto (resueltas el 2026-05-06)

1. **Multi-moneda:** ✅ **Sí, con soporte multi-moneda.** Cada cuenta y transacción guarda su moneda. Conversión opcional con tasa configurable manualmente (sin API externa por ahora).
2. **Cuentas reales del usuario:**
   - Efectivo (`cash`)
   - Débito (`debit`)
   - **Cuenta corriente** (`checking`) — nuevo `kind`
   - **Wallets digitales** (`digital_wallet`) — para Tenpo, MercadoPago, etc. — nuevo `kind`
   - Crédito (`credit`) — soportado para uso futuro (aún no tiene)
3. **Presupuestos:** ✅ **Pospuestos a v2.** Razón: primero acumular datos reales con el tracker, luego decidir topes informados. Ver `docs/ROADMAP.md` v0.5.
4. **Recurrentes:** ✅ **Sí, en v1.** Sueldo y suscripciones se auto-registran según reglas. Promoverlo de Fase 6 a Fase 4.
5. **Bloqueo biométrico (Face ID):** 🟡 **Nice-to-have.** Queda en Fase 5 (no bloqueante).
6. **Idiomas:** ✅ **Español + inglés desde el inicio.** i18n preparado en Fase 2.
7. **Backup:** ✅ **Export manual JSON.** iCloud queda fuera de scope inicial.
