# DATA_MODEL.md

Modelo de datos preliminar (sujeto a refinar en Fase 3). Pensado para SQLite + Drizzle.

> **Convenciones globales:**
> - IDs: `text` (UUIDv7 generado en cliente).
> - Fechas: `integer` (epoch en milisegundos UTC). Se formatean en UI según `locale`.
> - Montos: `integer` en **unidades menores** de la moneda (centavos). Evita errores de coma flotante.
> - Soft-delete: campo `deleted_at` cuando aplique. Las queries por defecto excluyen filas borradas.

---

## 1. Diagrama (resumen)

```
accounts ─┬── transactions ──┬── categories
          │                  │
          │                  └── (subcategories opcional v2)
          │
          └── budgets (categorias × periodo)   [v2 — fuera de v1]

recurring_rules ─→ generan transactions

settings (singleton)
currencies (catálogo precargado)
exchange_rates (tasas manuales por par + fecha)
```

## 2. Entidades

### `accounts`

Cuentas reales del usuario (efectivo, débito, tarjeta de crédito, ahorros, inversión).

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | UUIDv7 |
| `name` | text | Único por usuario |
| `kind` | text | `cash` \| `debit` \| `checking` \| `digital_wallet` \| `credit` \| `savings` \| `investment` \| `other` |
| `provider` | text? | Nombre legible cuando aplica: `Tenpo`, `MercadoPago`, `BancoEstado`, etc. (solo informativo, no condiciona lógica) |
| `currency` | text | ISO 4217 (`CLP`, `USD`, `EUR`...) |
| `initial_balance` | integer | Saldo al crear, en unidades menores |
| `credit_limit` | integer? | Solo si `kind = credit` |
| `color` | text | Hex (visualización) |
| `icon` | text | Identificador SF Symbol |
| `archived` | integer (0/1) | Excluye de totales activos |
| `created_at` | integer | epoch ms |
| `updated_at` | integer | epoch ms |

**Saldo actual** = `initial_balance + Σ transactions de la cuenta`. Calculado, no almacenado.

### `categories`

Categorías de transacción (ej: Comida, Transporte, Sueldo).

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | |
| `name` | text | Único dentro del mismo `kind` |
| `kind` | text | `income` \| `expense` |
| `color` | text | Hex |
| `icon` | text | SF Symbol id |
| `parent_id` | text? | Para subcategorías (v2) |
| `archived` | integer (0/1) | |
| `sort_order` | integer | Orden manual |
| `created_at` | integer | |

### `transactions`

Cada movimiento de dinero.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | |
| `account_id` | text FK → accounts | |
| `category_id` | text? FK → categories | Null para transferencias |
| `kind` | text | `income` \| `expense` \| `transfer` |
| `amount` | integer | Siempre **positivo**. El signo lo da `kind` |
| `currency` | text | Moneda al momento (igual al de `account` salvo multi-moneda) |
| `occurred_at` | integer | Fecha del movimiento (no de creación) |
| `note` | text? | Texto libre del usuario |
| `transfer_pair_id` | text? | Solo si `kind = transfer`: id de la transacción contraparte |
| `recurring_id` | text? FK → recurring_rules | Si fue auto-generado |
| `created_at` | integer | |
| `updated_at` | integer | |
| `deleted_at` | integer? | Soft-delete |

**Índices:**
- `idx_transactions_occurred_at` (para vistas por periodo)
- `idx_transactions_account_id`
- `idx_transactions_category_id`

**Transferencias:** se representan como **dos** filas (un `expense` en cuenta origen y un `income` en cuenta destino) con `transfer_pair_id` cruzado y sin `category_id`. Esto mantiene el saldo correcto sin lógica especial.

### `budgets` _(v2 — no implementar en v1)_

Presupuestos por categoría y periodo. Se añadirán en una migration nueva cuando llegue la v0.5 del roadmap. Se documenta aquí solo como referencia futura.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | |
| `category_id` | text FK | |
| `amount` | integer | Tope del periodo |
| `period` | text | `monthly` (v1), `weekly`, `yearly` (futuro) |
| `currency` | text | |
| `starts_on` | integer | epoch ms (inicio aplicable) |
| `created_at` | integer | |

### `recurring_rules` (Fase 4 — v1)

Reglas para auto-generar transacciones recurrentes (sueldo, suscripciones).

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | |
| `template` | json | Snapshot de la transacción a crear |
| `cron` | text | Expresión simple (`monthly:1`, `weekly:mon`) |
| `next_run_at` | integer | epoch ms |
| `active` | integer (0/1) | |

### `settings`

Singleton (siempre 1 fila).

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK | siempre `1` |
| `primary_currency` | text | Moneda en la que se consolidan totales del dashboard (ej. `CLP`) |
| `language` | text | `es` \| `en` (sigue al sistema si `null`) |
| `locale` | text | Para formateo numérico/fecha: `es-CL`, `en-US`, etc. |
| `theme` | text | `system` \| `light` \| `dark` |
| `accent_color` | text | Hex |
| `biometric_lock` | integer (0/1) | _nice-to-have, default 0_ |
| `first_run_at` | integer | |

### `currencies` (catálogo)

Lista de monedas soportadas (precargada). No editable por el usuario.

| Campo | Tipo |
| --- | --- |
| `code` | text PK (ISO 4217) |
| `symbol` | text |
| `decimal_places` | integer |
| `name_es` | text |
| `name_en` | text |

Precargadas mínimas en seed: `CLP`, `USD`, `EUR`, `ARS`, `BRL`, `MXN`, `GBP`, `PEN`, `UYU`. Ampliable.

### `exchange_rates`

Tasas de cambio **manuales** entre pares de monedas. Sin API externa (decisión local-first).

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | |
| `from_currency` | text FK → currencies.code | |
| `to_currency` | text FK → currencies.code | |
| `rate` | real | `1 from = rate to`. Ej: `1 USD = 950 CLP` → `rate = 950` |
| `effective_at` | integer | epoch ms (desde cuándo aplica) |
| `created_at` | integer | |

**Resolución de tasa:** para convertir un monto, se elige la fila más reciente del par (`from`, `to`) con `effective_at <= fecha del cálculo`. Si no existe el par directo, se intenta `to → from` invertido (`1 / rate`). Si no hay ninguna tasa, mostrar el monto en su moneda original con badge "sin conversión".

## 3. Reglas de negocio

1. **Borrar una cuenta** con transacciones: bloquear y sugerir archivar.
2. **Borrar una categoría** con transacciones: bloquear y sugerir archivar.
3. **Archivar** oculta de selectores y totales pero conserva histórico.
4. **Transfer**: ambas filas se crean/borran/editan **atómicamente** (en una transacción SQL).
5. **Multi-moneda**: cada cuenta tiene su propia moneda y cada transacción guarda la moneda original. La conversión a la moneda principal del usuario ocurre **solo en UI** usando la tabla `exchange_rates` (manual). Los totales del dashboard suman convertido; los detalles de cada cuenta muestran su moneda nativa.
6. **Saldo de cuenta de crédito**: se muestra como deuda (signo invertido) si `kind = credit`. Disponible = `credit_limit - deuda_actual`.
7. **Wallet digital**: `kind = digital_wallet` se trata operativamente igual que `debit` (saldo prepago, sin línea de crédito), pero se diferencia en UI/iconos (Tenpo, MercadoPago, etc. usando `provider`).
8. **Cuenta corriente** (`checking`): igual que `debit`, pero permite saldos negativos (sobregiro). El saldo se calcula igual; no hay validación de fondos al registrar.

## 4. Migrations

- Nombre: `NNNN_descripcion.sql` (ej: `0001_initial.sql`).
- Generadas con `drizzle-kit generate`.
- Aplicadas al boot por `migrate(db, { migrationsFolder: ... })`.
- **Nunca** editar una migration ya aplicada en producción/uso real — crear una nueva.

## 5. Backups

- **Export JSON**: dump de todas las tablas + versión de esquema.
- **Import JSON**: valida con zod, abre transacción SQL, vacía y reescribe. Si algo falla, rollback.
- Estructura de archivo:
  ```json
  {
    "schema_version": 1,
    "exported_at": 1730000000000,
    "data": {
      "accounts": [...],
      "categories": [...],
      "transactions": [...],
      "budgets": [...],
      "settings": {...}
    }
  }
  ```

## 6. Preguntas abiertas

_Ninguna por ahora._ Todas las decisiones de producto fueron resueltas el 2026-05-06. Cualquier nueva pregunta surgida durante la implementación va aquí.
