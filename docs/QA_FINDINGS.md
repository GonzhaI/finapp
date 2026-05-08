# QA Findings — finapp

**Fecha del escaneo:** 2026-05-07
**Alcance:** todo el código de `app/` y `src/`, configuración (`tsconfig.json`, `eslint.config.mjs`, `babel.config.js`, `app.json`, `eas.json`), i18n y documentación cruzada.
**Estado:** auditoría sólo de código, sin cambios. Severidad: 🔴 crítico · 🟠 importante · 🟡 calidad · 🟢 limpieza.

> **Salud general:** `tsc --noEmit` ✓ pasa sin errores. `eslint` reporta 1 error en `babel.config.js`. No hay `console.log`, ni `TODO/FIXME`, ni `@ts-ignore`. Stack y arquitectura coherentes con `ARCHITECTURE.md`. Los problemas son mayormente de **integración** (stores ↔ DB ↔ UI) y de **promesas no cumplidas** en pantallas que aparentan funcionar pero no lo hacen end-to-end.

---

## 🔴 Críticos

### C1. No hay procesador de reglas recurrentes
`recurring_rules` se crea, edita, pausa y borra en UI. Sin embargo, **ningún job/servicio** ejecuta las reglas vencidas (`nextRunAt <= Date.now()`) para crear las transacciones automáticas. Búsqueda exhaustiva (`grep -E "processRecurring|getDue|nextRunAt"`) sólo encuentra usos en UI/edición.
- **Impacto:** la feature "Recurrentes en v1" (decisión de producto resuelta el 2026-05-06) está en UI pero no funciona. El usuario crea un sueldo mensual y nunca aparece la transacción.
- **Dónde:** falta servicio en `src/services/` (sugerencia: `recurring.ts` con `processDueRules()`) y un disparo en `app/_layout.tsx` (al arranque y al volver a `active` desde `AppState`).
- **Notas:** `recurringRulesRepo.getActive()` ya existe pero nadie lo llama; falta lógica para avanzar `nextRunAt` según el cron.

### C2. `getAccountBalance` suma transferencias como ingresos
`src/services/balances.ts:31-32`:
```ts
if (row.kind === 'income' || row.kind === 'transfer') {
  balance += row.total;
} else if (row.kind === 'expense') {
  balance -= row.total;
}
```
Si una transferencia se modela con dos rows (origen `-` / destino `+`), tratar `'transfer'` como income duplica el saldo. Si se modela con una sola row positiva pero con `transferPairId`, no se considera el lado opuesto. **No existe consenso documentado** sobre la convención de transferencias en `docs/DATA_MODEL.md`, y el código no la implementa.
- **Impacto:** el saldo total en el dashboard puede ser incorrecto en cuanto el usuario haga su primera transferencia.
- **Dónde:** `src/services/balances.ts` + decisión de producto sobre cómo se persisten las transferencias.

### C3. Toggle "Liquid Glass" decorativo
`app/(tabs)/settings.tsx:39, 147-152`: `liquidGlass` es un `useState(true)` local que **no se persiste, no afecta a ningún componente y no tiene consumidor**. Es un checkbox que no hace nada.
- **Dónde:** `app/(tabs)/settings.tsx:39`.

### C4. Toggle "Modo oscuro" rompe la opción "Sistema"
`app/(tabs)/settings.tsx:135-139`: `darkMode = themeMode === 'dark'` → si el usuario está en `'system'` y el sistema está en oscuro, el toggle se ve apagado. Al tocarlo se fuerza a `'light'` o `'dark'` y se pierde la preferencia del sistema. No hay forma de volver a `'system'` desde la UI.
- **Dónde:** `app/(tabs)/settings.tsx:42, 135-139`.
- **Recomendación:** usar 3 segmentos (Sistema / Claro / Oscuro) — los strings ya existen en i18n (`settings.themeSystem`, `themeLight`, `themeDark`).

### C5. `BackgroundOrbs` memoiza sin dependencias
`src/components/ui/BackgroundOrbs/index.tsx:23`:
```ts
const memoizedOrbs = useMemo(() => orbs, []);
```
La dependencia es `[]` en lugar de `[orbs]`. Cada pantalla pasa `isDark ? darkOrbs : lightOrbs`, pero **el switch no se aplica nunca después del primer render**. Cambiar el tema en runtime no actualiza los orbes.
- **Dónde:** `src/components/ui/BackgroundOrbs/index.tsx:23`.
- **Adicional:** `app/(tabs)/movements.tsx:116` pasa `movementsOrbs` directamente (sin `isDark` ternario), por lo que esa pantalla **siempre muestra orbes oscuros**. Pero la rama de loading sí lo respeta — inconsistencia.

### C6. `GlassCard` tiene `tint="dark"` hardcodeado
`src/components/ui/GlassCard/index.tsx:32`: `tint="dark"` siempre. El componente está diseñado en `DESIGN.md` como pieza clave del Liquid Glass; en modo claro va a verse oscuro. **No tiene caller actualmente** (ver L1) pero el bug existe.
- **Dónde:** `src/components/ui/GlassCard/index.tsx:32`.

### C7. Importación JSON no es atómica
`src/services/backup.ts:170-231` (`importFromJSON`): borra todas las tablas y reinserta en bloques sucesivos sin transacción. Si falla a mitad de import (ej. una row inválida, un FK roto), la DB queda en estado inconsistente y **el usuario pierde sus datos** sin posibilidad de rollback.
- **Dónde:** `src/services/backup.ts:186-222`.
- **Fix:** envolver todo en `db.transaction(...)` o snapshot previo.

### C8. `clearAllData` no borra `settings`
`src/services/backup.ts:233-240`: borra todas las tablas excepto `settings`. El usuario que pulsa "Borrar todos los datos" se queda con sus preferencias antiguas (acent color, locale, biometric, primaryCurrency).
- **Dónde:** `src/services/backup.ts:233-240`.
- **Decisión pendiente:** ¿es intencional? Si lo es, conviene documentarlo y mostrarlo en el copy del Alert.

### C9. `importFromJSON` usa una API inexistente
`src/services/backup.ts:172`: `await File.pickFileAsync(...)` — `File` no expone `pickFileAsync` en `expo-file-system` v19. La selección de archivos en Expo se hace con `expo-document-picker` (que ya está en deps: `^55.0.13`). Es probable que esto **lance en runtime al pulsar "Importar datos"**.
- **Dónde:** `src/services/backup.ts:172, 180`.
- **Fix:** usar `import * as DocumentPicker from 'expo-document-picker'` y `DocumentPicker.getDocumentAsync(...)`.

---

## 🟠 Importantes

### I1. Insight "Día más caro" muestra el nombre de la categoría
`app/(tabs)/analytics.tsx:296-310`: la card titulada *"Día más caro"* (según `SCREENS.md` debería mostrar un día de la semana, ej. *Viernes*) muestra `expenseBreakdown[0].categoryName` — el nombre de la categoría más cara. Es un dato útil pero el label miente.
- **Dónde:** `app/(tabs)/analytics.tsx:296-310`.

### I2. La gráfica de tendencia ignora el filtro de periodo
`app/(tabs)/analytics.tsx:75`: `getMonthlySummary(6)` se llama con un literal — la curva siempre muestra los últimos 6 meses, aunque el usuario haya elegido "Últimos 12 meses" arriba.
- **Dónde:** `app/(tabs)/analytics.tsx:75`.

### I3. Dashboard hardcodea "Gasto mensual 2026"
`app/(tabs)/index.tsx:206`: el label del mini-gráfico dice literalmente `'Gasto mensual 2026'`. En enero de 2027 sigue diciendo 2026.
- **Dónde:** `app/(tabs)/index.tsx:206`.

### I4. Persistencia de stores correcta pero con bucle de escrituras al arranque
`app/_layout.tsx:19-60` tiene dos efectos sobre `migrationResult.success`:
1. Lee de DB y llama a `setAccentColor / setMode / setLocale / setPrimaryCurrency / setLocale / setBiometricLock`.
2. Suscribe los stores y, en cada cambio, llama a `settingsRepo.upsert(...)`.

Como ambos efectos se ejecutan tras la migración, el primero **dispara los listeners del segundo** → 5+ writes innecesarios a DB en cada arranque (incluso sin cambios). Funciona pero es ruidoso y oculta posibles condiciones de carrera al cambiar de idioma/locale.
- **Fix:** usar el middleware `persist` de Zustand contra `AsyncStorage`/MMKV, o un flag `isHydrated` que evite que los listeners disparen durante la hidratación inicial.

### I5. `useThemeStore` y `useSettingsStore` y `useI18nStore` son tres stores con responsabilidades superpuestas
- `i18nStore.locale`: `'es' | 'en'`
- `settingsStore.locale`: `'es-CL' | 'en-US' | …` (formato regional)
- `themeStore.mode`: `'system' | 'light' | 'dark'`
- `themeStore.accentColor`: `'#0A84FF'`

Los tres se sincronizan a la misma fila `settings` de DB. Las dos `locale` viven en stores distintos sin que nada las relacione (un usuario podría tener `language='en'` con `locale='es-CL'`). Riesgo de incoherencia.
- **Dónde:** `src/store/{i18nStore,settingsStore,themeStore}.ts`.

### I6. `accentColor` default es `#0A84FF` (azul iOS) pero `SCREENS.md` y `DESIGN.md` usan `#7864f0` (púrpura)
El acento "principal" documentado es púrpura. El default real en código es azul. Se nota visualmente: tab bar activa, FAB y muchos elementos arrancan en azul.
- **Dónde:** `src/store/themeStore.ts:15`, `src/db/schema.ts:71`, `src/db/repositories/settings.ts:33`, `src/db/migrations/migrations.ts:62`.

### I7. Dashboard llama a la DB en cada render
`app/(tabs)/index.tsx:49-56` invoca `getTotalBalance()`, `getMonthRange()`, `getTotalsInRange()` por fuera de TanStack Query. Cada render recorre la DB. Más grave: **si el usuario crea una transacción desde el FAB, la query `txns` se invalida pero `getTotalBalance` se recalcula sólo si el componente vuelve a renderizar — y lo hace porque el hook devuelve nuevo `data`.** En pantallas sin txns se mantiene cacheado el valor obsoleto.
- **Recomendación:** envolver estos cálculos en `useQuery` con queryKeys dedicadas (`['balances','total']`, `['totals', from, to]`) e invalidarlas en los mutationFn que tocan transactions.

### I8. Invalidaciones de cache parciales
`src/hooks/queries/useTransactions.ts:34-35`:
```ts
qc.invalidateQueries({ queryKey: ['transactions'] });
qc.invalidateQueries({ queryKey: ['accounts', variables.accountId] });
```
La queryKey de `useAccounts()` es `['accounts']` (sin id), y prefix-match sólo invalida queries que comienzan con `['accounts', accountId]`. Por lo tanto **la lista de cuentas con saldos no se invalida tras crear una transacción**. Esto se compone con I7 (los saldos los calcula el dashboard, no `useAccounts`).
- **Dónde:** `src/hooks/queries/useTransactions.ts:34-35`.

### I9. Hook `useAccount(id)` y `useTransaction(id)` no tienen contraparte de saldo
No hay queries específicas para "balance de la cuenta X" — sólo el cálculo síncrono de `services/balances.ts`. Esto vuelve la pantalla de Cuentas (`app/accounts.tsx:60`) a llamar `getAccountBalance(item.id)` por cada item en `renderItem`, sin cache, ejecutando una query SQL por fila en cada render del FlatList.
- **Dónde:** `app/accounts.tsx:60` + `src/services/balances.ts`.

### I10. `seed()` se llama sin `await`
`app/_layout.tsx:21`: `seed()` es `async` y se llama sin `await`. Es fire-and-forget. En la práctica funciona porque los selects del seed son rápidos y no compiten con la UI, pero **no hay garantía de que las monedas estén insertadas** cuando una pantalla las pida por primera vez.
- **Dónde:** `app/_layout.tsx:21`.

### I11. Filtros de Movimientos siempre en español
`app/(tabs)/movements.tsx:20-25, 152-154`:
```ts
const filterLabels = { all: { es: 'Todos', en: 'All' }, ... };
const label = f === 'currentMonth' ? new Date().toLocaleString('es', ...) : filterLabels[f].es;
```
Usa `.es` siempre. Y `.toLocaleString('es', ...)` ignora el locale del usuario. La app tiene i18n bilingüe pero esta pantalla sólo habla español.
- **Dónde:** `app/(tabs)/movements.tsx:152-154, 88-91`.

### I12. `getMonthlySummary` también usa `'es'` hardcodeado
`src/services/analytics.ts:129`: `date.toLocaleString('es', { month: 'short', year: '2-digit' })`. Mismo problema que I11, en una capa más profunda.
- **Dónde:** `src/services/analytics.ts:129`.

### I13. Validación zod inexistente fuera de `backup.ts`
`CLAUDE.md` regla 8: *"todo input de usuario y todo dato de DB pasa por zod"*. En la práctica:
- Los formularios (`new-transaction.tsx`, `new-recurring.tsx`, `new-exchange-rate.tsx`) toman valores de `useState<string>`, llaman `parseFloat` / `Number` y los pasan al repo sin validación.
- Los repos no validan con zod antes de insertar.
- Sólo `backup.ts` usa zod (para el JSON de import).
- **Riesgo bajo** en uso personal pero contradice una regla declarada.

### I14. Botón "Inicio de mes" decorativo
`app/(tabs)/settings.tsx:103-111`: la fila "Inicio de mes" muestra "Día 1" y al tocarla sólo dispara `haptics.selection()`. Sin acción real. Debería abrir un picker o quitarse.

### I15. Selector de moneda como cycle es UX confuso
`app/(tabs)/settings.tsx:96-101`: tap en "Moneda" pasa por las 9 monedas en orden. Para cambiar de CLP a USD el usuario tiene que tocar 1 vez; para volver a CLP, 8 veces. Debería ser un picker o sheet.

---

## 🟡 Calidad / convenciones

### Q1. Colores hardcoded en pantallas (violación CLAUDE.md regla 6)
`CLAUDE.md`: *"sistema de tokens en `src/theme/`. **No** usar valores hardcoded de color/spacing en componentes."*
- `app/(tabs)/settings.tsx:131`: `iconBg: 'rgba(20,20,40,0.5)'`.
- `app/(tabs)/index.tsx:377`: `<Ionicons name="add" color="#FFFFFF" />`.
- `app/(tabs)/movements.tsx:298`: `<Ionicons name="add" color="#FFFFFF" />`.
- `app/recurring.tsx:156`: `thumbColor="#FFFFFF"`.
- `app/recurring.tsx:190`: `<Ionicons name="add" color="#FFFFFF" />`.
- `app/exchange-rates.tsx:125`: `<Ionicons name="add" color="#FFFFFF" />`.
- `app/new-transaction.tsx:140`: `placeholderTextColor="rgba(255,255,255,0.2)"`.
- `app/new-recurring.tsx:193`: idem.
- `src/components/ui/Toggle/index.tsx:77`: `backgroundColor: '#FFFFFF'` (knob).
- `src/components/ui/BackgroundOrbs/index.tsx`: las `OrbDef` constantes tienen rgba inline (es legítimo aquí porque el componente es un *design primitive*, pero podrían vivir en `theme/tokens.ts` para consistencia).

### Q2. Strings hardcoded en pantallas (i18n incompleto)
A pesar de tener `useT()` y JSON bilingüe, muchísima UI está en español duro:
- **Dashboard** (`app/(tabs)/index.tsx`): `Balance total`, `+X% este mes`, `INGRESOS`, `GASTOS`, `Gasto mensual 2026`, `Últimos movimientos`, `Ver todos`, `Ingreso`, `Gasto`.
- **Settings** (`app/(tabs)/settings.tsx`): `General`, `Apariencia`, `Seguridad`, `Datos`, `Gestión`, `Modo oscuro`, `Liquid Glass`, `Inicio de mes`, `Día 1`, `Moneda`, `Exportar datos`, `Importar datos`, `Borrar todos los datos`, `CSV / JSON`, `Desde archivo JSON`, `FinApp v1.0.0 · Modo offline`, `Elige el formato`, `JSON (completo)`, `CSV (movimientos)`, `Importación exitosa`, `Esta acción eliminará permanentemente…`, `Borrar todo`.
- **Analytics**: `Total gastado`, `TENDENCIA DE GASTO`, `Prom. $X/mes`, `Día más caro`, `Ahorro mensual`, `↑ X% del gasto`, `↑ X% del ingreso`.
- **New Transaction / New Recurring**: `Nuevo movimiento`, `Gasto`, `Ingreso`, `Transf.`, `Cuenta`, `Categoría`, `Nota (opcional)`, `Ej: …`, `Monto`.
- **Accounts**: `Cuentas`, `Sin cuentas`, los `kindLabels` (Efectivo, Débito, …).
- **Categories**: `Categorías`, `Sin categorías`, `Todos / Gastos / Ingresos`.

Las claves para muchos de estos ya existen en `es.json`/`en.json` (`settings.theme*`, `home.totalBalance`, `home.income`, `home.expense`, etc.), simplemente no se están usando.

### Q3. `any` declarado y suprimido
`src/i18n/useT.ts:25-26`: `// eslint-disable-next-line` + `let current: any`. Tipable como `unknown` con narrowing.

### Q4. ESLint falla en `babel.config.js`
`babel.config.js:1` reporta `'module' is not defined no-undef`. La config no tiene override para `*.config.{js,cjs}` con globals de CommonJS. Resultado: `npm run lint` falla con código !=0 aunque el código TypeScript esté limpio.
- **Fix:** añadir un bloque `{ files: ['*.config.js'], languageOptions: { globals: { module: 'readonly', require: 'readonly', __dirname: 'readonly' } } }` o ignorar el archivo.

### Q5. Patrón repetitivo en mutation hooks
Los 5 archivos en `src/hooks/queries/*.ts` usan el patrón `(data) => repo.create(data) as unknown as Promise<unknown>`. Drizzle/expo-sqlite es síncrono, y la coerción es para que TanStack reciba algo "promesa-ish". Funciona pero:
- Pierde el tipo del retorno: `_data` en `onSuccess` siempre es `unknown`.
- Se podría escribir `mutationFn: async (data) => repo.create(data)` y dejar que TS infiera.

### Q6. `tokens.ts` exporta `palette / glass / textColor` que nadie usa
`src/theme/tokens.ts:4-88`: tres bloques grandes de tokens que **no se importan en ningún archivo** (verificado con grep). El `ThemeProvider` reescribe los colores hex inline en lugar de usarlos. Resultado: dos fuentes de verdad de colores (la declarada y la usada).
- **Recomendación:** o borrar las constantes muertas, o reescribir el ThemeProvider para consumirlas.

### Q7. Iconos de seed con SF Symbols, no con Ionicons
`src/db/seed.ts:33-43`: las categorías default tienen `icon: 'fork.knife' | 'house' | 'tv' | …` (SF Symbols). Pero el resto de la UI usa Ionicons (`@expo/vector-icons`). Las pantallas terminan haciendo *icon mapping por nombre de categoría* (`app/(tabs)/index.tsx:30-40, 83-92`, `app/(tabs)/movements.tsx:27-46`) — duplicación y poco DRY. La columna `icon` de la DB no se usa en lectura.
- **Dónde:** `src/db/seed.ts` + handlers en pantallas.
- **Decisión:** o pasar a SF Symbols con `expo-symbols` (instalado pero no usado) y leer `icon` desde DB, o cambiar el seed a nombres de Ionicons.

### Q8. Cálculos N+1 en dashboard / cuentas
`getTotalBalance()` itera cuentas y para cada una invoca `getAccountBalance` (que hace 2 queries). En `app/accounts.tsx:60` se llama también por cada fila. Para 5 cuentas son ~10 queries por render. Aceptable en local pero remplazable por un `GROUP BY accountId` en una sola consulta.
- **Dónde:** `src/services/balances.ts`.

### Q9. Concatenación de hex con alpha
`app/(tabs)/index.tsx:282`, `app/(tabs)/movements.tsx:214`: `${tx.categoryColor}26` (alpha hex `26` ≈ 15%) y `Pill` con `${color}20`. Hay `hexToRgba` en `src/utils/color.ts` sin usar. Debería ser la única forma de aplicar alpha a hex de DB para soportar tanto `#RRGGBB` como `#RGB`.

### Q10. Schema vs tipos vs migración inconsistentes en `Settings.firstRunAt`
- `src/db/schema.ts:73`: `firstRunAt: integer('first_run_at')` → nullable.
- `src/db/migrations/migrations.ts:64`: `\`first_run_at\` integer` → nullable.
- `src/types/index.ts:91`: `firstRunAt: number` → no nullable.

Si la fila de settings se inserta sin `firstRunAt`, `settingsRepo.get()` retorna `firstRunAt: null` y TS espera `number`.

### Q11. `useCategories` sin `staleTime`
Las demás queries usan `10_000` o `30_000`. `useCategories` no especifica → 0ms (refetch en cada montaje). Es de bajo impacto pero inconsistente.

### Q12. `default export` vs `named export`
`CLAUDE.md`: *"Una exportación nombrada por archivo en componentes; default export solo para rutas de `app/`."*
Cumplido. ✓ (Verificación rápida: ningún componente en `src/components/ui/*` tiene `default`, todos los archivos en `app/*` tienen `default`.)

### Q13. `splash.backgroundColor` en blanco
`app.json:14`: `"backgroundColor": "#ffffff"`. La app es modo oscuro por defecto. El splash arranca blanco y la app se vuelve negra al cargar — flash de color inverso.

---

## 🟢 Limpieza / desalineación

### L1. Componentes y utilidades sin uso
Verificado con `grep -r "from .*<name>"`:
- `src/components/ui/GlassCard/index.tsx` — exportado, no se importa en ninguna pantalla.
- `src/components/ui/BarChart/index.tsx` — idem.
- `src/utils/color.ts` → `generateAccentPalette`, `hexToRgba`, `textColorForBackground`, `accentColorOptions`, `AccentColorKey` — ninguno se importa fuera del propio archivo.

`PLAN.md` marca *"Selector de acento de color"* como completado en Fase 5, pero `accentColorOptions` no aparece en ninguna pantalla → la feature **no está expuesta al usuario** aunque exista la infraestructura.

### L2. `tokens.ts` con bloques duplicados
`palette / glass / textColor` son una fuente paralela a `createDarkColors / createLightColors` del `ThemeProvider`. Dos formas de decir lo mismo, ninguna canónica.

### L3. CHANGELOG no menciona la fase actual
Las últimas líneas de `CHANGELOG.md` (vistas durante el escaneo) hablan del rediseño de modales pero no incluyen el cambio de docs reciente (`SCREENS.md`, link cruzado, actualización de `CLAUDE.md`). Coherente con la regla de actualizar `[Unreleased]` — sólo apunte para no olvidar al cerrar la fase.

### L4. `app.json` faltan campos para producción
- `bundleIdentifier: "dev.anomalyco.finapp"` — OK.
- `version: "1.0.0"` — coincide con CHANGELOG.
- Faltan: `ios.buildNumber`, `infoPlist` con `NSFaceIDUsageDescription` (requerido por `expo-local-authentication` para producción), `splash` adaptado a dark mode.

### L5. `seed()` siempre vuelve a chequear currencies
`src/db/seed.ts:9-10`: cada arranque hace un `select limit 1` para decidir si seedear. Aceptable, pero un flag `Settings.firstRunAt` ya está pensado precisamente para esto y no se usa.

### L6. Estructura de directorios
Verificada contra `ARCHITECTURE.md` y `README.md`. Coincide con la estructura documentada (`app/`, `src/components/ui/`, `src/hooks/queries/`, `src/db/repositories/`, `src/services/`, `src/store/`, `src/theme/`, `src/utils/`, `src/i18n/`, `src/types/`). ✓

### L7. Métricas
- 41 archivos `.ts/.tsx` en `src/`.
- 13 rutas en `app/`.
- 0 tests.
- `tsc --noEmit`: 0 errores.
- `eslint`: 1 error (Q4).
- `console.*` / `TODO` / `@ts-ignore`: 0 ocurrencias.

---

## Resumen de prioridades sugeridas (sin tocar código)

1. **Antes de soltar a uso diario:** C1 (recurrentes inertes), C2 (transferencias), C9 (import revienta), C7 (import no atómico), C5 (orbes no responden al tema).
2. **Antes de TestFlight:** C3, C4, I1, I2, I3 (features visibles que mienten), Q4 (lint en verde), L4 (Info.plist Face ID).
3. **Calidad de fondo (Fase 7 puede recorrer):** I7, I8, I9 (reactividad de saldos), I11, I12, Q2 (i18n), Q1 (colores hardcoded), I4–I5 (stores).
4. **Limpieza opcional:** L1 (código muerto), Q6 (tokens duplicados), Q7 (icon mapping vs DB), Q8 (N+1), Q9 (alpha hex).

> Esta nota es solo de auditoría — no se modificó código ni se cambió ningún otro `.md`. Cuando estés listo, podemos abordar los hallazgos por orden de prioridad o por agrupaciones temáticas (i18n completa, theme switch, recurrentes, backup).

---

# Pasada 2 — Correcciones y nuevos hallazgos (2026-05-07)

> Segunda revisión. Algunos hallazgos de la pasada 1 fueron incorrectos (los marco abajo). Además aparecen 2 pantallas y 1 servicio que no detecté la primera vez (`app/transaction-detail.tsx`, `app/new-account.tsx`, `src/services/recurring.ts`), lo cual cambia conclusiones y abre nuevos bugs.

## Correcciones a la pasada 1

### ⚠️ C1 (recurrentes inertes) — INVÁLIDO
Existe `src/services/recurring.ts` con `execRecurringRules()` y se invoca en `app/_layout.tsx:39` (después del seed) y `:74` (en cada `AppState change → 'active'`). El motor sí está conectado.

**Problemas reales del motor:** ver C-P2.1 a C-P2.4 abajo.

### ⚠️ C2 (transferencias mal sumadas) — REFINADO
Las transferencias **no se persisten con `kind='transfer'`** desde la UI. `app/new-transaction.tsx:68-101` las modela como **dos transacciones** del mismo `transferPairId` con `kind='expense'` (origen) y `kind='income'` (destino). Por lo tanto el bug de `getAccountBalance` (sumar `'transfer'` como ingreso) **no se manifiesta hoy**, pero sigue siendo:
- Una **bomba de tiempo** si llega un backup importado con rows `kind='transfer'`.
- Una **inconsistencia con el schema** que aún acepta `'transfer'` como enum válido — y con `docs/DATA_MODEL.md` (que no documenta la convención).
- Para `getTotalsInRange` (income/expense del mes): cada transferencia infla el ingreso del mes y a la vez el gasto, **distorsionando los KPIs del dashboard** ("Ingresos $X / Gastos $Y" mostrará valores hinchados).

### ⚠️ I4 (bucle de escrituras al arranque) — PARCIALMENTE INVÁLIDO
`app/_layout.tsx:19, 38, 48` ya tiene `isHydrated = useRef(false)` que se setea a `true` después de leer settings. El listener de `themeStore` (`unsub1`) lo respeta y no escribe durante la hidratación.
**Pero los otros dos listeners (`unsub2` i18n, `unsub3` settings) NO consultan `isHydrated`** — ver I-P2.1.

### ⚠️ L7 (métricas) — DESACTUALIZADO
- `app/` tiene **15 rutas**, no 13. Faltaron `new-account.tsx` y `transaction-detail.tsx`.
- `src/` tiene **42 archivos** `.ts/.tsx` (faltó `src/services/recurring.ts`).

---

## Nuevos hallazgos críticos

### C-P2.1. Edición de transacción/cuenta corrompe el monto en monedas con decimales
`app/transaction-detail.tsx:34`:
```ts
setAmount(String(tx.amount));  // tx.amount está en MINOR units (centavos)
```
Y al guardar (línea 69): `decimalToMinor(parseFloat(amount), ...)` reconvierte. Para CLP (decimals=0) es idempotente. **Para USD/EUR/cualquier moneda con decimals > 0:**
- Crear gasto de USD 12.34 → DB guarda `1234`.
- Abrir detalle, modo edit muestra `1234` en lugar de `12.34`.
- Si el usuario guarda sin tocar → `decimalToMinor(parseFloat("1234"), "USD") = 123400`. El gasto pasa de USD 12.34 a USD 1234.00 (× 100).

**Mismo bug** en `app/new-account.tsx:61`:
```ts
setInitialBalance(String(existing.initialBalance));
```
Y en `:76`: `initialBalance: Number(initialBalance) || 0` — además **nunca se llama a `decimalToMinor`**, así que la creación de cuentas con saldo inicial en USD/EUR ya guarda valores incorrectos *desde el primer save* (USD 100 → DB guarda `100` en vez de `10000`).

- **Dónde:** `app/transaction-detail.tsx:34, 69`; `app/new-account.tsx:61, 76`.

### C-P2.2. Edición de transacción ignora el cambio de cuenta
`app/transaction-detail.tsx:130-140` permite seleccionar una cuenta distinta en modo edit y guarda en `selectedAccount`. Pero `handleSave` (líneas 63-77) sólo manda al repo:
```ts
data: { amount, categoryId, note, updatedAt }
```
**Falta `accountId: account.id`.** El usuario cambia la cuenta visualmente, presiona Guardar, y el cambio no se persiste.
- **Dónde:** `app/transaction-detail.tsx:65-74`.

### C-P2.3. Borrar un lado de un par de transferencia deja al otro huérfano
`useDeleteTransaction` (`src/hooks/queries/useTransactions.ts:52-61`) hace soft-delete por id puntual. Las transferencias son dos rows con el mismo `transferPairId`. Si el usuario borra una, la otra queda sin contraparte: la cuenta original muestra `+/-` el monto sin razón visible.
- **Dónde:** `src/hooks/queries/useTransactions.ts` + `app/transaction-detail.tsx:55-61`.
- **Fix:** detectar `transferPairId` y soft-delete del par en una sola llamada (transacción SQLite).

### C-P2.4. Recurrente con monto inválido deja la regla "estancada" para siempre
`src/services/recurring.ts:52-88` itera reglas vencidas y, para cada una, hace `try { insert; update nextRunAt } catch { /* skip */ }`. Si el insert falla (ej. cast inválido del enum `kind`, monto NaN, accountId vaca por una regla huérfana), el catch silencia el error **y nunca avanza `nextRunAt`** → la regla queda permanentemente vencida y se reintenta en cada arranque/foreground sin éxito.
- **Impacto:** una regla rota silenciosamente bloquea su propio progreso (no las demás, gracias al try/catch por iteración) y consume CPU + 2 queries en cada wake-up.
- **Dónde:** `src/services/recurring.ts:53-88`.

### C-P2.5. Recurrente con backlog crea solo UNA transacción por arranque
`src/services/recurring.ts:42-91`: el bucle procesa cada regla **una sola vez** por invocación. Si una regla mensual quedó sin ejecutarse durante 3 meses (usuario no abrió la app), al volver:
- Se crea **1** transacción.
- Se avanza `nextRunAt` un mes (no a "ahora").
- La regla sigue vencida 2 meses → siguiente ejecución sólo pasa cuando el usuario reabre la app.

Resultado: el backlog se procesa "1 transacción por reapertura", lo cual nunca emparda con la realidad si el usuario abre la app esporádicamente.
- **Dónde:** `src/services/recurring.ts:52-88`.
- **Fix:** un `while (rule.nextRunAt <= now)` por regla, generando todas las transacciones acumuladas y avanzando hasta alcanzar el presente.

### C-P2.6. Recurrencia de transferencia pierde la cuenta destino
`app/new-transaction.tsx:123-138`: si la transacción es una transferencia *y* el toggle "Crear regla recurrente" está activo, la regla se guarda con:
```ts
template: { kind: isTransfer ? 'expense' : kind, ...accountId: account.id, ... }
```
Sólo persiste la cuenta origen y kind=expense — **se pierde `transferToAccount`**. Cuando la regla se ejecute, generará un gasto huérfano en la cuenta origen y nunca un ingreso espejo en destino. Mismo problema documental: el `template` esquemáticamente no soporta el segundo lado del par.
- **Dónde:** `app/new-transaction.tsx:127-134` + `src/db/schema.ts:54-60` (`template` es `text/json` libre, sin shape declarado).

### C-P2.7. `seed()` no espera y carrera con primer `execRecurringRules()`
**Corrige el I10 anterior**: tras leer `_layout.tsx:23-40`, `seed().then(() => { ... execRecurringRules() })` sí espera al seed antes de ejecutar reglas. ✓

Pero el `_layout.tsx:23` reemplaza el `seed()` sin `await` por `seed().then(...)`. **Si seed() lanza, el catch nunca se atrapa** (no hay `.catch`). El error se vuelve un *unhandled promise rejection* y la cadena no se ejecuta — los stores nunca se hidratan, `isHydrated` queda en `false`, y `execRecurringRules` no corre. La app se ve "viva" pero rota.
- **Dónde:** `app/_layout.tsx:23-40`.
- **Fix:** envolver en try/catch (función `async`) o agregar `.catch(...)`.

---

## Nuevos hallazgos importantes

### I-P2.1. `isHydrated` solo se respeta en el listener de `themeStore`
`app/_layout.tsx:47-60`:
```ts
const unsub1 = useThemeStore.subscribe((state) => {
  if (!isHydrated.current) return;            // ← guard presente
  settingsRepo.upsert({ theme, accentColor });
});
const unsub2 = useI18nStore.subscribe((state) => {
  settingsRepo.upsert({ language: state.locale });   // ← sin guard
});
const unsub3 = useSettingsStore.subscribe((state) => {
  settingsRepo.upsert({ primaryCurrency, locale, biometricLock });   // ← sin guard
});
```
Cuando el primer effect llama `setLocale / setPrimaryCurrency / setBiometricLock` durante la hidratación, los listeners de `i18n` y `settings` igualmente disparan `upsert` con los valores recién leídos → 4-5 writes redundantes a DB en cada arranque.
- **Dónde:** `app/_layout.tsx:51-60`.

### I-P2.2. `transaction-detail` no permite cambiar el `kind`
La pantalla muestra un badge `Ingreso/Gasto/Transferencia` (línea 109) pero no expone toggle para cambiarlo en modo edit. Si el usuario registró un gasto por error como ingreso, no puede corregirlo — sólo puede borrar y recrear.
- **Dónde:** `app/transaction-detail.tsx`.

### I-P2.3. Filtro de categorías por `kind` en transaction-detail no soporta transferencias
`app/transaction-detail.tsx:151`: `cats.filter((c) => c.kind === tx.kind)`. Las transferencias se persisten con `kind='expense'`/`'income'` (ver C2 refinado), por lo que esto funciona — **pero** muestra al usuario el listado de categorías de "expense" para *ambos* lados de la transferencia, y la categoría que elija sólo se aplica a la row editada (no al par).
- **Dónde:** `app/transaction-detail.tsx:151`.

### I-P2.4. `new Date(tx.occurredAt).toLocaleString()` sin locale
`app/transaction-detail.tsx:112`: usa el locale del runtime, no la preferencia del usuario.
- **Dónde:** `app/transaction-detail.tsx:112`.

### I-P2.5. Falta `KeyboardAvoidingView` en todos los formularios
`new-transaction.tsx`, `new-recurring.tsx`, `new-exchange-rate.tsx`, `new-account.tsx`, `transaction-detail.tsx` usan `ScrollView` con campos en la mitad inferior (Nota, Saldo inicial, Tasa) y un botón Guardar al final. Sin `KeyboardAvoidingView`, en iPhone el teclado tapa el botón. Verificación: `grep -i "KeyboardAvoidingView"` → 0 ocurrencias.
- **Dónde:** los 5 formularios.

### I-P2.6. Crear cuenta con nombre duplicado lanza sin manejo
`accounts.name` tiene `UNIQUE INDEX` (`src/db/schema.ts:16`, `src/db/migrations/migrations.ts:16`). `accountsRepo.create` no captura ni traduce el error. El usuario ve un crash o silencio según TanStack.
- **Dónde:** `app/new-account.tsx:67-93` + `src/db/repositories/accounts.ts:25-31`.

### I-P2.7. Validación de monto: NaN, negativos, ceros pasan
`parseFloat("")` → NaN, `parseFloat(".")` → NaN, `parseFloat("-50")` → -50, `parseFloat("0")` → 0. Cualquiera de estos:
- `decimalToMinor(NaN, ...)` → NaN → INSERT con NaN → SQLite probablemente lo guarda como 0 o lanza por integer constraint.
- Negativo → registra un gasto negativo (ingreso disfrazado de gasto).
- 0 → registra un movimiento sin valor.

El botón Guardar valida sólo `!amount` (string vacío). Pasa cualquier otra cosa.
- **Dónde:** `app/new-transaction.tsx:61-66, 287-294`; `app/new-recurring.tsx:86`; `app/new-exchange-rate.tsx:32`; `app/transaction-detail.tsx:63-77`.

### I-P2.8. `creditLimit: Number(creditLimit) || null` interpreta 0 como null
`app/new-account.tsx:77`: `0 || null === null`. Una tarjeta con límite 0 (caso poco probable pero válido) queda sin límite. Más relevante: si el usuario *quiere* poner 0 para luego editar, el valor desaparece.
- **Dónde:** `app/new-account.tsx:77`.

---

## Nuevos hallazgos de calidad

### Q-P2.1. Listas de monedas duplicadas en 3 fuentes
Tres lugares definen el catálogo de monedas:
- `src/utils/currency.ts:1-11` (`currencyConfig` con symbol+decimals).
- `src/store/settingsStore.ts:4` (`supportedCurrencies = getSupportedCurrencies()`).
- `app/new-account.tsx:23-33` (array hardcoded `{code, label}`).
- + `src/db/schema.ts:77-83` y `src/db/seed.ts:14-25` (tabla `currencies` con nombres es/en).

5 fuentes en realidad. Ninguna se relaciona automáticamente con las otras. Si se agrega una moneda hay que tocar al menos 3 archivos.

### Q-P2.2. Listas de tipos de cuenta duplicadas
- `src/types/index.ts:2-10` (type `AccountKind`).
- `src/db/schema.ts:7-9` (enum SQLite).
- `app/accounts.tsx:14-23` (`kindLabels` ES).
- `app/new-account.tsx:12-21` (`accountKinds` ES).
4 fuentes. Ninguna en `i18n/*.json`.

### Q-P2.3. Más colores hardcoded
A los 9 sitios reportados en Q1 hay que sumar:
- `app/new-account.tsx:35`: array de 9 hex `iconColors` (incluyen el `#0a84fF`/`#7864f0` que ya están en theme y `accentColorOptions` no usado).
- `app/transaction-detail.tsx:119`: `placeholderTextColor="rgba(255,255,255,0.2)"`.
- `app/new-transaction.tsx:269` y `app/recurring.tsx:156`: `thumbColor="#FFFFFF"` en `<Switch>` nativo.

### Q-P2.4. `<Switch>` nativo coexiste con el `<Toggle>` propio
- `src/components/ui/Toggle/index.tsx` (Liquid Glass custom) → usado en `app/(tabs)/settings.tsx`.
- React Native `<Switch>` (estilo iOS por defecto) → usado en `app/recurring.tsx:155`, `app/new-transaction.tsx:265`.
Dos componentes para la misma función, estética divergente. La mitad de la app usa uno, la otra mitad el otro.

### Q-P2.5. `key={i}` en mapeos
- `app/(tabs)/index.tsx:224` (barras del mini-chart).
- `app/(tabs)/analytics.tsx:180` (segmentos de la dona), `:216` (ítems de la leyenda).
- `src/components/ui/BackgroundOrbs/index.tsx:27`.

En la dona y la leyenda el orden depende del SQL `ORDER BY total DESC` — si una categoría sube/baja de ranking, el `key` cambia de slot y React no puede animar correctamente. En las barras y orbes el orden es estable, así que es menor.

### Q-P2.6. Cero accesibilidad
`grep -i "accessibilityLabel|accessibilityRole|accessibilityHint|accessible="` → 0 ocurrencias. Los iconos sólo expuestos con `<Ionicons>` (sin label) son ilegibles para VoiceOver. Para una app personal puede ser aceptable, pero suele ser tema en Fase 7 de QA.

### Q-P2.7. `nameEs/nameEn` en `currencies` table no se lee en ninguna parte
`src/db/schema.ts:81-82` define `name_es` y `name_en` para las monedas, y `seed.ts` los puebla. Pero ningún componente los consulta — se usan los `code` y los `label` hardcoded de `new-account.tsx`. Datos persistidos sin consumidor.

### Q-P2.8. `recurring.ts:68`: `note: String(tmpl.note ?? '')`
Si el `template` no tiene nota (caso común: regla creada sin nota), la transacción persistida tendrá `note=''` (string vacío) en lugar de `null`. El schema permite null. Las transacciones manuales sin nota guardan `null`. Inconsistencia que afecta queries del tipo `WHERE note IS NULL`.
- **Dónde:** `src/services/recurring.ts:68`.

### Q-P2.9. `metro.config.js` aludido en commit pero no presente
Commit `2133455`: *"agregar metro.config.js para resolver archivos .sql"*. Commit posterior `5f27adf`: *"inlinear SQL en migrations.ts para evitar import .sql con Metro"*. El segundo presumiblemente eliminó la necesidad. Glob confirma: no hay `metro.config.js` en el repo. Funcional pero el log de commits induce a confusión.

### Q-P2.10. Dos pantallas no documentadas en SCREENS.md
- `app/transaction-detail.tsx` (modal de detalle/edición de transacción) — no aparece en `SCREENS.md` aunque acaba de redactarse el documento.
- `app/new-account.tsx` (modal de nueva/editar cuenta) — idem.

`SCREENS.md` documenta 11 pantallas pero la app tiene 13 rutas con UI propia (sin contar `_layout.tsx` y `(tabs)/_layout.tsx`).

### Q-P2.11. `defaultAccount` puede coincidir con destino en transferencia
`app/new-transaction.tsx:50`:
```ts
const otherAccounts = accts?.filter((a) => a.id !== (selectedAccount?.id ?? ''));
```
Si `selectedAccount === null`, el filtro compara contra `''` y devuelve **todas** las cuentas, incluida la que está visualmente activa (la `defaultAccount`). El usuario puede transferir a la misma cuenta default sin darse cuenta — el chip activo es origen, pero el chip activo en destino puede ser la misma.
- **Dónde:** `app/new-transaction.tsx:50`.

---

## Síntesis

**Bugs nuevos críticos (no reportados antes):**
- C-P2.1: edición de monto se duplica/divide por 100 en monedas con decimales (afecta USD/EUR/ARS/etc.).
- C-P2.2: cambio de cuenta en edición no se guarda.
- C-P2.3: borrar transferencia deja huérfana la otra mitad.
- C-P2.4: regla recurrente rota silencia el error pero no avanza → reintento perpetuo.
- C-P2.5: backlog de recurrencias se procesa de a una por reapertura.
- C-P2.6: regla recurrente de transferencia pierde la cuenta destino.
- C-P2.7: `seed()` sin `.catch` puede dejar la app sin hidratar.

**Hallazgos retirados:**
- C1 era **erróneo**: el motor de recurrentes existe y se invoca. Los problemas reales son C-P2.4, C-P2.5, C-P2.6 (calidad del motor, no su ausencia).

**Hallazgos refinados:**
- C2: el bug está latente pero no se manifiesta hoy porque la UI evita `kind='transfer'`. Sigue siendo riesgo en imports y distorsiona los KPIs income/expense del dashboard.
- I4: parcialmente resuelto con `isHydrated`, pero faltan dos listeners.

**Prioridad sugerida (después de la pasada 2):**
1. **Antes de uso diario:** C-P2.1 (edición rompe USD), C-P2.7 (seed unhandled), C9 (import revienta) — son crashes/corrupciones de datos invisibles.
2. **Antes de TestFlight:** C-P2.2, C-P2.3, C-P2.4, C-P2.5, C-P2.6, C7 (atomicidad import), C5 (orbs no responden al tema), C3+C4 (toggles UX), I1-I3 (analytics que mienten), I-P2.5 (KeyboardAvoidingView), I-P2.7 (validación monto).
3. **Calidad de fondo:** I-P2.1, Q-P2.1+Q-P2.2 (deduplicar monedas/tipos), Q-P2.4 (Switch vs Toggle), Q1+Q-P2.3 (colores), Q2 (i18n), Q-P2.10 (documentar pantallas faltantes).

> Sigue siendo solo auditoría — no se modificó código en esta segunda pasada.
