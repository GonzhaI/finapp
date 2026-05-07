# CONTRIBUTING.md

Guía para humanos **y** asistentes IA que continúen este proyecto. Léelo antes de tocar código.

---

## 1. Antes de empezar

1. Lee `README.md` y `CLAUDE.md`.
2. Mira `PLAN.md` para conocer la fase actual y la próxima tarea.
3. Si vas a tomar una decisión arquitectónica, revisa `docs/adr/` para no contradecir decisiones previas.

## 2. Flujo de trabajo

```
1. Elegir tarea de PLAN.md (o crear una si surgió)
2. Crear branch: feat/<area>-<descripcion-corta>  ó  fix/<bug>
3. Implementar (commits pequeños, atómicos)
4. Actualizar CHANGELOG.md → sección [Unreleased]
5. Marcar la tarea como [x] en PLAN.md
6. Si hubo decisión relevante → añadir ADR en docs/adr/
7. Abrir PR (o merge directo si es trabajo solo)
```

## 3. Convenciones de commits

Formato (inspirado en Conventional Commits):

```
<tipo>(<scope opcional>): <resumen en imperativo>

Cuerpo opcional explicando el porqué.
```

Tipos:

- `feat` — funcionalidad nueva
- `fix` — corrección de bug
- `refactor` — cambio interno sin alterar comportamiento
- `style` — formato/estilo
- `docs` — solo documentación
- `chore` — tooling, dependencias
- `test` — añade o ajusta tests

Ejemplos:

```
feat(transactions): añadir filtro por rango de fechas
fix(db): evitar índice duplicado en migration 0003
docs(architecture): clarificar capa de servicios
```

## 4. Convenciones de código

### TypeScript

- `strict: true` siempre.
- Sin `any`. Si necesitas escape, usa `unknown` y reduce con guards.
- Tipos compartidos en `src/types/`. Tipos locales a un módulo, junto al módulo.
- Preferir `type` para uniones/intersecciones, `interface` para shapes extensibles.

### Nombres

- Componentes y tipos: `PascalCase` (`TransactionCard`, `Account`).
- Hooks: `useCamelCase` (`useTransactions`).
- Funciones / variables: `camelCase`.
- Constantes globales: `SCREAMING_SNAKE_CASE`.
- Archivos de componente: `kebab-case/` con `index.tsx` (`glass-card/index.tsx`).
- Archivos de hooks/utils: `camelCase.ts` (`useTransactions.ts`, `formatCurrency.ts`).

### Componentes

- Una exportación nombrada por archivo. `default export` solo en rutas de `app/` (lo requiere expo-router).
- Props tipadas explícitamente: `type Props = { ... }`.
- Sin lógica de DB en componentes — usar hooks.
- Sin estilos inline — usar `StyleSheet.create` o el sistema de tokens.

### Estilos

- **Nunca** colores hardcoded. Usar `theme.color.*`.
- **Nunca** spacing hardcoded. Usar `theme.spacing.*`.
- Componentes co-locados con sus estilos.

### Imports

- Orden: librerías externas → módulos `@/*` internos → relativos → tipos.
- Usar alias `@/` (configurado en `tsconfig.json` y `babel.config.js`).
- Sin imports circulares.

### Errores

- Validar inputs externos (forms, import) con zod.
- En el resto del código, asumir invariantes — no defender contra "no puede pasar".
- Errores que afecten al usuario: mostrar feedback (toast / inline). No silenciar.

## 5. Tests

- No exigidos para componentes UI en esta fase.
- **Sí** para `src/services/` y `src/utils/` (cálculos financieros, formateadores).
- Framework: Jest (default de Expo). Archivos `*.test.ts` junto al código.

## 6. Documentación

- **Cambio visible al usuario** → entrada en `CHANGELOG.md`.
- **Cambio de fase / nueva tarea completada** → marcar en `PLAN.md`.
- **Decisión de stack o estructura** → ADR en `docs/adr/NNNN-titulo.md`.
- **Cambio de modelo de datos** → actualizar `docs/DATA_MODEL.md`.
- **Cambio que afecte a IAs colaboradoras** → revisar `CLAUDE.md`.

## 7. Dependencias

Antes de añadir una librería, comprobar:

1. ¿Funciona con **Expo managed workflow**? (no requiere modificar `ios/`/`android/` manualmente)
2. ¿Está mantenida? (último commit < 12 meses)
3. ¿Hay alternativa en el SDK de Expo? Si sí, prefiérela.
4. ¿Justifica su tamaño? (proyecto pequeño, evitar bundles enormes)

Si todo OK: instalar y dejar registro en un ADR si la decisión es relevante.

## 8. Reglas para IAs

Si eres una IA continuando este proyecto:

- Lee `CLAUDE.md` primero.
- **No** crees archivos `.md` de planificación nuevos. Actualiza los existentes.
- **No** propongas refactors no pedidos.
- **No** "limpies" `.gitkeep` salvo que la carpeta ya tenga contenido real.
- Si una tarea es ambigua, pregunta al usuario antes de implementar.
- Mantén tus respuestas y tus diffs **concisos**.
- Tras cambios significativos, actualiza `CHANGELOG.md` y `PLAN.md` en el mismo cambio.
