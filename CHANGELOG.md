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

### Changed
- (plan) Recurrentes promovidos de Fase 6 a Fase 4 (incluidos en v1).
- (plan) iCloud Drive sync removido del scope (backup manual JSON es suficiente).
- (data) `settings` ahora distingue `primary_currency`, `language` y `locale`.
- (plan) Presupuestos pospuestos a v2 (v0.5 del roadmap). Tabla `budgets` no entra en la migration inicial.

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
