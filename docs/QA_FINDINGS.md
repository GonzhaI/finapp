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
