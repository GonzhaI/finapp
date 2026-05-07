# SETUP.md

Guía paso a paso para preparar el entorno de desarrollo. Pensada para **Windows 11** desarrollando una app **iOS** con React Native + Expo, sin acceso a Mac local.

---

## 1. Requisitos previos

| Herramienta | Versión recomendada | Cómo verificar |
| --- | --- | --- |
| Node.js | 20 LTS o superior | `node -v` |
| npm | 10+ (incluido con Node 20) | `npm -v` |
| Git | cualquiera reciente | `git --version` |
| PowerShell | 7+ (preinstalado) | `pwsh --version` |
| Cuenta Expo | gratis | https://expo.dev/signup |
| Cuenta Apple Developer | **opcional** para builds reales en TestFlight (USD 99/año) | https://developer.apple.com |
| iPhone físico | con iOS reciente | — |

> **Sobre el Apple Developer Program:** No es necesario para empezar (Expo Go basta). Solo lo necesitas cuando quieras instalar builds reales (`.ipa`) en tu iPhone vía TestFlight o Ad-Hoc. Para uso 100% personal con Expo Go, puedes saltártelo indefinidamente.

## 2. Instalar Node y herramientas globales

Si no tienes Node, usa **fnm** (más rápido que nvm en Windows):

```powershell
winget install Schniz.fnm
fnm install 20
fnm use 20
```

Luego:

```powershell
npm install -g eas-cli
```

> No instales `expo-cli` global — está deprecado. Usa siempre `npx expo`.

## 3. Clonar / iniciar el proyecto

Si el repo ya existe:

```powershell
git clone <url> finapp
cd finapp
npm install
```

Si vas a inicializarlo (Fase 1 del PLAN):

```powershell
npx create-expo-app@latest . --template blank-typescript
```

## 4. Probar en Expo Go (lo más rápido)

1. Instala **Expo Go** desde el App Store en tu iPhone.
2. En la terminal del proyecto:
   ```powershell
   npx expo start
   ```
3. Escanea el QR con la cámara del iPhone — abrirá Expo Go con la app.

> **Limitación:** Expo Go solo soporta librerías incluidas en Expo SDK. Si añades módulos nativos custom (poco probable en este proyecto), necesitarás un **development build** (paso 6).

## 5. Login en EAS

```powershell
eas login
eas init
```

Esto vincula el proyecto local con tu cuenta Expo y crea un `projectId` en `app.json`.

## 6. Crear un development build para iOS (cuando lo necesites)

Un **development build** es como Expo Go pero con tus dependencias custom precargadas. Necesario si añades módulos nativos.

```powershell
eas build --profile development --platform ios
```

Opciones según si tienes Apple Developer Program:

- **Sin cuenta Apple Developer (USD 0):** EAS te ofrece un build de **simulador** (no instalable en iPhone físico). No sirve para Windows porque no tienes simulador iOS.
- **Con cuenta Apple Developer:** EAS firma el build con tu certificado y te da un `.ipa` instalable. EAS gestiona certificados y provisioning profiles automáticamente — solo te pide login Apple ID una vez.

Cuando el build termina, EAS te da un QR / link. Escaneado desde el iPhone instala la app.

## 7. Build de producción (TestFlight)

Cuando la app esté lista para usarse a diario:

```powershell
eas build --profile production --platform ios
eas submit --platform ios   # sube a App Store Connect / TestFlight
```

Requiere Apple Developer Program activo.

## 8. Estructura recomendada de scripts (`package.json`)

```jsonc
{
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 9. Variables de entorno

Crea `.env.local` (gitignored). Variables expuestas al cliente deben empezar con `EXPO_PUBLIC_`:

```
EXPO_PUBLIC_DEFAULT_CURRENCY=CLP
EXPO_PUBLIC_DEFAULT_LOCALE=es-CL
```

## 10. Troubleshooting Windows

- **Errores de path largo:** habilita long paths (`git config --global core.longpaths true` y la opción de Windows).
- **Antivirus lentificando `node_modules`:** excluye la carpeta del proyecto del análisis en tiempo real.
- **Puerto 8081 ocupado:** `npx expo start --port 8082`.
- **El QR no conecta:** asegúrate que iPhone y PC estén en la **misma red WiFi** y que ningún firewall bloquee el puerto Metro.

## 11. Checklist final ✅

- [ ] `node -v` ≥ 20
- [ ] `npm install` corre sin errores
- [ ] `npx expo start` levanta el servidor
- [ ] El iPhone abre la app vía Expo Go
- [ ] `eas login` funciona y `eas init` está hecho
- [ ] (Opcional) Cuenta Apple Developer activa si vas a hacer builds reales
