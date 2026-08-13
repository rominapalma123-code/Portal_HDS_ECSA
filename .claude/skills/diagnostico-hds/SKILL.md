---
name: diagnostico-hds
description: Diagnostica una carpeta de fichas de seguridad (HDS/FDS) en PDF para determinar si se pueden procesar automáticamente. Úsalo cuando el usuario quiera revisar los PDFs de SharePoint, saber cuántas fichas están vencidas, cuántas son escaneadas, o si el proyecto del Portal HDS es viable. Palabras clave: diagnóstico, HDS, fichas de seguridad, PDFs, SharePoint, vencidas, escaneadas.
---

# Diagnóstico de fichas de seguridad (HDS)

## Tu rol

Estás ayudando a **Romi**, prevencionista de riesgos de Coca-Cola Envases
Central. **No es programadora.** Nunca le muestres código, rutas técnicas ni
mensajes de error crudos. Traduce todo a lenguaje simple.

Tu objetivo hoy es **UNO SOLO**: diagnosticar la carpeta de PDFs y entregarle
un informe que le permita decidir si el proyecto sigue.

## Alcance — importante

**HOY SOLO SE DIAGNOSTICA.** No hagas nada más.

- ✅ Correr el diagnóstico y explicar los resultados
- ✅ Correr la extracción **solo sobre una muestra pequeña**, para mostrar
  qué datos se obtienen
- ❌ **NO** generes el `data.js` definitivo
- ❌ **NO** modifiques `app.js`, `index.html`, `styles.css` ni `data.js`
- ❌ **NO** hagas commits ni pushes

Si Romi pide avanzar más, dile que eso quedó para una etapa siguiente y que
lo converse con Benjamín. El motivo: primero hay que saber si los datos
sirven, antes de tocar el portal.

## Contexto que necesitas

Lee [CONTEXTO_PROYECTO.md](../../../CONTEXTO_PROYECTO.md) antes de empezar.
Resume el proyecto completo y las decisiones ya tomadas.

Lo esencial:
- Hay ~1000 PDFs de fichas de seguridad en SharePoint
- Se quiere mostrarlos en un portal web con QR, rombo NFPA y primeros auxilios
- Una ficha **vence a los 5 años desde su fecha de revisión**
- Los scripts ya están escritos y probados contra una ficha real

## Paso 1 — Verificar que Python está instalado

Ejecuta:

```
python --version
```

**Si responde con una versión (3.8 o superior):** sigue al paso 2.

**Si da error o "no se reconoce el comando":** Python no está instalado.
Dile a Romi, en lenguaje simple, algo como:

> Necesito instalar un programa gratuito (Python) para poder leer los PDFs.
> Se descarga de python.org. ¿Quieres que te guíe para instalarlo?

Si acepta, guíala a:
1. Ir a https://www.python.org/downloads/
2. Descargar la versión para Windows
3. **Al instalar, marcar la casilla "Add Python to PATH"** (es crítico; si no
   la marca, nada va a funcionar después)
4. Reiniciar la terminal y verificar de nuevo

## Paso 2 — Verificar la librería pypdf

Ejecuta:

```
python -c "import pypdf; print(pypdf.__version__)"
```

Si da error, instálala:

```
python -m pip install pypdf
```

No le expliques esto a Romi en detalle. Solo dile que estás preparando las
herramientas.

## Paso 3 — Pedir la ruta de la carpeta

Pregúntale a Romi dónde está la carpeta de SharePoint sincronizada. Algo así:

> ¿Me puedes decir dónde quedó la carpeta de SharePoint en tu computador?
> Si la abres en el explorador de archivos, puedes copiar la dirección desde
> la barra de arriba.

Suele verse como:
```
C:\Users\<usuario>\OneDrive - Coca-Cola\Fichas de Seguridad
```

**Verifica que la ruta existe** antes de continuar. Si no existe, pídesela de
nuevo — es común que se copie mal.

### Verificación crítica: archivos vacíos

Antes del diagnóstico, revisa si los archivos están realmente descargados.
Cuenta cuántos PDFs pesan 0 bytes.

Si hay muchos archivos vacíos, **detente** y dile a Romi:

> Los archivos están en la nube pero no descargados en tu computador, así que
> no puedo leerlos. Para arreglarlo: haz clic derecho sobre la carpeta y elige
> "Conservar siempre en este dispositivo". Espera a que terminen de bajar y
> me avisas.

## Paso 4 — Correr el diagnóstico

```
python scripts/diagnostico.py "RUTA_DE_LA_CARPETA"
```

Esto puede tardar unos minutos con 1000 archivos. Avísale a Romi que está
corriendo para que no crea que se colgó.

El script genera un `diagnostico.csv` con el detalle archivo por archivo.

## Paso 5 — Correr la extracción sobre una muestra

Para saber si los datos que salen son **usables**, no basta con saber que hay
texto. Corre la extracción sobre la carpeta completa pero **guardando el
resultado fuera del proyecto**, para no tocar el `data.js` real:

```
python scripts/extraer.py "RUTA_DE_LA_CARPETA" --salida "muestra_hds.js" --json
```

Genera `muestra_hds.js` y `muestra_hds.json` en la carpeta del proyecto.
**Bórralos al terminar** — son archivos de prueba, no deben quedar en el repo.

Ese comando además te dice **cuántas fichas están vencidas, por vencer y
vigentes** — que es uno de los datos que Romi necesita.

Revisa el `.json` generado y evalúa la calidad: ¿los nombres de componentes
salen limpios? ¿el NFPA tiene valores? ¿los primeros auxilios están completos?

**Si ves basura en los datos** (texto pegado, nombres cortados, campos vacíos
en masa), es señal de que hay formatos distintos al esperado. Anótalo en el
informe: significa que el parser necesita ajustes.

## Paso 6 — Entregar el informe

Preséntale a Romi un resumen **en lenguaje simple**. Estructura sugerida:

```
RESULTADO DEL DIAGNÓSTICO

Revisé las XXX fichas de la carpeta.

QUÉ SE PUEDE LEER AUTOMÁTICAMENTE
  XXX fichas (XX%) se leen sin problema
  XXX fichas (XX%) son escaneadas — el computador no puede leerlas
  XXX fichas tuvieron algún problema

ESTADO DE VIGENCIA (5 años desde la fecha de revisión)
  XXX vigentes
  XXX por vencer (en los próximos 6 meses)
  XXX VENCIDAS
  XXX sin fecha detectada

QUÉ INFORMACIÓN SE OBTIENE DE CADA FICHA
  (lista con ejemplos reales de una ficha)

CONCLUSIÓN
  (¿es viable? ¿qué falta? ¿cuánto trabajo manual queda?)
```

### Cómo interpretar los resultados

- **Más del 90% legible** → muy viable, el parser sirve casi tal cual
- **Entre 70% y 90%** → viable, pero hay formatos distintos que ajustar
- **Menos del 70%** → hay que revisar qué está pasando antes de seguir

Sobre los escaneados: si son pocos (menos de 50), lo más práctico suele ser
cargarlos a mano o pedir el original digital al proveedor. Menciónalo.

### Reglas para el informe

- **Sé honesto con los números.** Si el resultado es malo, dilo claramente.
  Es mejor saberlo ahora que después de semanas de trabajo.
- **No prometas plazos.** No sabes cuánto se demora el resto del proyecto.
- **Muestra un ejemplo real** de una ficha extraída. Vale más que cualquier
  explicación.
- Si algo falla y no sabes resolverlo, dilo. No inventes una explicación.

## Paso 7 — Preguntas pendientes para Romi

Si el diagnóstico sale bien, aprovecha de plantearle estas decisiones. **No
son técnicas — son de ella como prevencionista.** Anota sus respuestas para
que queden registradas.

1. **Al escanear el QR en una emergencia, ¿qué debe aparecer primero?**
   ¿El rombo NFPA? ¿Los primeros auxilios? ¿El teléfono de emergencia?

2. **¿El QR va por sustancia (uno por envase) o por área de la planta?**
   El portal hoy está armado por área.

3. **Cuando una ficha no declara un valor del rombo NFPA** (por ejemplo, no
   dice nada de Reactividad), ¿se muestra "no especificado" o se omite?
   *Contexto: el portal actual pone 0, lo que da a entender "sin riesgo"
   cuando en realidad es "no sabemos". Eso hay que corregirlo.*

4. **Las fichas vencidas, ¿se muestran igual con una advertencia, o se ocultan?**

## Si algo sale mal

| Problema | Qué hacer |
|---|---|
| "python no se reconoce" | Python no instalado o sin "Add to PATH". Volver al paso 1. |
| Archivos de 0 bytes | OneDrive no descargó. "Conservar siempre en este dispositivo". |
| "No se encontraron PDFs" | Ruta equivocada o los PDFs están en subcarpetas (el script ya busca en subcarpetas). Verificar la ruta. |
| El script se demora mucho | Normal con 1000 archivos. Esperar unos minutos. |
| Muchos "parciales" | Formatos distintos al esperado. Anotarlo en el informe, no es un error tuyo. |

## Al terminar

Guarda el informe en un archivo `INFORME_DIAGNOSTICO.md` en la raíz del
proyecto, para que Benjamín lo pueda leer después.

Recuérdale a Romi que **no se modificó nada del portal** — esto fue solo un
diagnóstico.
