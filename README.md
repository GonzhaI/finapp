# finapp

App nativa de iOS para gestión de finanzas personales. Uso individual, **local-first** (sin backend ni cuenta de usuario), construida con **React Native + Expo + TypeScript**.

> Estética inspirada en iOS 26 / Liquid Glass: minimalista, fluida, elegante.

---

## ✨ Características principales

- **Dashboard** con resumen del estado financiero (saldo, ingresos, gastos del periodo).
- **Movimientos**: registrar ingresos, gastos y transferencias entre cuentas.
- **Vistas temporales**: día, semana, mes y año.
- **Analíticas**: gráficos por categoría, evolución mensual, comparativas.
- **Categorías** personalizables (icono, color, presupuesto opcional).
- **Cuentas múltiples** (efectivo, débito, crédito, ahorro, etc.).
- **Personalización** completa: tema claro/oscuro, acentos, moneda, idioma.
- **Privacidad**: todo se guarda en el dispositivo (SQLite local), opción de respaldo manual.

## 🧱 Stack

| Capa | Tecnología |
| --- | --- |
| Runtime | React Native (New Architecture) |
| Tooling | Expo SDK (managed workflow) |
| Lenguaje | TypeScript estricto |
| Routing | expo-router (file-based) |
| Estado | Zustand + TanStack Query |
| Base de datos | expo-sqlite + Drizzle ORM |
| UI | Componentes propios + expo-blur + react-native-reanimated |
| Charts | victory-native / react-native-skia |
| Forms | react-hook-form + zod |
| Build iOS | EAS Build (cloud — sin necesidad de Mac) |

Detalles en [`docs/STACK.md`](docs/STACK.md).

## 🚀 Quick start

Requiere Node 20+ y un iPhone físico para probar (porque el desarrollo es desde Windows).

```bash
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** en tu iPhone. Para builds reales (TestFlight / instalación local):

```bash
npx eas build --profile development --platform ios
```

Setup completo paso a paso: [`SETUP.md`](SETUP.md).

## 📚 Documentación del proyecto

| Archivo | Propósito |
| --- | --- |
| [`PLAN.md`](PLAN.md) | Hoja de ruta y siguientes pasos accionables |
| [`SETUP.md`](SETUP.md) | Configuración del entorno (Windows → iOS) |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Decisiones técnicas y estructura del código |
| [`DESIGN.md`](DESIGN.md) | Sistema de diseño, principios UI/UX, Liquid Glass |
| [`SCREENS.md`](SCREENS.md) | Especificación visual detallada de las 4 pantallas principales |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Estándares de código y guía para IAs/colaboradores |
| [`CLAUDE.md`](CLAUDE.md) | Contexto cargado automáticamente por Claude Code |
| [`docs/`](docs/) | Documentación extendida (modelo de datos, ADRs, roadmap) |

## 📂 Estructura

```
finapp/
├── app/                  # Rutas con expo-router
├── src/
│   ├── components/       # Componentes UI reutilizables
│   ├── screens/          # Pantallas compuestas
│   ├── hooks/            # Hooks personalizados
│   ├── store/            # Estado global (Zustand)
│   ├── db/               # Esquema, migraciones, queries
│   ├── theme/            # Tokens de diseño, temas
│   ├── services/         # Lógica de dominio (cálculos, exports)
│   ├── lib/              # Wrappers de librerías
│   ├── utils/            # Helpers genéricos
│   ├── i18n/             # Traducciones
│   └── types/            # Tipos compartidos
├── assets/               # Iconos, fuentes, imágenes
├── docs/                 # Documentación extendida
└── scripts/              # Scripts auxiliares
```

## 🔐 Privacidad

No hay servidor. No hay analytics. No se envía nada a la nube salvo que el usuario explícitamente exporte un respaldo. Más en [`ARCHITECTURE.md`](ARCHITECTURE.md#privacidad).

## 📄 Licencia

Proyecto personal — sin licencia pública por defecto.
