# Documentación de Pantallas — FinApp
## Estética: Liquid Glass · iOS Moderno · Modo Oscuro

---

## Sistema de Diseño Global

### Filosofía Visual
Inspirado en el lenguaje **Liquid Glass** de iOS 26. Las superficies son traslúcidas,
los fondos tienen orbes de luz difusa (blobs de color), y los elementos de UI flotan
sobre capas de material vítreo con `backdrop-filter: blur(20px)`.

### Fondo Base
- Color de fondo de la app: `#08090f` (casi negro con tinte azul profundo)
- Cada pantalla tiene 2–3 **orbes de gradiente radial** posicionados absolutamente
  para crear profundidad de color. Son `position: absolute`, sin interacción.

### Paleta Principal
| Token            | Valor                         | Uso                              |
|------------------|-------------------------------|----------------------------------|
| `--bg-app`       | `#08090f`                     | Fondo base de toda la app        |
| `--glass-fill`   | `rgba(255,255,255,0.055)`     | Superficies vidriosas             |
| `--glass-border` | `rgba(255,255,255,0.09)`      | Borde de tarjetas glass           |
| `--glass-blur`   | `blur(20px)`                  | Backdrop filter de capas          |
| `--text-primary` | `rgba(255,255,255,0.88)`      | Texto principal                  |
| `--text-secondary`| `rgba(255,255,255,0.45)`     | Texto secundario, fechas          |
| `--text-muted`   | `rgba(255,255,255,0.30)`      | Etiquetas, hints                 |
| `--accent-purple`| `#7864f0`                     | Acento principal (active, charts)|
| `--accent-green` | `#32d578`                     | Ingresos, tendencias positivas   |
| `--accent-red`   | `#ff6060`                     | Gastos, alertas                  |
| `--accent-amber` | `#ffb432`                     | Alimentación, advertencias       |
| `--accent-blue`  | `#32b4ff`                     | Salud, información               |

### Tipografía
- **Fuente:** SF Pro Display (iOS nativa) con fallback a `system-ui`
- **Pesos usados:** 300 (cifras grandes), 400 (cuerpo), 500 (énfasis), 600 (títulos)
- **Escala:**
  - Título de pantalla: 26px / weight 600 / letter-spacing −0.5px
  - Saldo hero: 42px / weight 300 / letter-spacing −2px
  - Nombre de ítem: 13px / weight 500
  - Etiqueta muted: 10–11px / weight 500 / letter-spacing 0.4px / uppercase
  - Micro label: 9px (eje de gráficos, versión)

### Tab Bar (global)
Presente en las 4 pantallas. Posición: inferior, fijada.
- Fondo: `rgba(8,9,15,0.9)` + `backdrop-filter: blur(20px)`
- Borde superior: `1px solid rgba(255,255,255,0.08)`
- Padding: `12px 0 20px` (bottom padding para safe area de iPhone)
- 4 ítems: **Inicio** · **Movimientos** · **Analítica** · **Ajustes**
- Ítem inactivo: `rgba(255,255,255,0.35)`
- Ítem activo: `rgba(160,140,255,0.95)` (tono morado claro)
- Íconos (Ionicons): `home`, `swap-horizontal`, `pie-chart`, `settings`
- Tamaño ícono: 22px · Label: 9px / weight 500

---

## Pantalla 1 — Inicio

### Propósito
Dashboard principal. Resumen financiero del mes actual en una sola vista.

### Orbes de Fondo
| Orbe | Color radial                          | Posición             | Tamaño  |
|------|---------------------------------------|----------------------|---------|
| 1    | `rgba(100,80,220,0.55)` (púrpura)    | Top-right, −40/−40px | 200×200 |
| 2    | `rgba(30,180,140,0.35)` (teal)       | Centro-left, −50px   | 180×180 |
| 3    | `rgba(180,60,120,0.28)` (magenta)    | Bottom-right, −60px  | 220×220 |

### Secciones (de arriba a abajo)

#### 1. Status Bar
- Hora: `9:41` · color `rgba(255,255,255,0.9)` / weight 600
- Derecha: íconos WiFi + batería

#### 2. Hero de Saldo
- Label: `Balance total` · 12px / `rgba(255,255,255,0.45)`
- Monto: `$4.820.500` · 42px / weight 300 / blanco
- Pill de variación: fondo `rgba(50,210,120,0.18)` · borde `rgba(50,210,120,0.3)` · radio 20px
  - Ícono `trending-up` + texto `+2.4% este mes` · color `#32d578`

#### 3. Cards de Stats (grid 2 columnas)
Cada card: `border-radius: 18px` · fondo `rgba(255,255,255,0.06)` · borde `rgba(255,255,255,0.1)`

| Card     | Ícono-bg                       | Ícono     | Color ícono | Label    | Valor        |
|----------|--------------------------------|-----------|-------------|----------|--------------|
| Ingresos | `rgba(50,210,120,0.2)`         | `arrow-down-right` | `#32d578` | INGRESOS | `$1.250.000` |
| Gastos   | `rgba(255,80,80,0.18)`         | `arrow-up-right`   | `#ff6060` | GASTOS   | `$387.400`   |

- Caja de ícono: 28×28px · border-radius 9px
- Label: 10px / uppercase / `rgba(255,255,255,0.38)`
- Valor: 16px / weight 500 / `rgba(255,255,255,0.92)`

#### 4. Mini Gráfico de Barras Mensual
Contenedor: border-radius 18px · fondo glass

- Label: `Gasto mensual 2026` · 10px uppercase muted
- 5 barras (E, F, M, A, M) · altura variable
- Barra inactiva: `rgba(255,255,255,0.12)`
- Barra activa (mes actual): gradiente `rgba(120,100,240,0.9)` → `rgba(80,60,200,0.8)`
- Label activo: blanco, weight 600

#### 5. Lista de Últimos Movimientos
Encabezado: `Últimos movimientos` (izq) + `Ver todos` en azul (der)

Cada fila: padding `11px 12px` · border-radius 14px · fondo `rgba(255,255,255,0.04)`

| Ítem                   | Ícono-bg                    | Color ícono | Monto        | Color monto             |
|------------------------|-----------------------------|-------------|--------------|-------------------------|
| Supermercado           | `rgba(255,180,50,0.15)`     | `#ffb432`   | −$54.900     | `rgba(255,255,255,0.78)`|
| Transferencia recibida | `rgba(50,200,120,0.15)`     | `#32d578`   | +$320.000    | `#32d578`               |
| Netflix                | `rgba(160,100,255,0.2)`     | `#a064ff`   | −$12.900     | `rgba(255,255,255,0.78)`|

- Nombre: 12px / weight 500 / `rgba(255,255,255,0.88)`
- Fecha: 10px / `rgba(255,255,255,0.35)`
- Monto: 13px / weight 500

---

## Pantalla 2 — Movimientos

### Propósito
Lista completa y filtrable de todas las transacciones, agrupadas por mes.
Permite agregar nuevas transacciones con el FAB.

### Orbes de Fondo
| Orbe | Color radial                       | Posición       | Tamaño  |
|------|------------------------------------|----------------|---------|
| 1    | `rgba(40,140,255,0.4)` (azul)     | Top-left       | 180×180 |
| 2    | `rgba(80,200,160,0.3)` (teal)     | Bottom-right   | 160×160 |

### Secciones

#### 1. Header de Página
- Título: `Movimientos` · 26px / weight 600 / blanco
- Botón búsqueda (top-right): círculo 32×32px · fondo `rgba(255,255,255,0.1)` · borde `rgba(255,255,255,0.15)` · ícono `search` 15px

#### 2. Filtros de Pills (scroll horizontal)
Pills con border-radius 20px:
- **Activo:** fondo `rgba(255,255,255,0.15)` · borde `rgba(255,255,255,0.25)` · texto blanco
- **Inactivo:** fondo `rgba(255,255,255,0.05)` · borde `rgba(255,255,255,0.08)` · texto `rgba(255,255,255,0.45)`
- Opciones: `Todos` · `Gastos` · `Ingresos` · `Mayo` (mes actual)

#### 3. Grupos de Transacciones por Mes
Cada grupo:
- Label de mes: 10px / uppercase / `rgba(255,255,255,0.35)` · letter-spacing 0.6px
- Contenedor: border-radius 20px · fondo `rgba(255,255,255,0.05)` · borde `rgba(255,255,255,0.09)`
- Separador entre filas: `1px solid rgba(255,255,255,0.05)`

Cada fila tiene: ícono (36×36px, border-radius 12px) + nombre + categoría + monto + hora/día

**Categorías y colores de ícono:**
| Categoría     | Fondo-ícono                   | Color ícono | Ícono Ionicons       |
|---------------|-------------------------------|-------------|----------------------|
| Alimentación  | `rgba(255,180,50,0.15)`       | `#ffb432`   | `cart`               |
| Ingresos      | `rgba(50,210,120,0.15)`       | `#32d578`   | `business`           |
| Suscripciones | `rgba(160,100,255,0.2)`       | `#a064ff`   | `phone-portrait`     |
| Transporte    | `rgba(255,80,80,0.15)`        | `#ff6060`   | `car`                |
| Salud         | `rgba(50,180,255,0.15)`       | `#32b4ff`   | `fitness`            |

- Nombre: 12px / weight 500 / `rgba(255,255,255,0.88)`
- Categoría: 10px / `rgba(255,255,255,0.35)`
- Monto negativo: `rgba(255,255,255,0.78)`
- Monto positivo: `#32d578`
- Tiempo: 10px / `rgba(255,255,255,0.3)`

#### 4. FAB (Floating Action Button)
- Círculo 52×52px · fondo `rgba(120,100,255,0.9)` · borde `rgba(160,140,255,0.4)`
- Ícono `+` · color blanco · 22px
- Centrado horizontalmente · separación con el último grupo

---

## Pantalla 3 — Analítica

### Propósito
Visualización de gastos por categoría (dona), tendencia mensual (línea)
e insights clave del mes.

### Orbes de Fondo
| Orbe | Color radial                       | Posición       | Tamaño  |
|------|------------------------------------|----------------|---------|
| 1    | `rgba(80,60,200,0.45)` (indigo)   | Mid-right      | 200×200 |
| 2    | `rgba(30,180,130,0.3)` (teal)     | Bottom-left    | 160×160 |

### Secciones

#### 1. Header de Página
- Título: `Analítica` · 26px / weight 600
- Pill de periodo (top-right): fondo `rgba(255,255,255,0.08)` · borde `rgba(255,255,255,0.14)` · ícono calendario + `Mayo 2026`

#### 2. Gráfico de Dona (SVG)
- Tamaño: 160×160px · radio externo 60px · grosor anillo 22px
- Centro: monto total `$387.400` (20px/500) + label `Total gastado` (10px/muted)
- Stroke-linecap: `round` (extremos redondeados)

| Segmento      | Color     | Porcentaje | Dasharray |
|---------------|-----------|------------|-----------|
| Alimentos     | `#7864f0` | 36%        | 141/236   |
| Transporte    | `#32d578` | 18%        | 66/236    |
| Salud         | `#ff6060` | 12%        | 47/236    |
| Suscripciones | `#ffb432` | 8%         | 30/236    |

#### 3. Leyenda de Categorías (grid 2 columnas)
Cada ítem: border-radius 14px · fondo `rgba(255,255,255,0.05)` · borde `rgba(255,255,255,0.08)`
- Dot coloreado (10×10px, circular) + nombre (11px/muted) + porcentaje (11px/weight 600/blanco)

#### 4. Card de Tendencia (Gráfico de Línea)
- Contenedor glass: border-radius 18px
- Label: `TENDENCIA DE GASTO` (uppercase/muted) + `Prom. $360k/mes` (derecha/muted)
- SVG path con curva suave · stroke `#7864f0` · 2px
- Relleno bajo la curva: gradiente `#7864f0` opacidad 0.35 → 0
- Punto activo al final: círculo 3.5px relleno `#7864f0`
- Alto del área de gráfico: 50px

#### 5. Insight Cards (grid 2 columnas)
Cada card: border-radius 16px · fondo glass

| Card          | Label          | Valor      | Sub-valor                           |
|---------------|----------------|------------|-------------------------------------|
| Día más caro  | Día más caro   | Viernes    | `↑ 42% del semanal` · `#ffb432`    |
| Ahorro        | Ahorro mensual | $862.600   | `↑ vs mes anterior` · `#32d578`    |

---

## Pantalla 4 — Ajustes

### Propósito
Configuración de la app. Sin perfil de usuario ya que la app es personal y offline.
Organizado en grupos temáticos de filas.

### Orbes de Fondo
| Orbe | Color radial                       | Posición     | Tamaño  |
|------|------------------------------------|--------------|---------|
| 1    | `rgba(50,140,255,0.3)` (azul)     | Mid-right    | 160×160 |
| 2    | `rgba(100,60,200,0.3)` (indigo)   | Bottom-left  | 140×140 |

### Secciones

#### 1. Header de Página
- Título: `Ajustes` · 26px / weight 600

#### 2. Grupos de Configuración

Cada grupo tiene:
- **Group label:** 10px / uppercase / `rgba(255,255,255,0.35)` · letter-spacing 0.6px
- **Card:** border-radius 18px · fondo `rgba(255,255,255,0.055)` · borde `rgba(255,255,255,0.09)`
- **Separador entre filas:** `1px solid rgba(255,255,255,0.055)`
- **Cada fila:** padding 13px 14px · ícono (30×30px / border-radius 9px) + texto + control derecho

---

**Grupo General**

| Fila            | Ícono-bg                       | Color ícono | Ícono         | Control derecho        |
|-----------------|--------------------------------|-------------|---------------|------------------------|
| Moneda          | `rgba(255,180,50,0.18)`        | `#ffb432`   | `cash`        | `CLP` + chevron        |
| Inicio de mes   | `rgba(120,100,255,0.2)`        | `#a064ff`   | `calendar`    | `Día 1` + chevron      |
| Categorías      | `rgba(50,200,120,0.18)`        | `#32d578`   | `pricetag`    | chevron (sub: 7 activas)|

---

**Grupo Apariencia**

| Fila          | Ícono-bg                           | Color ícono                   | Ícono  | Control derecho |
|---------------|------------------------------------|-------------------------------|--------|-----------------|
| Modo oscuro   | `rgba(20,20,40,0.5)` + borde blanco| `rgba(255,255,255,0.7)`       | `moon` | Toggle ON       |
| Liquid Glass  | `rgba(50,180,255,0.18)`            | `#32b4ff`                     | `wand` | Toggle ON       |

**Toggle UI:**
- Tamaño: 38×22px · border-radius 11px
- Estado ON: fondo `rgba(120,100,255,0.8)` · knob a la derecha (18px / blanco)
- Estado OFF: fondo `rgba(255,255,255,0.15)` · knob a la izquierda
- Transición: 0.2s ease

---

**Grupo Datos**

| Fila                | Ícono-bg                    | Color ícono | Ícono             | Sub-texto  |
|---------------------|-----------------------------|-------------|-------------------|------------|
| Exportar datos      | `rgba(50,210,120,0.18)`     | `#32d578`   | `cloud-download`  | CSV / JSON |
| Borrar todos datos  | `rgba(255,80,80,0.15)`      | `#ff6060`   | `trash`           | —          |

---

#### 3. Footer de Versión
- Texto centrado: `FinApp v1.0.0 · Modo offline`
- 11px / `rgba(255,255,255,0.2)`

---

---

## Pantalla 5 — Nuevo Movimiento (modal)

### Propósito
Hoja modal para registrar un nuevo movimiento (gasto, ingreso o transferencia).
Se abre desde el FAB de Movimientos. Foco automático en el campo de monto al abrir.

### Presentación
- Modal **fullScreenModal** con animación slide desde abajo (300ms)
- Fondo: mismo `--bg-app` con un único orbe sutil top-center `rgba(120,100,255,0.25)` 200×120px
- Drag handle superior: barra 36×4px · `rgba(255,255,255,0.18)` · centrada · margen top 8px

### Secciones (de arriba a abajo)

#### 1. Header
- **Cancelar** (izq): 15px / weight 400 / `--accent-purple`
- **Título** (centro): `Nuevo movimiento` · 17px / weight 600
- **Espaciador** (der) para balancear el layout (60px)
- Padding vertical: 12px · separación inferior: `1px solid rgba(255,255,255,0.06)`

#### 2. Selector de Tipo (segmentos)
3 pills en fila ocupando ancho completo, `flex: 1` cada uno:
- Container: padding vertical 10px · border-radius 999px
- **Activo:** fondo `--accent-purple` · texto blanco / weight 500
- **Inactivo:** fondo `rgba(255,255,255,0.05)` · texto `--text-secondary`
- Opciones: `Gasto` · `Ingreso` · `Transf.`
- Animación al cambiar: scale 0.97 + transición de color 150ms

#### 3. Campo de Monto (hero)
Input grande, centrado, sin bordes laterales:
- Tamaño tipográfico: 34px / weight 700 / `--text-primary`
- Placeholder: `0` · color `rgba(255,255,255,0.2)`
- Teclado: `decimal-pad`
- Label superior: `Monto` · 13px uppercase muted

#### 4. Selector de Cuenta
- Label: `Cuenta` · 13px / `--text-secondary`
- Lista de pills horizontales con flex-wrap (gap 6px)
- Pill activa: fondo `--accent-purple` · borde `rgba(160,140,255,0.4)` · texto blanco
- Pill inactiva: fondo glass · texto `--text-secondary`
- Tamaño: padding 6px 12px · 11px / weight 500

#### 5. Selector de Categoría
- Label: `Categoría` · 13px / `--text-secondary`
- Solo se muestran categorías del tipo seleccionado (gasto/ingreso)
- Pills con flex-wrap; cuando una categoría está activa, su pill toma el color propio de la categoría (`category.color`)
- Pill inactiva: texto `--text-tertiary`

#### 6. Campo de Nota (opcional)
- Input estándar (border-radius 12px · fondo glass · borde `--glass-border`)
- Placeholder: `Ej: almuerzo con amigos`
- Label flotante: `Nota (opcional)`

#### 7. Botón Guardar
- Botón primario fullwidth: 52px de alto · border-radius 14px
- Fondo: `--accent-purple` · texto blanco / weight 600 / 16px
- **Disabled:** opacidad 0.4 cuando no hay monto o cuenta
- **Loading:** spinner blanco centrado

---

## Pantalla 6 — Cuentas

### Propósito
Listado de las cuentas del usuario con el saldo actual de cada una. Acceso desde Ajustes
o como pantalla auxiliar para gestionar cuentas (cash, débito, crédito, etc.).

### Orbes de Fondo
| Orbe | Color radial                      | Posición       | Tamaño  |
|------|-----------------------------------|----------------|---------|
| 1    | `rgba(50,200,160,0.3)` (teal)    | Top-right      | 180×180 |
| 2    | `rgba(100,80,220,0.25)` (púrpura)| Bottom-left    | 160×160 |

### Secciones

#### 1. Header con Volver
- **Volver** (izq): 15px · `--accent-purple`
- **Título** (centro): `Cuentas` · 22px / weight 600
- Padding inferior: 24px

#### 2. Lista de Tarjetas (FlatList)
Cada tarjeta-cuenta es un Card glass apilado verticalmente con `marginBottom: 8px`:
- Container: padding 14px · border-radius 18px · fondo `--glass-fill` · borde `--glass-border`
- Layout: `flexDirection: row · justifyContent: space-between`

**Columna izquierda:**
- Nombre de la cuenta: 15px / weight 500 / `--text-primary`
- Tipo / proveedor: 12px / `--text-tertiary` · ej. `Efectivo`, `Débito`, `Banco Estado`

**Columna derecha (alineada a la derecha):**
- Saldo: 15px / weight 500
  - Si saldo ≥ 0 → `--accent-green`
  - Si saldo < 0 → `--accent-red`
- Para cuentas crédito con `creditLimit`: subtexto `Límite: $XXX.XXX` · 12px / `--text-tertiary`

#### 3. Empty state
Cuando no hay cuentas: ícono central + título `Sin cuentas` + descripción `Crea tu primera cuenta para empezar`.

#### 4. Loading state
Skeleton: 2 placeholders de 70px de alto · gap 12px · padding lg.

### Tipos de cuenta soportados (mapping de labels)
| Kind             | Label          |
|------------------|----------------|
| `cash`           | Efectivo       |
| `debit`          | Débito         |
| `checking`       | Cuenta corriente |
| `digital_wallet` | Billetera digital |
| `credit`         | Crédito        |
| `savings`        | Ahorro         |
| `investment`     | Inversión      |
| `other`          | Otro           |

---

## Pantalla 7 — Categorías

### Propósito
Listado de las categorías del usuario, filtrables por tipo. Cada categoría tiene un
color y un nombre. Acceso desde Ajustes → Categorías.

### Orbes de Fondo
| Orbe | Color radial                       | Posición       | Tamaño  |
|------|------------------------------------|----------------|---------|
| 1    | `rgba(255,180,50,0.25)` (ámbar)   | Top-right      | 160×160 |
| 2    | `rgba(160,100,255,0.25)` (lila)   | Bottom-left    | 140×140 |

### Secciones

#### 1. Header con Volver
- **Volver** (izq): 15px · `--accent-purple`
- **Título** (centro): `Categorías` · 22px / weight 600

#### 2. Filtro de Pills
Tres pills en fila (sin scroll necesario):
- Opciones: `Todos` · `Gastos` · `Ingresos`
- Pill activa: fondo `--accent-purple` · texto blanco
- Pill inactiva: fondo glass · texto `--text-secondary`
- Padding 6px 14px · 12px / weight 500

#### 3. Lista de Categorías (FlatList)
Cada fila es un Card glass:
- Layout: `flexDirection: row · alignItems: center · gap 12px`
- Dot de color: 12×12px · border-radius 6px · `backgroundColor: category.color`
- Nombre: 15px / weight 400 / `--text-primary`

#### 4. Empty state
`Sin categorías` + descripción `Crea categorías para organizar tus movimientos`.

---

## Pantalla 8 — Tipos de Cambio

### Propósito
Gestión de tasas de conversión entre monedas (ej. USD → CLP). Útil cuando el usuario
maneja cuentas en distintas monedas. Acceso desde Ajustes → Tipos de cambio.

### Orbes de Fondo
| Orbe | Color radial                      | Posición       | Tamaño  |
|------|-----------------------------------|----------------|---------|
| 1    | `rgba(50,180,255,0.3)` (azul)    | Top-left       | 170×170 |
| 2    | `rgba(50,210,120,0.25)` (verde)  | Bottom-right   | 150×150 |

### Secciones

#### 1. Header con Volver
- **Volver** (izq): 15px · `--accent-purple`
- **Título** (centro): `Tipos de cambio` · 22px / weight 600

#### 2. Lista de Tasas (FlatList)
Cada tasa es un Card glass con layout en fila:

**Columna izquierda:**
- Par de monedas: `USD → CLP` · 15px / weight 500 / `--text-primary`
- Tasa: `1 USD = 940 CLP` · 12px / `--text-tertiary`
- Fecha efectiva: `15 abr 2026` · 12px / `--text-tertiary`

**Columna derecha:**
- Botón eliminar: ícono `✕` · 15px / `--accent-red` · padding 8px
- Confirmación con `Alert.alert` nativo antes de borrar
- Haptic warning al pulsar

#### 3. FAB
- Igual al de Movimientos: 56×56px · `--accent-purple` · ícono `+` blanco 22px
- Posición: bottom 24px · right 16px
- Sombra `--accent-purple` con opacidad 0.3 · radio 8px
- Navega a `/new-exchange-rate`

#### 4. Empty state (centrado verticalmente)
Título `Sin tipos de cambio` + descripción explicando para qué sirven.

#### 5. Loading state
Skeleton: 2 placeholders de 60px de alto.

---

## Pantalla 9 — Nuevo Tipo de Cambio (modal)

### Propósito
Hoja modal para crear una nueva tasa de cambio entre dos monedas.

### Presentación
- Modal con la misma animación de slide-up que Nuevo Movimiento
- Fondo: orbe único top-center `rgba(50,180,255,0.25)` 200×120px

### Secciones

#### 1. Header
- **Cancelar** (izq): 15px / `--accent-purple`
- **Título** (centro): `Nuevo tipo de cambio` · 17px / weight 600
- Espaciador derecho 60px

#### 2. Selector "De" (moneda origen)
- Label: `De` · 13px / `--text-secondary`
- Pills horizontales con flex-wrap (gap 6px) · listadas todas las monedas soportadas
- Pill activa: fondo `--accent-purple` · texto blanco
- Pill inactiva: fondo glass · texto `--text-secondary`

#### 3. Selector "A" (moneda destino)
- Label: `A` · 13px / `--text-secondary`
- Mismas pills, **excluyendo** la moneda elegida en "De"
- Mismos estilos

#### 4. Campo de Tasa
- Input estándar con label `Tasa` y helper text `1 {fromCurrency} = X {toCurrency}`
- Teclado: `decimal-pad`
- Placeholder: ejemplo de tasa

#### 5. Botón Guardar
- Igual al de Nuevo Movimiento (primario fullwidth)
- Disabled hasta tener `from`, `to` y tasa válidos

---

## Pantalla 10 — Recurrentes

### Propósito
Listado de reglas de transacciones recurrentes (ej. sueldo mensual, suscripción Netflix).
Cada regla tiene una frecuencia (semanal/quincenal/mensual/anual) y se puede pausar
con un toggle o eliminar.

### Orbes de Fondo
| Orbe | Color radial                       | Posición       | Tamaño  |
|------|------------------------------------|----------------|---------|
| 1    | `rgba(120,100,255,0.35)` (lila)   | Top-right      | 180×180 |
| 2    | `rgba(255,180,50,0.25)` (ámbar)   | Bottom-left    | 150×150 |

### Secciones

#### 1. Header con Volver
- **Volver** (izq): 15px · `--accent-purple`
- **Título** (centro): `Recurrentes` · 22px / weight 600

#### 2. Lista de Reglas (FlatList)
Cada regla es un Card glass tappable (abre la edición):

**Columna izquierda (flex 1):**
- Línea 1: nombre de la regla (la nota) o fallback `Ingreso`/`Gasto` · 15px / weight 500
  - Si la regla está pausada: pill inline `Pausada` con fondo `--separator` · 11px / `--text-tertiary`
- Línea 2: `Mensual · Próx: 1 jun 2026` · 12px / `--text-tertiary`

**Columna media:**
- Monto formateado con signo: `+ $1.250.000` (income) o `- $48.000` (expense)
- Color: `--accent-green` o `--accent-red` según `kind`
- 15px / weight 500

**Columna derecha:**
- **Switch nativo** (iOS) para activar/pausar
  - trackColor false: `--separator` · true: `--accent-purple`
  - thumbColor: blanco
  - Haptic selection al cambiar
- Botón eliminar: `✕` · 15px / `--accent-red`
  - Confirmación con `Alert.alert` antes de borrar · haptic warning

#### 3. FAB
- 56×56px · `--accent-purple` · ícono `+` blanco
- Posición: bottom 24px · right 16px
- Solo se muestra cuando ya hay reglas; el empty state ofrece su propio botón

#### 4. Empty state
Título `Sin recurrentes` + descripción + **botón primario** `Nueva regla` que navega a `/new-recurring`.

#### 5. Loading state
3 skeletons de 60px.

### Mapping de frecuencias (cron → label)
| Cron               | Español   | Inglés    |
|--------------------|-----------|-----------|
| `0 0 * * 1`        | Semanal   | Weekly    |
| `0 0 1,15 * *`     | Quincenal | Biweekly  |
| `0 0 1 * *`        | Mensual   | Monthly   |
| `0 0 1 1 *`        | Anual     | Yearly    |

---

## Pantalla 11 — Nueva / Editar Recurrente (modal)

### Propósito
Hoja modal para crear o editar una regla recurrente. Misma estructura que
Nuevo Movimiento + un selector de frecuencia.

### Presentación
- Modal slide-up (igual a Nuevo Movimiento)
- Modo **edición** se activa cuando llega `?id=…` en query params; se prerrellenan los campos.
- Título adaptativo: `Nueva regla` (creación) / `Editar regla` (edición)

### Secciones

#### 1. Header
- **Cancelar** (izq) · título centrado · espaciador derecho

#### 2. Selector de Tipo (segmentos)
2 pills (sin transferencia): `Gasto` · `Ingreso`
- Mismos estilos que Nuevo Movimiento

#### 3. Campo de Monto (hero)
- Idéntico al de Nuevo Movimiento (34px / weight 700 / centrado)

#### 4. Selector de Cuenta
- Pills horizontales con flex-wrap

#### 5. Selector de Categoría
- Pills filtradas por `kind` actual

#### 6. Campo de Nota (opcional)
- Input estándar · placeholder `Ej: suscripción Netflix`

#### 7. Selector de Frecuencia
4 pills en fila ocupando todo el ancho (`flex: 1` cada uno):
- Container: padding vertical 10px · border-radius 999px
- **Activo:** fondo `--accent-purple` · texto blanco
- **Inactivo:** fondo glass · texto `--text-secondary`
- Opciones: `Semanal` · `Quincenal` · `Mensual` · `Anual`

#### 8. Botón Guardar
- Primario fullwidth · disabled si falta monto o cuenta
- En edición no cambia el `nextRunAt`; en creación arranca con `Date.now()`

---

## Resumen de Íconos por Pantalla

| Pantalla              | Íconos usados (Ionicons / Tabler)                                      |
|-----------------------|------------------------------------------------------------------------|
| Inicio                | home, trending-up, arrow-down-right, arrow-up-right, shopping-cart, business, phone-portrait |
| Movimientos           | search, shopping-cart, business, phone-portrait, car, fitness, plus    |
| Analítica             | pie-chart, calendar, chart-line                                        |
| Ajustes               | settings, cash, calendar, pricetag, moon, wand, cloud-download, trash  |
| Nuevo Movimiento      | (chevron-down opcional para drag-handle)                               |
| Cuentas               | wallet, card, cash, briefcase                                          |
| Categorías            | pricetag, color-palette                                                |
| Tipos de cambio       | swap-horizontal, plus, close                                           |
| Nuevo tipo de cambio  | swap-horizontal                                                        |
| Recurrentes           | repeat, plus, close, pause                                             |
| Nueva/Editar recurrente | repeat, calendar                                                     |

## Animaciones Recomendadas (React Native Reanimated)

| Elemento                | Animación                                    | Duración |
|-------------------------|----------------------------------------------|----------|
| Entrada de pantalla     | FadeIn + SlideInDown (desde 12px)            | 280ms    |
| Número de saldo hero    | CountUp desde 0                              | 600ms    |
| Segmentos de la dona    | StrokeGrow con stagger 80ms por segmento     | 500ms    |
| Barras del mini-gráfico | ScaleY desde 0 con stagger 50ms              | 400ms    |
| Tap en fila             | Scale 0.97 durante 100ms                     | 100ms    |
| Pill de filtro activo   | BackgroundColor transition                   | 150ms    |
| Toggle ON/OFF           | TranslateX del knob + BackgroundColor        | 200ms    |

---

## Tema Claro (Light Mode)

> Todos los tokens y estilos descritos en este documento corresponden al **tema oscuro** (modo por defecto).
> El tema claro **mantiene la misma estructura, espaciados, tipografía, tamaños y animaciones**;
> solo cambian colores, opacidades y la intensidad de los orbes.

### Filosofía Visual en Claro
La estética Liquid Glass se traduce a un **fondo claro perlado** con orbes de gradiente
**más sutiles** y de mayor luminosidad. Las superficies vidriosas pasan de "vidrio sobre
vidrio negro" a "vidrio sobre papel mate": menos contraste, más aire, sombras suaves
en vez de bordes luminosos.

### Fondo Base
- Color de fondo de la app: `#f5f6fa` (blanco con tinte azul muy frío)
- Fondo alternativo elevado (modales, cards apiladas): `#ffffff`
- Cada pantalla mantiene 2–3 orbes pero con **menos opacidad** (0.10–0.18 en lugar de 0.25–0.55)
  y **colores más saturados** para que sigan visibles sobre fondo claro.

### Paleta Principal (Light)
| Token            | Valor                         | Uso                              |
|------------------|-------------------------------|----------------------------------|
| `--bg-app`       | `#f5f6fa`                     | Fondo base de toda la app        |
| `--bg-elevated`  | `#ffffff`                     | Cards principales, modales       |
| `--glass-fill`   | `rgba(255,255,255,0.7)`       | Superficies vidriosas (sobre orbes) |
| `--glass-border` | `rgba(20,22,40,0.07)`         | Borde de tarjetas glass           |
| `--glass-blur`   | `blur(20px)`                  | Backdrop filter (igual)          |
| `--text-primary` | `rgba(15,17,30,0.92)`         | Texto principal                  |
| `--text-secondary`| `rgba(15,17,30,0.55)`        | Texto secundario, fechas          |
| `--text-muted`   | `rgba(15,17,30,0.38)`         | Etiquetas, hints                 |
| `--separator`    | `rgba(15,17,30,0.08)`         | Separadores entre filas          |
| `--accent-purple`| `#6450e6`                     | Acento principal (1 paso más oscuro que en dark) |
| `--accent-green` | `#1ca85f`                     | Ingresos, tendencias positivas   |
| `--accent-red`   | `#e63b3b`                     | Gastos, alertas                  |
| `--accent-amber` | `#e69412`                     | Alimentación, advertencias       |
| `--accent-blue`  | `#1c8fdc`                     | Salud, información               |

### Sombras (reemplazan los bordes luminosos)
En oscuro las cards se separan con bordes claros sutiles. En claro las cards se
separan con **sombras suaves**:
- `--shadow-card`: `0 1px 2px rgba(15,17,30,0.04), 0 4px 16px rgba(15,17,30,0.06)`
- `--shadow-fab`: `0 6px 20px rgba(100,80,230,0.25)` (mantiene tinte morado del accent)
- `--shadow-modal`: `0 -2px 24px rgba(15,17,30,0.10)` (modales que vienen desde abajo)

### Tab Bar (Light)
- Fondo: `rgba(255,255,255,0.85)` + `backdrop-filter: blur(20px)`
- Borde superior: `1px solid rgba(15,17,30,0.06)`
- Ítem inactivo: `rgba(15,17,30,0.45)`
- Ítem activo: `--accent-purple` (`#6450e6`)
- Mismos íconos, mismos tamaños

### Mapeo de Backgrounds de Íconos por Categoría
Los chips de categoría usan **colores del mismo hue** pero con alfa más bajo y un fondo blanco intermedio:

| Categoría     | Light bg-ícono                     | Color ícono     |
|---------------|------------------------------------|-----------------|
| Alimentación  | `rgba(230,148,18,0.12)`            | `#e69412`       |
| Ingresos      | `rgba(28,168,95,0.12)`             | `#1ca85f`       |
| Suscripciones | `rgba(120,100,230,0.12)`           | `#6450e6`       |
| Transporte    | `rgba(230,59,59,0.10)`             | `#e63b3b`       |
| Salud         | `rgba(28,143,220,0.12)`            | `#1c8fdc`       |

### Pills y Chips
| Estado     | Dark                                                    | Light                                          |
|------------|---------------------------------------------------------|------------------------------------------------|
| Activo     | fondo `rgba(255,255,255,0.15)` · borde claro · texto blanco | fondo `--accent-purple` · texto blanco         |
| Inactivo   | fondo `rgba(255,255,255,0.05)` · texto `--text-secondary`| fondo `rgba(15,17,30,0.05)` · texto `--text-secondary` |

### Cards Glass
| Capa            | Dark                              | Light                              |
|-----------------|-----------------------------------|-------------------------------------|
| Fondo           | `rgba(255,255,255,0.055)`         | `rgba(255,255,255,0.7)` sobre orbe / `#ffffff` plano |
| Borde           | `rgba(255,255,255,0.09)`          | `rgba(15,17,30,0.07)`               |
| Sombra          | (none — el borde define la pieza) | `--shadow-card`                     |

### Orbes de Fondo en Claro
Misma posición y tamaño que en oscuro, pero con **menos saturación** y opacidades reducidas a `0.10–0.18`. Ejemplo Inicio:

| Orbe | Dark                                | Light                            |
|------|-------------------------------------|-----------------------------------|
| 1    | `rgba(100,80,220,0.55)` púrpura    | `rgba(120,100,255,0.18)` púrpura |
| 2    | `rgba(30,180,140,0.35)` teal       | `rgba(50,200,160,0.12)` teal     |
| 3    | `rgba(180,60,120,0.28)` magenta    | `rgba(220,100,160,0.10)` magenta |

> **Regla general para portar orbes:** mantener el hue, **subir la luminosidad ~10%**
> y **bajar el alpha a un tercio** del valor de oscuro.

### Toggles (Light)
- Tamaño igual: 38×22px · border-radius 11px
- Estado ON: fondo `--accent-purple` (sólido) · knob blanco con sombra suave
- Estado OFF: fondo `rgba(15,17,30,0.12)` · knob blanco
- Sombra del knob (light only): `0 1px 3px rgba(15,17,30,0.12)` para darle volumen

### Inputs
| Estado    | Dark                                        | Light                                       |
|-----------|---------------------------------------------|---------------------------------------------|
| Default   | fondo glass · borde `--glass-border`        | fondo `#ffffff` · borde `rgba(15,17,30,0.10)` |
| Focus     | borde `--accent-purple` (alpha 0.5)         | borde `--accent-purple` sólido + halo de 2px alpha 0.15 |
| Disabled  | opacidad 0.4                                | fondo `rgba(15,17,30,0.04)` · texto `--text-muted` |

### Status Bar
- Dark: contenido en blanco (`barStyle="light-content"`)
- Light: contenido en negro (`barStyle="dark-content"`)

### Excepciones por pantalla
- **Hero de Saldo (Inicio):** el monto sigue siendo `--text-primary`. La pill verde de variación pasa a `rgba(28,168,95,0.12)` con borde `rgba(28,168,95,0.25)` y texto `#1ca85f`.
- **Mini-gráfico de barras:** barra inactiva `rgba(15,17,30,0.08)` · barra activa con el mismo gradiente `--accent-purple` (no cambia).
- **Dona (Analítica):** stroke de fondo `rgba(15,17,30,0.06)`. Los segmentos mantienen sus hex.
- **Card de tendencia:** el relleno bajo la curva pasa a `rgba(100,80,230,0.18) → 0`.
- **Insight cards:** sub-valores en accent (verde/ámbar) usan los hex de light: `#1ca85f`, `#e69412`.

### Implementación
El switch de tema es **automático** según el setting de Apariencia (Ajustes → Modo oscuro toggle). Los tokens se exponen vía el provider en `src/theme/ThemeProvider.tsx` como `theme.colors.*`; los componentes ya consumen `useTheme()`, por lo que no debería ser necesario tocar componentes — solo el archivo `src/theme/light.ts` debe contener los valores aquí descritos.
