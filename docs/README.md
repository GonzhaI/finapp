# docs/

Documentación extendida del proyecto. Para una visión general empieza en el [`README.md` raíz](../README.md).

## Índice

| Archivo | Contenido |
| --- | --- |
| [`STACK.md`](STACK.md) | Librerías elegidas y por qué |
| [`DATA_MODEL.md`](DATA_MODEL.md) | Entidades, relaciones, reglas de negocio |
| [`ROADMAP.md`](ROADMAP.md) | Visión por versiones (v0.1 → v1.0) |
| [`adr/`](adr/) | Architectural Decision Records |

## Mantenimiento

- Cualquier cambio en stack → actualizar `STACK.md` y crear ADR si es estructural.
- Cualquier cambio en esquema → actualizar `DATA_MODEL.md` y crear migration en `src/db/migrations/`.
- Cualquier cambio en visión de versiones → ajustar `ROADMAP.md`.
