# Changelog

Todos los cambios notables se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## Tipos de cambios

- **Added** — funcionalidad nueva.
- **Changed** — cambios en funcionalidad existente.
- **Deprecated** — funcionalidad que será removida pronto.
- **Removed** — funcionalidad eliminada.
- **Fixed** — corrección de bugs.
- **Security** — vulnerabilidades resueltas.

---

## [Unreleased]

### Added
- Estructura inicial de directorios del proyecto.
- Documentación base (`README.md`, `PLAN.md`, `SETUP.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONTRIBUTING.md`, `CLAUDE.md`).
- Documentación extendida en `docs/` (modelo de datos, stack, roadmap, ADRs).
- (data) Tipos de cuenta `checking` y `digital_wallet` (para Tenpo, MercadoPago, etc.) añadidos al modelo.
- (data) Tabla `exchange_rates` para soporte multi-moneda con tasas manuales.
- (i18n) Confirmado soporte bilingüe (es + en) desde v1.
- (bootstrap) Proyecto Expo inicializado (SDK 54, TypeScript estricto).
- (bootstrap) Dependencias core instaladas (expo-router, expo-sqlite, drizzle-orm, zustand, @tanstack/react-query, react-hook-form, zod, reanimated, gesture-handler, expo-blur, expo-haptics, expo-local-authentication).
- (bootstrap) Configuración de ESLint + Prettier.
- (bootstrap) Configuración de Expo Router con tabs (Inicio, Movimientos, Analítica, Ajustes).
- (bootstrap) Configuración de alias `@/*` → `src/*` en tsconfig.
- (bootstrap) Configuración base de EAS (`eas.json` con perfiles dev, preview, production).
- (design) Sistema de tokens: colores, espaciado, radios, tipografía, sombras, duraciones.
- (design) Temas claro y oscuro con `ThemeProvider` + detección automática.
- (design) Fuente Inter cargada con `expo-font` + `@expo-google-fonts/inter`.
- (ui) Componentes base: `Text`, `Button`, `Card`, `GlassCard`, `Input`, `Pill`, `EmptyState`, `Skeleton`.
- (ui) `GlassCard` con `expo-blur` y bordes luminosos estilo Liquid Glass.
- (i18n) Sistema bilingüe es/en con JSON + hook `useT()` tipado.
- (utils) Helpers de formato de moneda multi-divisa con `Intl.NumberFormat`.
- (utils) Helpers de formato de fecha (relativo, corto, nombres de mes).
- (types) Tipos compartidos centralizados (`Account`, `Transaction`, `Category`, etc.).
- (services) `getExpensesByCategory`, `getIncomeByCategory`, `getMonthlySummary` y `getTopExpenses` para analíticas.
- (ui) Componente `BarChart` para gráficos de barras horizontales por categoría.
- (analytics) Pantalla de analítica completa: selector de periodo, resumen ingresos/gastos/balance, gastos e ingresos por categoría con barras.
- (recurring) Hooks de React Query para reglas recurrentes (`useRecurringRules`, `useCreateRecurringRule`, `useUpdateRecurringRule`, `useToggleRecurringRule`, `useDeleteRecurringRule`).
- (recurring) Pantalla de listado de reglas recurrentes con toggle activo/pausado, edición y eliminación.
- (recurring) Pantalla modal para crear/editar reglas recurrentes (tipo, monto, cuenta, categoría, nota, frecuencia).
- (settings) Enlace a reglas recurrentes añadido en Ajustes.
- (persistence) Sincronización DB ↔ Zustand: stores (theme, i18n, settings) se hidratan desde DB al iniciar y se persisten automáticamente al cambiar.
- (settings) Toggle de Face ID / bloqueo biométrico en Ajustes.
- (settings) Claves i18n para seguridad/biométrico (es + en).
- (ux) Haptics (`expo-haptics`) integrados en settings, recurring, exchange-rates y new-transaction.
- (ux) Animaciones de transición `fade` en modales (new-transaction, new-recurring, new-exchange-rate).
- (fix) `createTx.mutate()` en new-transaction.tsx completado (objeto de datos real, antes era placeholder `...`).
- (design) Rediseño completo de tema: dark-only Liquid Glass con paleta `#08090f`, tokens glass, tipografía SF Pro (sistema iOS).
- (ui) Componente `BackgroundOrbs` con orbes de gradiente radial por pantalla.
- (ui) Componente `Toggle` custom (38×22px, Reanimated, knob animado).
- (ui) Iconos Ionicons en Tab Bar y pantallas (home, swap-horizontal, pie-chart, settings).
- (home) Pantalla Inicio rediseñada: hero de saldo 42px, stats grid 2 cols, mini barras mensuales, últimos movimientos con iconos de categoría.
- (movements) Pantalla Movimientos rediseñada: filtros pills, grupos por mes con glass, FAB centrado.
- (analytics) Pantalla Analítica rediseñada: gráfico de dona SVG, leyenda de categorías, tendencia de línea SVG, insight cards.
- (settings) Pantalla Ajustes rediseñada: grupos de rows con iconos, toggles custom, navegación consolidada.
- (deps) `react-native-svg` y `@expo/vector-icons` añadidos como dependencias directas.
- (design) Tema claro añadido: paleta `#f5f6fa`, tokens específicos, orbes reducidos, sombras en lugar de bordes.
- (theme) `ThemeProvider` dual dark/light con detección de sistema + toggle manual.
- (settings) Toggle "Modo oscuro" conectado a `useThemeStore`.
- (modals) Nuevo Movimiento, Nuevo Tipo de Cambio y Nueva/Editar Recurrente rediseñados: drag handle, segmentos, inputs glass.
- (accounts) Pantalla Cuentas rediseñada: glass cards con orbes, saldo coloreado, límite de crédito.
- (categories) Pantalla Categorías rediseñada: pills de filtro, dot de color, glass cards.
- (exchange-rates) Pantalla Tipos de Cambio rediseñada: glass cards con orbes, botón eliminar Ionicons, FAB.
- (new-exchange-rate) Nuevo Tipo de Cambio rediseñado: drag handle, pills de moneda, input glass.
- (backup) Exportar a JSON (todas las tablas) — Share sheet iOS vía `expo-sharing`.
- (backup) Exportar a CSV (movimientos con categoría y cuenta) — Share sheet iOS.
- (backup) Importar desde JSON — file picker + validación zod v4 (`backupDataSchema`).
- (backup) Borrar todos los datos con confirmación destructiva.
- (settings) Filas Exportar/Importar/Borrar conectadas al servicio `backup.ts`.
- (deps) `expo-document-picker` añadido (file picker para importar).
- (ux) Animaciones de transición `fade` en modales (new-transaction, new-recurring, new-exchange-rate).
- (fix) `createTx.mutate()` en new-transaction.tsx completado (objeto de datos real, antes era placeholder `...`).

### Changed
- (plan) Recurrentes promovidos de Fase 6 a Fase 4 (incluidos en v1).
- (plan) iCloud Drive sync removido del scope (backup manual JSON es suficiente).
- (data) `settings` ahora distingue `primary_currency`, `language` y `locale`.
- (plan) Presupuestos pospuestos a v2 (v0.5 del roadmap). Tabla `budgets` no entra en la migration inicial.
- (design) Tema cambiado a dark-only Liquid Glass (paleta `#08090f`, sin modo claro). `ThemeProvider` simplificado.
- (design) Fuente cambiada de Inter a SF Pro Display (fuente del sistema iOS).

### Fixed
- (bootstrap) `react-native-screens` ausente tras resolución de dependencias — reinstalado v4.16.0.
- (bootstrap) Assets placeholder (`icon.png`, `splash-icon.png`, etc.) creados para resolver warning de resolución.
- (bootstrap) `babel.config.js` creado con plugin de `react-native-reanimated`.
- (bootstrap) `babel-preset-expo` no instalado — agregado.
- (bootstrap) `react-native-worklets` faltante como peer dep de reanimated v4 — instalado v0.8.3.
- (bootstrap) Versiones de paquetes Expo alineadas a SDK 54 con `expo install --fix`.
- (bootstrap) App verificada en Expo Go desde iPhone — 4 tabs funcionales.

---

## Convención de entradas

Cada entrada debe ser corta, en pasado, y referenciar el módulo afectado entre paréntesis si aplica:

```
### Added
- (db) Tabla `transactions` con índices por fecha y categoría.
- (ui) Componente `GlassCard` con efecto blur dinámico.
```

Cuando se publique la primera versión jugable, mover entradas de `[Unreleased]` a una nueva sección `## [0.1.0] - YYYY-MM-DD`.
