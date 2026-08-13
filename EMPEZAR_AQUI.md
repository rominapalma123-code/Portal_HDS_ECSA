# Empezar aquí

**Para Romi — 13 de agosto de 2026**

Hola Romi. Benjamín dejó todo preparado para revisar los ~1000 PDFs de fichas
de seguridad que están en SharePoint.

## Qué vas a hacer hoy

Una sola cosa: **averiguar si se pueden leer automáticamente los 1000 PDFs.**

Hoy no se cambia nada del portal. Es solo un diagnóstico para saber si el
proyecto es viable y cuánto trabajo implica.

## Qué necesitas antes de empezar

1. La carpeta de SharePoint **sincronizada en tu PC** (con OneDrive).
2. Que los archivos estén **descargados de verdad**, no solo "en la nube".

   Para asegurarlo: clic derecho sobre la carpeta →
   **"Conservar siempre en este dispositivo"**.

   Si no haces esto, el programa va a ver archivos vacíos y no va a funcionar.

## Cómo empezar

Abre tu agente (Claude Code) en esta carpeta y escríbele esto:

> Lee el archivo `.claude/skills/diagnostico-hds/SKILL.md` y ejecútalo.

El agente se encarga del resto. Te va a pedir la ruta de la carpeta de
SharePoint y te va a ir explicando qué encuentra.

**No necesitas saber programar.** El agente hace el trabajo técnico y te
entrega un resumen en lenguaje simple.

## Qué vas a obtener al final

Un informe que responde:

- Cuántas fichas se pueden leer automáticamente y cuántas no
- **Cuántas están vencidas** (más de 5 años desde su fecha de revisión)
- Cuántas son escaneadas (fotos, que el computador no puede leer)
- Si el proyecto es viable y cuánto trabajo falta

Con eso ustedes deciden si siguen adelante.

## Si algo falla

Dile al agente exactamente qué error te apareció. Está preparado para
resolver los problemas más comunes (falta Python, archivos vacíos, rutas
que no existen).

## Para entender el contexto completo

Si quieres saber de dónde viene todo esto, está en
[CONTEXTO_PROYECTO.md](CONTEXTO_PROYECTO.md) — ahí está resumida la
conversación que tuvimos con Benjamín y las decisiones que se tomaron.
