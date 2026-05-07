# 0001 — Stack base: React Native + Expo (managed workflow)

- **Estado:** Aceptado
- **Fecha:** 2026-05-06
- **Autor:** Gonzalo (con apoyo IA)

## Contexto

El autor desarrolla en **Windows 11**, sin acceso a macOS local, y quiere construir una app **iOS-first** para uso personal. Necesita:

- Probar en iPhone físico de forma ágil.
- Producir builds instalables sin un Mac.
- Una experiencia visual cercana a iOS nativo.
- Tiempo total de desarrollo razonable (proyecto solo, no full-time).

## Alternativas consideradas

1. **Swift + SwiftUI nativo** — máxima fidelidad y acceso completo a Liquid Glass nativo. Inviable: requiere Xcode y, por tanto, macOS. Comprar/alquilar Mac no está sobre la mesa.
2. **Flutter** — multiplataforma, performance nativa. Pero el look-and-feel iOS requiere mucha personalización para sentirse "Apple", y la integración con SF Symbols/Liquid Glass es más limitada que en RN.
3. **React Native sin Expo (CLI puro)** — máxima flexibilidad nativa. Pero gestionar firmas iOS sin Mac es muy fricción.
4. **React Native + Expo (managed)** — abstrae la build iOS vía EAS Build (cloud). SDK con módulos nativos cubiertos. Compatible con iPhone físico vía Expo Go.

## Decisión

Adoptar **React Native + Expo (managed workflow)** con TypeScript.

Justificación: es la única opción que permite **desarrollar en Windows + apuntar a iOS + iterar rápido en iPhone físico + producir builds firmados sin Mac local** (vía EAS Build). Aceptamos que no llegamos a Liquid Glass nativo "real" — lo aproximamos con `expo-blur` + Reanimated. Si en el futuro aparece un módulo Expo que exponga el material `glass` de iOS 26, se evaluará migrar.

## Consecuencias

- ✅ Cero dependencia de macOS para desarrollo.
- ✅ Hot reload en iPhone físico vía Expo Go en segundos.
- ✅ EAS gestiona certificados y provisioning profiles.
- ✅ Stack JS familiar y comunidad enorme.
- ⚠️ Aproximación visual (no Liquid Glass nativo). Aceptable para uso personal.
- ⚠️ Bundle más grande que una app Swift nativa (irrelevante para uso personal).
- ⚠️ Algunas APIs muy nuevas de iOS 26 pueden tardar en exponerse en RN/Expo.
- 🔁 Revisar cada año si hay opción de migrar a Swift (improbable mientras siga sin Mac).
