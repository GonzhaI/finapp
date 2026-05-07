# Architectural Decision Records (ADRs)

Carpeta donde se registran las decisiones técnicas relevantes del proyecto.

## ¿Qué es un ADR?

Un **ADR** captura una decisión arquitectónica importante: el contexto, las alternativas consideradas, la opción elegida y sus consecuencias. Sirve para que cualquier persona (o IA) que llegue después entienda **por qué** algo se hizo así, sin tener que re-debatirlo.

## Cuándo crear uno

- Cambio de stack o adopción de una librería significativa.
- Decisión sobre estructura de carpetas o convenciones globales.
- Trade-off entre dos enfoques con implicaciones a largo plazo.
- Reversal de una decisión anterior (crear un nuevo ADR que marca el viejo como **superseded**).

**No** crees un ADR para detalles tácticos (nombre de una variable, color de un botón).

## Formato

Archivo: `NNNN-titulo-corto.md` (numeración secuencial, 4 dígitos).

```markdown
# NNNN — Título corto

- **Estado:** Propuesto | Aceptado | Superseded por NNNN | Deprecated
- **Fecha:** YYYY-MM-DD
- **Autor:** [nombre o "IA + nombre"]

## Contexto

¿Qué problema o pregunta motiva esta decisión? ¿Qué restricciones aplican?

## Alternativas consideradas

1. **Opción A** — pros / contras.
2. **Opción B** — pros / contras.
3. **Opción C** — pros / contras.

## Decisión

La opción elegida y por qué (en 1-2 párrafos).

## Consecuencias

- ✅ Lo que ganamos.
- ⚠️ Lo que aceptamos como costo.
- 🔁 Cosas que habrá que monitorear o revisar más adelante.
```

## ADRs actuales

- [`0001-stack-react-native-expo.md`](0001-stack-react-native-expo.md)
- [`0002-storage-sqlite-drizzle.md`](0002-storage-sqlite-drizzle.md)
- [`0003-local-first-no-backend.md`](0003-local-first-no-backend.md)
