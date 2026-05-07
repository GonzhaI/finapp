# ARCHITECTURE.md

Visión técnica del proyecto: estructura de carpetas, capas, flujos de datos y decisiones transversales.

---

## 1. Vista de capas

```
┌────────────────────────────────────────────┐
│                UI (app/, src/components)    │ ← Pantallas y componentes
├────────────────────────────────────────────┤
│            Hooks de queries / mutaciones    │ ← TanStack Query
├────────────────────────────────────────────┤
│         Servicios de dominio (src/services) │ ← Cálculos, reglas de negocio
├────────────────────────────────────────────┤
│         Repositorios (src/db/repositories)  │ ← Acceso a datos
├────────────────────────────────────────────┤
│       Drizzle ORM + expo-sqlite (src/db)    │ ← Persistencia
└────────────────────────────────────────────┘

Estado UI transversal: Zustand (src/store/)
```

**Regla:** una capa solo conoce las que están **debajo** suyo. Los componentes UI **nunca** importan directamente de `src/db/`; siempre van vía hooks o servicios.

## 2. Estructura de carpetas

```
finapp/
├── app/                       # Rutas (expo-router, file-based)
│   ├── _layout.tsx            # Layout raíz (theme provider, query provider)
│   ├── (tabs)/                # Tabs principales: home, movimientos, analítica, ajustes
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Home / Dashboard
│   │   ├── movements.tsx
│   │   ├── analytics.tsx
│   │   └── settings.tsx
│   ├── transaction/[id].tsx   # Detalle de movimiento
│   └── new-transaction.tsx    # Modal de creación
├── src/
│   ├── components/
│   │   ├── ui/                # Primitivos: Text, Button, Card, GlassCard, Sheet, Input...
│   │   └── charts/            # Wrappers de gráficos
│   ├── screens/               # Composiciones de pantalla complejas (no rutas)
│   ├── hooks/
│   │   ├── queries/           # useTransactions, useAccounts, useCategories...
│   │   └── mutations/         # useCreateTransaction...
│   ├── store/                 # Zustand stores: themeStore, sessionStore...
│   ├── db/
│   │   ├── client.ts          # Conexión Drizzle + expo-sqlite
│   │   ├── schema.ts          # Definición de tablas
│   │   ├── migrations/        # SQL generado por drizzle-kit
│   │   └── repositories/      # Funciones de acceso por entidad
│   ├── services/              # Lógica de negocio pura (sin dependencias UI)
│   │   ├── transactions.ts    # cálculos de saldo, agrupación por periodo
│   │   ├── budgets.ts
│   │   └── export.ts          # JSON / CSV
│   ├── theme/
│   │   ├── tokens.ts          # Colores, spacing, radii, type
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── ThemeProvider.tsx
│   ├── lib/                   # Wrappers finos sobre librerías
│   ├── utils/                 # Helpers genéricos (date, currency, format)
│   ├── i18n/                  # Traducciones (es, en si aplica)
│   └── types/                 # Tipos compartidos
├── assets/                    # Estáticos
├── docs/                      # Documentación extendida
└── scripts/                   # Scripts de mantenimiento (dev seed, cleanup, etc.)
```

## 3. Flujo de datos típico

**Ejemplo: el usuario registra un nuevo gasto.**

1. UI → `app/new-transaction.tsx` (form con `react-hook-form` + `zod`).
2. Submit → `useCreateTransaction()` (TanStack Query mutation).
3. La mutation llama a `repositories/transactions.create(data)`.
4. El repositorio escribe vía Drizzle en SQLite.
5. Al éxito, la mutation invalida queries (`['transactions']`, `['accounts', accountId]`).
6. Las pantallas suscritas reciben los nuevos datos automáticamente.

## 4. Capa de persistencia

- **Motor:** SQLite (vía `expo-sqlite`).
- **ORM:** Drizzle (typesafe, migrations declarativas, generador `drizzle-kit`).
- **Migrations:** archivos SQL versionados en `src/db/migrations/`. Se aplican al boot con `migrate()`.
- **Backup:** snapshot de la DB exportable a JSON (no copia binaria). Restore valida con zod antes de escribir.

Detalle del esquema en [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).

## 5. Estado

| Tipo de estado | Herramienta | Ubicación |
| --- | --- | --- |
| Datos del DB | TanStack Query | `src/hooks/queries`, `src/hooks/mutations` |
| UI / sesión / theme | Zustand | `src/store/` |
| Form local | react-hook-form | inline en componentes |
| Server cache | (no aplica — sin servidor) | — |

**Regla:** si un estado vive en el DB, **no** lo dupliques en Zustand. Lee con un hook de query.

## 6. Tema y diseño

Tokens en `src/theme/tokens.ts`. Dos temas: `light.ts` y `dark.ts`. El `ThemeProvider` expone `useTheme()`. Componentes nunca importan colores directos: solo `theme.color.surface`, `theme.spacing.md`, etc.

Más en [`DESIGN.md`](DESIGN.md).

## 7. Routing

`expo-router` (file-based). Navegación stack + tabs. Modales como rutas con presentación `modal`. Layouts compartidos con `_layout.tsx`.

## 8. Internacionalización

`src/i18n/` con archivos JSON por idioma. Hook `useT(key)` simple. Por defecto **es-CL** (ajustar según preferencia del autor en Fase 2).

## 9. Privacidad

- Cero red por defecto. `expo-network` solo se usa si el usuario activa export por share-sheet.
- Sin SDK de analytics, crash reporting ni publicidad.
- Bloqueo opcional con `expo-local-authentication` (Face ID).
- Backups exportables al usuario (no automáticos a la nube).

## 10. Calidad

- TypeScript estricto.
- ESLint + Prettier configurados; corren en pre-commit con `lint-staged` (opcional).
- Tests con Jest (o Vitest si encaja con Expo) para `src/services/` y `src/utils/`.
- Sin tests de UI por ahora (proyecto personal, costo > beneficio).

## 11. Builds y distribución

EAS Build (cloud). Perfiles en `eas.json`:

- `development` — incluye Expo dev client + tus deps custom.
- `preview` — build interno tipo TestFlight.
- `production` — release final.

Sin macOS local. Toda firma y provisioning la gestiona EAS.

## 12. Decisiones registradas (ADRs)

Las decisiones que afectan estructura, dependencias o estrategia se registran en `docs/adr/NNNN-titulo.md`. Ver `docs/adr/README.md` para el formato.
