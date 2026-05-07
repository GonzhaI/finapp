# 0002 — Persistencia: SQLite con Drizzle ORM

- **Estado:** Aceptado
- **Fecha:** 2026-05-06
- **Autor:** Gonzalo (con apoyo IA)

## Contexto

La app es **local-first** (sin backend). Necesita guardar miles de transacciones, hacer queries por rango de fecha, agregaciones por categoría/cuenta y soportar migrations sin perder datos del usuario.

## Alternativas consideradas

1. **AsyncStorage / MMKV** — clave-valor. Insuficiente para queries complejas y agregaciones.
2. **WatermelonDB** — ORM reactivo sobre SQLite. Potente pero pesado y con boilerplate alto.
3. **Realm** — bueno pero su integración con Expo managed es más fricción y la licencia/futuro tras la compra por MongoDB es menos predecible.
4. **expo-sqlite raw** — funciona pero perderíamos type-safety y tendríamos que escribir migrations a mano.
5. **expo-sqlite + Drizzle ORM** — type-safe, migrations declarativas con `drizzle-kit`, queries SQL legibles, baja superficie de API.

## Decisión

Usar **expo-sqlite** como motor y **Drizzle** como ORM/migrador.

## Consecuencias

- ✅ Type-safety end-to-end (esquema TS → tipos auto en queries).
- ✅ Migrations versionadas reproducibles.
- ✅ Performance nativa de SQLite.
- ✅ API simple, no requiere "cliente" runtime generado (a diferencia de Prisma que sufre en RN).
- ⚠️ Hay que aprender Drizzle (curva muy suave si se sabe SQL).
- ⚠️ El backup tiene que serializarse a JSON para portabilidad (no sirve copiar el archivo `.db` entre devices iOS sin entitlements).
- 🔁 Si la app crece a sync multi-device, evaluar opciones de replicación (no en roadmap actual).
