# Contexto del proyecto — Portal HDS

**Actualizado: 12 de agosto de 2026**
**Escrito para que cualquiera (persona o agente) entienda el estado real del proyecto.**

---

## Qué es esto

Un portal web para consultar **Hojas de Datos de Seguridad (HDS)** de las
sustancias químicas de la planta de Coca-Cola Envases Central S.A.

La idea: alguien escanea un código QR frente a una bodega, y en su celular
aparece la información de seguridad de esa sustancia — rombo NFPA, primeros
auxilios, componentes, y la ficha completa en PDF.

**Estado actual: en desarrollo. No está publicado ni en uso.**

## Qué hay construido

Sitio web estático en HTML/CSS/JavaScript, sin dependencias ni servidor.
Se abre con doble clic en `index.html`.

| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Diseño |
| `app.js` | Buscador, filtros, modales, rombo NFPA |
| `data.js` | Datos de 109 sustancias, extraídas de un Excel |
| `scripts/diagnostico.py` | **NUEVO** — revisa una carpeta de PDFs |
| `scripts/extraer.py` | **NUEVO** — extrae los datos de los PDFs |

Funciona: búsqueda sin tildes, filtros por área y por clase de peligro NCh 382,
fichas en modal, protocolo de emergencias con teléfonos reales (CITUC,
Bomberos, SAMU), y filtros que se guardan en la URL — pensado para los QR.

---

## El objetivo

Romi (prevencionista, SSO) definió el alcance así:

> Leer los ~1000 PDFs que están en SharePoint y que se muestren de buena
> manera en la página, para que alguien escanee un QR y llegue al rombo y a
> lo que sea necesario.

---

## Decisiones ya tomadas

### 1. Los PDFs se procesan con un script, no con inteligencia artificial

**Por qué:** un script determinista procesa los 1000 en minutos, gratis, y
**nunca inventa datos**. Un modelo de IA podría "interpretar" un valor NFPA o
una concentración — inaceptable en fichas de seguridad.

La IA queda solo para casos puntuales: revisar fichas que fallen y escaneados.

### 2. Se descartó el scraping de SharePoint

SharePoint es una aplicación con login corporativo, no una web estática. Es
frágil, requiere automatizar un navegador y TI puede detectarlo como actividad
anómala.

**En su lugar:** sincronizar la biblioteca con OneDrive. Los PDFs quedan como
carpeta local normal. Un clic, sin credenciales.

### 3. Se descartó la integración con Microsoft Graph / Azure AD

Era la opción más automática, pero exigía que **TI corporativo registrara una
aplicación en Azure AD** — trámite que no depende del equipo y puede tardar
meses.

**Lo importante:** no aporta nada que la opción elegida no dé. Y su ventaja
(sincronización automática) se consigue igual con OneDrive + script programado.

Si algún día TI aprueba los permisos, se puede montar encima sin perder nada
de lo construido.

### 4. El script se corre manualmente, cada ~1 mes

Las fichas vencen de forma escalonada: ~200 al año, unas 15-20 al mes. Correrlo
a mano tras cada tanda de actualizaciones es suficiente, y **más seguro que
automatizarlo**, porque hay una persona viendo los errores.

### 5. Una ficha vence a los 5 años desde su fecha de revisión

Confirmado por Romi. La fecha viene en el propio PDF y el script la extrae.

El control de vigencia es **funcionalidad central**, no un extra: con 200
vencimientos al año, lo que hunde el proyecto es que se pase una ficha sin
que nadie lo note.

### 6. Publicación en GitHub Pages

Decidido por el equipo. Romi confirmó que los PDFs no son públicos pero
tampoco sensibles.

**Nota pendiente:** las fichas traen el correo de una persona real
(`marrieta@coca-cola.com`). El script **lo omite por defecto** al generar el
JSON, para no publicarlo en un sitio indexable por buscadores. Se controla con
la constante `OMITIR_CONTACTO` en `scripts/extraer.py`.

### 7. El catálogo se construye desde los PDFs, no desde el Excel

Descubrimiento clave: **el listado maestro (las 109 sustancias de `data.js`)
está incompleto.** Los PDFs de SharePoint son el inventario real.

Esto elimina el mayor obstáculo que tenía el proyecto. Antes se pensaba que
había que emparejar cada PDF con una sustancia del listado — pero los códigos
no coinciden (el PDF dice `AC/B-0063.01-P02`, el listado dice "Solvelec L") y
eso habría requerido armar a mano una tabla de 1000 equivalencias.

**Ya no es necesario.** Cada PDF genera su propio registro con los datos que
él mismo trae. El listado maestro pasa a ser fuente secundaria, para agregar
después el área y la ubicación en planta.

---

## Problemas conocidos del portal actual

Ninguno es urgente porque **el portal no está publicado**. Pero hay que
arreglarlos antes de que se use.

### 1. El rombo NFPA se inventa — el más importante

`app.js` (función `getNfpaEstimates`) **calcula** los valores NFPA a partir de
la clase NCh 382, en vez de leerlos de la ficha.

El problema: **67 de los 109 registros (61%) tienen la clase vacía.** Para
esos, el portal muestra un rombo **0-0-0**, que se lee como "sin riesgo"
cuando en realidad significa "no tenemos el dato".

Ejemplo real: la ficha `AC/B-0063.01-P02` declara **Salud 3, Inflamabilidad 2**.
El portal actual mostraría 0-0-0.

**Cómo se arregla:** usar los valores que vienen en el PDF y mostrar
"no especificado" cuando la ficha no los declare. El script ya los extrae así
(devuelve `null`, nunca 0 inventado).

### 2. Las imágenes no cargan

`index.html` apunta a `img/logo_envases_central.png`, `img/mascota.png` y
`img/logo_embajadores.png`, pero los archivos están en la **raíz**, no en una
carpeta `img/`.

### 3. La mascota no hace nada

El HTML dice "Haz clic en mí para ver un consejo de seguridad" y el CSS tiene
los estilos, pero **no hay código en `app.js`** que responda al clic.

### 4. Listeners duplicados

En `app.js`, dentro de `render()`, se registran listeners sobre `.card` y
`.card-action-btn` en cada renderizado, sin limpiar los anteriores. Se
acumulan con cada búsqueda.

### 5. Las URLs de PDF se guardan en localStorage

Lo que configura una persona en su navegador **no lo ve nadie más**. No sirve
para trabajo en equipo. Al generar el `data.js` desde los PDFs esto deja de
ser necesario.

---

## Los scripts

### `scripts/diagnostico.py`

Revisa una carpeta de PDFs **sin extraer datos**. Responde: cuántos tienen
texto vs. escaneados, cuántos formatos distintos hay, qué campos se detectan.

```
python scripts/diagnostico.py "C:/ruta/a/la/carpeta"
```

Genera `diagnostico.csv` con el detalle archivo por archivo.

### `scripts/extraer.py`

Extrae los datos y genera el `data.js`.

```
python scripts/extraer.py "C:/ruta/a/la/carpeta"
python scripts/extraer.py "C:/ruta" --salida ../data.js --json
python scripts/extraer.py "C:/ruta" --vigencia 5
```

**Principio de diseño:** si un dato no está en el PDF, queda vacío o `null`.
**El script nunca inventa valores.** El portal debe mostrar "no especificado",
que es información honesta.

### Qué extrae — verificado contra una ficha real

Probado con `ACB0063.01P02_MTR_CHGH_ES.pdf`, campo por campo:

- **Código:** `AC/B-0063.01-P02` · Beverage Base · Revisión 3
- **Fecha de revisión:** 26-oct-2019 → vence 26-oct-2024 → **vencida**
- **NFPA declarado:** Salud 3, Inflamabilidad 2 (Reactividad y Especial:
  `null`, la ficha no los trae)
- **Clasificación GHS:** Corrosión cutánea Cat. 2 (H315), Lesiones oculares
  graves Cat. 1 (H318) — palabra de advertencia "Peligro"
- **Componentes:** Ácido propiónico (CAS 79-09-4, 1-5%), Ácido isobutírico
  (CAS 79-31-2, 1-5%)
- **Códigos H y P:** incluidos los combinados (`P305 + P351 + P338`)
- **Primeros auxilios:** inhalación, ojos, piel, ingestión
- **Teléfono de emergencia:** 56-2-27771994

### Requisitos

- Python 3.8 o superior
- `pypdf` (`python -m pip install pypdf`)

---

## Lo que falta por decidir

**De Romi (criterio de prevencionista, no técnico):**

1. Al escanear el QR en una emergencia, ¿qué se muestra primero?
2. ¿QR por sustancia o por área? (el portal hoy está armado por área)
3. Cuando la ficha no declara un valor NFPA, ¿"no especificado" u omitir?
4. Las fichas vencidas, ¿se muestran con advertencia o se ocultan?

**Del equipo:**

5. ¿Quién se hace cargo de los ~200 vencimientos al año? Sin un responsable
   definido, el portal se degrada solo.
6. ¿Cuántos PDFs escaneados hay y qué se hace con ellos? (pedir el original
   digital, OCR, o carga manual)

---

## Próximos pasos

1. **Diagnóstico de los 1000 PDFs** ← es lo que toca ahora
   Ver `.claude/skills/diagnostico-hds/SKILL.md`
2. Ajustar el parser según lo que revele el diagnóstico
3. Corregir el rombo NFPA inventado y los problemas conocidos
4. Rediseñar la ficha para mostrar los datos nuevos
5. Generar los QR
6. Publicar

---

## Repositorio

`https://github.com/rominapalma123-code/Portal_HDS_ECSA` — rama `main`

Para que Benjamín pueda subir cambios, Romi debe agregarlo como colaborador
en Settings → Collaborators.
