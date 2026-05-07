# 0003 — Arquitectura local-first, sin backend

- **Estado:** Aceptado
- **Fecha:** 2026-05-06
- **Autor:** Gonzalo (con apoyo IA)

## Contexto

La app es para **uso personal individual**. No hay multi-usuario, no hay social, no hay sincronización entre múltiples devices del mismo usuario (al menos no en v1). El autor valora privacidad y simplicidad.

## Alternativas consideradas

1. **Backend completo (Node/Express + Postgres en VPS o Render)** — flexibilidad máxima, pero costo recurrente, mantenimiento, y ningún beneficio real para uso individual.
2. **BaaS (Firebase / Supabase)** — sync gratuito hasta cierto tier. Pero introduce una dependencia externa, modelo de datos atado al proveedor y telemetría implícita.
3. **Local-first puro (SQLite en device)** — todo vive en el iPhone. Backups manuales del usuario (export JSON). Sin red salvo cuando el usuario explícitamente comparte.
4. **Local-first con sync iCloud opcional (futuro)** — variante de (3): la base sigue siendo local, pero un toggle puede subir el archivo JSON a iCloud Drive vía `expo-file-system`.

## Decisión

Empezar con **opción 3 (local-first puro)**. Mantener el camino abierto a (4) como mejora opcional cuando exista uso real diario.

## Consecuencias

- ✅ Privacidad total: cero datos salen del device.
- ✅ Cero costo de infra.
- ✅ Modelo de datos 100% bajo nuestro control (sin acoplarnos a un BaaS).
- ✅ Funciona offline siempre (porque siempre es offline).
- ⚠️ Si el usuario pierde el iPhone sin backup → pierde la data. **Mitigación:** UI prominente para exportar; recordatorio mensual; opción futura iCloud.
- ⚠️ No hay sync entre devices. Aceptable: el autor solo usa un iPhone.
- 🔁 Revisar si en algún momento se quiere usar la app en iPad o Watch — entonces evaluar sync.
