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

### Changed
- (plan) Recurrentes promovidos de Fase 6 a Fase 4 (incluidos en v1).
- (plan) iCloud Drive sync removido del scope (backup manual JSON es suficiente).
- (data) `settings` ahora distingue `primary_currency`, `language` y `locale`.
- (plan) Presupuestos pospuestos a v2 (v0.5 del roadmap). Tabla `budgets` no entra en la migration inicial.

### Fixed
- _Nada aún._

---

## Convención de entradas

Cada entrada debe ser corta, en pasado, y referenciar el módulo afectado entre paréntesis si aplica:

```
### Added
- (db) Tabla `transactions` con índices por fecha y categoría.
- (ui) Componente `GlassCard` con efecto blur dinámico.
```

Cuando se publique la primera versión jugable, mover entradas de `[Unreleased]` a una nueva sección `## [0.1.0] - YYYY-MM-DD`.
