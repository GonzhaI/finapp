# ROADMAP.md

Visión a largo plazo del producto. `PLAN.md` ejecuta esto en pasos concretos.

---

## v0.1 — MVP usable (objetivo: usar la app a diario)

- Cuentas básicas (efectivo, débito, crédito).
- Categorías editables.
- Crear / editar / borrar transacciones (ingreso, gasto).
- Dashboard simple: saldo total + gasto del mes.
- Lista de movimientos agrupados por día.
- Filtro por mes.
- Tema claro/oscuro automático.
- Backup manual JSON.

## v0.2 — Analíticas

- Gráfico de gasto por categoría (mes).
- Evolución mensual (últimos 6 meses).
- Top 5 categorías del mes.
- Comparativa mes actual vs mes anterior.

## v0.3 — Personalización

- Selector de acento de color.
- Selector de moneda y formato regional.
- Reordenar categorías y cuentas.
- Cambio de iconos por categoría.

## v0.4 — Transferencias y multi-cuenta avanzada

- Transferencias entre cuentas (con par atómico).
- Vista por cuenta con saldo individual.
- Tarjetas de crédito con límite y "deuda actual".

## v0.5 — Presupuestos

- Presupuestos mensuales por categoría.
- Indicador visual de avance (anillo / barra).
- Notificación local al rebasar (vía `expo-notifications`).

## v0.6 — Recurrentes

- Reglas para auto-crear ingresos/gastos fijos.
- Vista de "próximos cobros".
- Edición / pausa de reglas.

## v0.7 — Quality of life

- Bloqueo Face ID al abrir.
- Búsqueda en transacciones.
- Etiquetas (tags) opcionales en transacciones.
- Adjuntar foto de boleta (`expo-image-picker`, guardada en `FileSystem.documentDirectory`).

## v0.8 — Import y export avanzado

- Export CSV.
- Import CSV con mapeo de columnas.
- Sync iCloud Drive opcional para backup.

## v1.0 — Pulido y release personal

- Animaciones revisadas.
- Empty states completos.
- Onboarding (primera ejecución).
- Build production firmado vía EAS.
- Instalación vía TestFlight (uso interno).

---

## Ideas futuras (sin compromiso)

- Widgets de iOS (saldo en pantalla de inicio).
- Atajos de Siri ("registrar gasto").
- Live Activities para próximos cobros.
- Watch app companion.
- Modo "viaje" con segunda moneda activa.
- ML local para sugerir categoría según texto de la nota.
