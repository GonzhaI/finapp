# CLAUDE.md

> Este archivo lo lee automáticamente Claude Code (y otras IAs compatibles) al iniciar sesión en este repositorio. Mantenlo **breve, denso y actualizado**.

## Qué es este proyecto

App móvil **iOS** de **gestión de finanzas personales**, uso individual del autor. **Local-first** (sin backend). Stack: React Native + Expo + TypeScript. Estética inspirada en iOS 26 / Liquid Glass.

## Reglas de oro al trabajar aquí

1. **Idioma:** toda la documentación (`.md`) y los comentarios significativos se escriben en **español**. Identificadores de código en inglés.
2. **Plataforma:** solo iOS importa. No mantener compatibilidad Android salvo que sea trivial.
3. **Entorno del autor:** Windows. **No sugerir** comandos macOS, Xcode local, ni iOS Simulator. Para probar, asumir Expo Go en iPhone físico o EAS Build.
4. **Local-first:** no proponer servicios cloud (Firebase, Supabase, etc.) sin razón fuerte. La data vive en SQLite del dispositivo.
5. **Gestión de estado:** Zustand para UI/sesión, TanStack Query para data del DB. **No** Redux.
6. **Estilos:** sistema de tokens en `src/theme/`. **No** usar valores hardcoded de color/spacing en componentes.
7. **Componentes:** preferir composición sobre props enormes. Cada componente UI vive en `src/components/ui/<Componente>/index.tsx`.
8. **Validación:** todo input de usuario y todo dato de DB pasa por **zod**.
9. **Antes de añadir una dependencia:** verificar que es compatible con **Expo managed workflow**. Si requiere linkeo nativo manual, descartarla.
10. **Cambios visibles:** actualizar `CHANGELOG.md` (sección `[Unreleased]`).

## Lo que NUNCA debes hacer

- ❌ Crear archivos `.md` de planificación adicionales sin pedir (ya hay suficientes; actualiza los existentes).
- ❌ Añadir analytics, telemetría o tracking de cualquier tipo.
- ❌ Sugerir abrir Xcode, instalar CocoaPods, o cualquier paso que requiera Mac.
- ❌ Eliminar `.gitkeep` de directorios vacíos sin haber añadido contenido real al directorio.
- ❌ Hacer commits con `--no-verify` o saltarse hooks.
- ❌ Cambiar el stack base sin documentarlo en un ADR (`docs/adr/`).

## Convenciones de código

- TypeScript estricto (`"strict": true`).
- Imports absolutos con alias `@/*` → `src/*`.
- Nombres: componentes `PascalCase`, hooks `useCamelCase`, archivos kebab o pascal (consistente por carpeta).
- Una exportación nombrada por archivo en componentes; default export solo para rutas de `app/`.
- Funciones puras donde sea posible (especialmente cálculos en `src/services/`).

## Flujo de trabajo recomendado

1. Lee `PLAN.md` para ver la fase actual y la próxima tarea.
2. Si la tarea es ambigua, revisa la sección de **Preguntas abiertas** en `PLAN.md`.
3. Implementa, actualiza `CHANGELOG.md` y marca la tarea `[x]` en `PLAN.md`.
4. Si tomas una decisión arquitectónica relevante, añade un **ADR** en `docs/adr/`.

## Archivos clave para contexto

- `README.md` — visión general
- `PLAN.md` — qué falta y qué sigue
- `ARCHITECTURE.md` — cómo está estructurado el código
- `DESIGN.md` — sistema visual y principios UX
- `docs/DATA_MODEL.md` — entidades, relaciones y reglas
- `docs/STACK.md` — librerías elegidas y por qué
- `docs/adr/` — decisiones arquitectónicas registradas

## Estado actual (actualizar cada cambio importante)

- **Fase:** 2 completa. Fase 3 — capa de datos implementada (esquema Drizzle, migraciones, repositorios, hooks TanStack Query). Próximo: Fase 4 (pantallas principales).
- **Decisiones de producto resueltas (2026-05-06):** multi-moneda ✔, cuentas (cash/debit/checking/digital_wallet/credit) ✔, recurrentes en v1 ✔, bilingüe es+en ✔, Face ID nice-to-have, backup manual JSON ✔, presupuestos pospuestos a v2 ✔.
- **Bloqueos:** ninguno. Listo para Fase 1 (`npx create-expo-app` + setup base).
