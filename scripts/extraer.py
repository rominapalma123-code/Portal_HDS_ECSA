"""
Extrae la informacion de fichas de seguridad (HDS/FDS) en PDF y genera el
archivo data.js que consume el portal.

Uso:
    python extraer.py "C:/ruta/a/la/carpeta/con/pdfs"
    python extraer.py "C:/ruta" --salida ../data.js
    python extraer.py "C:/ruta" --json          (guarda tambien un .json aparte)

Criterio: si un dato no esta en el PDF, queda vacio. El script nunca inventa
valores; el portal muestra "no especificado" y eso es informacion honesta.
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Falta la libreria pypdf. Instalala con:")
    print("    python -m pip install pypdf")
    sys.exit(1)

# Vigencia por defecto de una ficha, en anios. Ajustable con --vigencia.
VIGENCIA_ANIOS = 5
# Meses antes del vencimiento en que la ficha pasa a estado "por_vencer".
AVISO_MESES = 6

MESES = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "set": 9, "oct": 10, "nov": 11, "dic": 12,
}

# Datos de contacto del proveedor: se omiten del JSON para no publicar
# correos corporativos en un sitio indexable. El PDF los conserva igual.
OMITIR_CONTACTO = True


def sin_tildes(texto):
    reemplazos = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
    }
    for origen, destino in reemplazos.items():
        texto = texto.replace(origen, destino)
    return texto


def limpiar(texto):
    """Normaliza espacios y recorta."""
    return re.sub(r"\s+", " ", texto or "").strip()


def leer_pdf(ruta):
    lector = PdfReader(str(ruta))
    partes = []
    for pagina in lector.pages:
        try:
            partes.append(pagina.extract_text() or "")
        except Exception:
            partes.append("")
    return "\n".join(partes)


def buscar(patron, texto, grupo=1):
    """Devuelve el grupo indicado o '' si no hay coincidencia."""
    m = re.search(patron, texto, re.IGNORECASE)
    return limpiar(m.group(grupo)) if m else ""


# ---------------------------------------------------------------- campos

def extraer_codigo(texto):
    codigo = buscar(r"C[oó]digo\(s\) del producto\s*([A-Z0-9][A-Z0-9./\-]+)", texto)
    if not codigo:
        codigo = buscar(r"Nombre Del Producto\s*([A-Z0-9][A-Z0-9./\-]+)", texto)
    return codigo


def extraer_fecha(texto):
    """Devuelve (iso, original). Formato tipico: '26-oct.-2019'."""
    crudo = buscar(r"Fecha de revisi[oó]n\s*([0-9]{1,2}[-/][A-Za-zñ.]+[-/][0-9]{4})", texto)
    if not crudo:
        return "", ""

    m = re.match(r"([0-9]{1,2})[-/]([A-Za-zñ.]+)[-/]([0-9]{4})", crudo)
    if not m:
        return "", crudo

    dia, mes_txt, anio = m.groups()
    mes = MESES.get(sin_tildes(mes_txt).lower().strip(".")[:3])
    if not mes:
        return "", crudo
    try:
        return date(int(anio), mes, int(dia)).isoformat(), crudo
    except ValueError:
        return "", crudo


def extraer_nfpa(texto):
    """
    Lee el rombo NFPA declarado en la ficha.

    Importante: solo devuelve los valores que el documento realmente trae.
    Las fichas suelen declarar unicamente Salud e Inflamabilidad; el resto
    queda en None y el portal debe mostrarlo como 'no especificado'.
    """
    nfpa = {"salud": None, "inflamabilidad": None, "inestabilidad": None, "especial": None}

    bloque = re.search(r"NFPA(.{0,400})", texto, re.IGNORECASE | re.DOTALL)
    if not bloque:
        return nfpa
    b = bloque.group(1)

    salud = re.search(r"Peligros?\s+para\s+la\s+salud\s*([0-4])", b, re.IGNORECASE)
    if salud:
        nfpa["salud"] = int(salud.group(1))

    inflam = re.search(r"Inflamabilidad\s*([0-4])", b, re.IGNORECASE)
    if inflam:
        nfpa["inflamabilidad"] = int(inflam.group(1))

    inest = re.search(r"(?:Inestabilidad|Reactividad)\s*([0-4])", b, re.IGNORECASE)
    if inest:
        nfpa["inestabilidad"] = int(inest.group(1))

    especial = re.search(r"(?:Peligros?\s+especiales?|Riesgos?\s+especiales?)\s*([A-Z]{1,3})", b, re.IGNORECASE)
    if especial:
        nfpa["especial"] = especial.group(1).upper()

    return nfpa


def extraer_codigos_h(texto):
    """
    Codigos de peligro H con su descripcion, sin repetir.

    Los codigos aparecen tanto sueltos entre parentesis '(H315)' como en la
    lista 'Indicaciones de peligro' con su texto. Solo interesan los segundos,
    que son los que traen descripcion.
    """
    # Se acota al bloque 'Indicaciones de peligro'. Fuera de el, los codigos
    # aparecen sueltos entre parentesis y sin texto, y contaminan el resultado.
    bloque = re.search(
        r"Indicaciones de peligro(.*?)(?=Consejos de prudencia|SECCI[OÓ]N\s*3|$)",
        texto, re.IGNORECASE | re.DOTALL,
    )
    ambito = bloque.group(1) if bloque else texto

    # Se corta el bloque en cada codigo en vez de usar lookaheads: con texto
    # corrido ('H315 - ...H318 - ...') un patron perezoso igual se salta
    # entradas, mientras que partir por posiciones no falla.
    # Sin \b: en el texto extraido los codigos van pegados a la palabra
    # anterior ('...cutaneaH318 - ...') y \b no reconoce ese limite.
    marcas = list(re.finditer(r"(H[2-4][0-9]{2})\s*[-–]\s*", ambito, re.IGNORECASE))
    vistos = {}
    for i, marca in enumerate(marcas):
        fin = marcas[i + 1].start() if i + 1 < len(marcas) else len(ambito)
        codigo = marca.group(1).upper()
        desc = limpiar(ambito[marca.end():fin])
        if desc and codigo not in vistos:
            vistos[codigo] = desc
    return [{"codigo": c, "descripcion": d} for c, d in sorted(vistos.items())]


def extraer_codigos_p(texto):
    """
    Consejos de prudencia P, incluyendo los combinados ('P305 + P351 + P338').

    El separador '+' debe consumirse dentro del codigo, si no el patron corta
    el combinado por la mitad y se pierde el primer codigo del grupo.
    """
    bloque = re.search(
        r"Consejos de prudencia(.*?)(?=SECCI[OÓ]N\s*3|Otros datos|$)",
        texto, re.IGNORECASE | re.DOTALL,
    )
    ambito = bloque.group(1) if bloque else texto

    # Mismo criterio que en los codigos H: se parte el bloque por posiciones.
    # El grupo '(?:\s*\+\s*P...)*' mantiene juntos los combinados como
    # 'P305 + P351 + P338', que son un solo consejo.
    marcas = list(re.finditer(
        r"(P[1-5][0-9]{2}(?:\s*\+\s*P[1-5][0-9]{2})*)\s*[-–]\s*",
        ambito, re.IGNORECASE,
    ))
    vistos = {}
    for i, marca in enumerate(marcas):
        fin = marcas[i + 1].start() if i + 1 < len(marcas) else len(ambito)
        codigo = re.sub(r"\s*\+\s*", " + ", limpiar(marca.group(1)).upper())
        desc = limpiar(ambito[marca.end():fin])
        if desc and codigo not in vistos:
            vistos[codigo] = desc
    return [{"codigo": c, "descripcion": d} for c, d in vistos.items()]


def extraer_componentes(texto):
    """
    Componentes de la mezcla con N CAS y porcentaje en peso.

    En el texto extraido las columnas vienen pegadas, por ejemplo:
        'Acido propionico79-09-41 - 5%Skin Corr. 1B (H314)'
    El N CAS tiene formato fijo (2-7 digitos, 2 digitos, 1 digito), lo que
    permite separar el nombre del resto de forma confiable.
    """
    # Anclado en el titulo de la seccion y no en 'SECCION 3', que puede venir
    # partido por el salto de pagina.
    seccion = re.search(
        r"Composici[oó]n/informaci[oó]n sobre los componentes(.*?)"
        r"(?=SECCI[OÓ]N\s*4|Primeros auxilios)",
        texto, re.IGNORECASE | re.DOTALL,
    )
    if not seccion:
        return []

    cuerpo = seccion.group(1)

    # Texto que se pega al nombre por venir de otra columna de la tabla o de
    # la fila anterior. Se recorta desde la derecha, que es donde queda el
    # nombre real del componente.
    RUIDO = [
        r"Nombre\s*qu[ií]mico", r"N[ºo°]?\s*CAS", r"%?\s*en\s*peso",
        r"GHS\s*Clasificaci[oó]n", r"Clasificaci[oó]n",
        r"Skin\s*Corr\.?\s*[0-9A-B]*", r"Skin\s*Irrit\.?\s*[0-9A-B]*",
        r"Eye\s*Dam\.?\s*[0-9A-B]*", r"Eye\s*Irrit\.?\s*[0-9A-B]*",
        r"Acute\s*Tox\.?\s*[0-9A-B]*", r"Aquatic\s*\w*\s*[0-9A-B]*",
        r"STOT\s*\w*\s*[0-9A-B]*", r"Repr\.?\s*[0-9A-B]*",
        r"\(H[2-4][0-9]{2}\)", r"H[2-4][0-9]{2}",
    ]
    patron_ruido = re.compile("|".join(RUIDO), re.IGNORECASE)

    def limpiar_nombre(bruto):
        """Se queda con el texto posterior al ultimo fragmento de ruido."""
        nombre = bruto
        for m in patron_ruido.finditer(bruto):
            nombre = bruto[m.end():]
        nombre = re.sub(r"(?i)^(?:Mezcla|Sustancia)\b", "", nombre)
        # Restos de puntuacion o letras sueltas del encabezado partido.
        nombre = nombre.strip(" .,;:-–()%")
        return limpiar(nombre)

    componentes = []
    vistos = set()
    for m in re.finditer(r"([^\n]{2,90}?)\s*(\d{2,7}-\d{2}-\d)\s*([0-9<>,.\s\-]{0,14}%)?", cuerpo):
        nombre = limpiar_nombre(m.group(1))
        cas = m.group(2)
        # Un componente sin nombre legible no aporta; se omite antes que
        # mostrar basura en una ficha de seguridad.
        if len(nombre) < 3 or cas in vistos:
            continue
        vistos.add(cas)
        componentes.append({
            "nombre": nombre,
            "cas": cas,
            "porcentaje": limpiar(m.group(3) or ""),
        })
    return componentes


def extraer_primeros_auxilios(texto):
    """Medidas de primeros auxilios por via de exposicion (Seccion 4)."""
    # El titulo puede venir partido por el salto de pagina, por eso se ancla
    # en 'Primeros auxilios' y no en 'SECCION 4'.
    seccion = re.search(
        r"Primeros auxilios(.*?)(?=SECCI[OÓ]N\s*5|Medidas de lucha contra incendios)",
        texto, re.IGNORECASE | re.DOTALL,
    )
    if not seccion:
        return {}

    cuerpo = seccion.group(1)
    # El encabezado 'Descripcion de los primeros auxilios' precede a la
    # primera via; si no se descarta, se cuela dentro de 'inhalacion'.
    cuerpo = re.sub(r"(?i)Descripci[oó]n de los primeros auxilios\s*", "", cuerpo)

    etiquetas = [
        ("inhalacion", r"Inhalaci[oó]n"),
        ("ojos", r"Contacto con los ojos"),
        ("piel", r"Contacto con la piel"),
        ("ingestion", r"Ingesti[oó]n"),
    ]
    # Cortes que marcan el fin de la lista de vias de exposicion.
    FIN = r"SECCI[OÓ]N|Expected|Nota para|S[ií]ntomas|Indicaci[oó]n de"

    resultado = {}
    for i, (clave, patron) in enumerate(etiquetas):
        # El corte debe incluir TODAS las demas etiquetas, no solo las
        # posteriores: en el PDF el orden no siempre es el mismo.
        otras = [p for j, (_, p) in enumerate(etiquetas) if j != i]
        cortes = "|".join(otras + [FIN])
        m = re.search(rf"{patron}\s*[:.]?\s*(.{{5,500}}?)(?={cortes}|$)",
                      cuerpo, re.IGNORECASE | re.DOTALL)
        if m:
            texto_via = limpiar(m.group(1))
            if len(texto_via) >= 5:
                resultado[clave] = texto_via
    return resultado


def extraer_clasificacion_ghs(texto):
    """Clases de peligro GHS con su categoria, desde la Seccion 2."""
    seccion = re.search(
        r"GHS Clasificaci[oó]n(.*?)(?=Elementos de la etiqueta|SECCI[OÓ]N\s*3)",
        texto, re.IGNORECASE | re.DOTALL,
    )
    if not seccion:
        return []

    cuerpo = seccion.group(1)
    # Encabezado que antecede a la primera clase y se pega a su nombre.
    cuerpo = re.sub(r"(?i)Peligros?\s+m[aá]s\s+importantes\s*\.?\s*", "", cuerpo)

    clases = []
    for m in re.finditer(
        r"([A-Za-zÁÉÍÓÚÑáéíóúñ][^\n]{4,80}?)\s*Categor[ií]a\s*([0-9A-B]+)\s*[-–]?\s*\(?(H[2-4][0-9]{2})?\)?",
        cuerpo,
    ):
        nombre = limpiar(m.group(1)).lstrip(". ")
        if not nombre:
            continue
        clases.append({
            "clase": nombre,
            "categoria": m.group(2),
            "codigo_h": m.group(3) or "",
        })
    return clases


def calcular_vigencia(fecha_iso, vigencia_anios, hoy):
    """Devuelve (estado, fecha_vencimiento_iso). Estados: vigente / por_vencer / vencida / sin_fecha."""
    if not fecha_iso:
        return "sin_fecha", ""

    revision = date.fromisoformat(fecha_iso)
    try:
        vence = revision.replace(year=revision.year + vigencia_anios)
    except ValueError:
        # 29 de febrero en anio no bisiesto.
        vence = revision.replace(year=revision.year + vigencia_anios, day=28)

    if hoy >= vence:
        estado = "vencida"
    else:
        meses_restantes = (vence.year - hoy.year) * 12 + (vence.month - hoy.month)
        estado = "por_vencer" if meses_restantes <= AVISO_MESES else "vigente"

    return estado, vence.isoformat()


def procesar(ruta, vigencia_anios, hoy):
    """Procesa un PDF y devuelve el registro para el portal."""
    texto = leer_pdf(ruta)

    if len(texto.strip()) < 200:
        return {
            "archivo": ruta.name,
            "estado_extraccion": "escaneado",
            "aviso": "PDF sin texto extraible (escaneado). Requiere OCR o carga manual.",
        }

    fecha_iso, fecha_txt = extraer_fecha(texto)
    estado, vence = calcular_vigencia(fecha_iso, vigencia_anios, hoy)

    registro = {
        "archivo": ruta.name,
        "codigo": extraer_codigo(texto),
        "nombre": buscar(r"Descripci[oó]n\s+([^\n]{3,80}?)(?=SECCI[OÓ]N|Numero|N[uú]mero|$)", texto),
        "spec": buscar(r"Spec\.?\s*Name\s*([^\s]{3,40})", texto),
        "revision": buscar(r"N[uú]mero de Revisi[oó]n\s*([0-9]+)", texto),
        "fecha_revision": fecha_iso,
        "fecha_revision_texto": fecha_txt,
        "fecha_vencimiento": vence,
        "estado_vigencia": estado,
        # 'Uso recomendado' aparece dos veces: en el titulo de la subseccion y
        # como etiqueta del dato. Interesa la ultima, de ahi el .* inicial.
        "uso_recomendado": buscar(
            r"Uso recomendado.*Uso recomendado\s*([^\n]{5,200}?)(?=Usos desaconsejados|SECCI[OÓ]N|$)",
            texto,
        ) or buscar(r"Uso recomendado\s*([^\n]{5,200}?)(?=Usos desaconsejados|SECCI[OÓ]N|$)", texto),
        "palabra_advertencia": buscar(r"Palabra de advertencia\s*(Peligro|Atenci[oó]n|Advertencia)", texto),
        "clasificacion_ghs": extraer_clasificacion_ghs(texto),
        "nfpa": extraer_nfpa(texto),
        "codigos_h": extraer_codigos_h(texto),
        "codigos_p": extraer_codigos_p(texto),
        "componentes": extraer_componentes(texto),
        "primeros_auxilios": extraer_primeros_auxilios(texto),
        "telefono_emergencia": buscar(r"Tel[eé]fono de emergencia\s*([0-9+\-().\s]{7,25})", texto),
        "estado_extraccion": "ok",
    }

    if not OMITIR_CONTACTO:
        registro["fabricante"] = buscar(r"Direcci[oó]n del fabricante\s*([^\n]{5,120})", texto)

    # Marca los registros a los que les falta algo importante, para revision.
    faltantes = [c for c in ("codigo", "fecha_revision") if not registro[c]]
    if not registro["componentes"]:
        faltantes.append("componentes")
    if registro["nfpa"]["salud"] is None and registro["nfpa"]["inflamabilidad"] is None:
        faltantes.append("nfpa")
    if faltantes:
        registro["estado_extraccion"] = "parcial"
        registro["campos_faltantes"] = faltantes

    return registro


def main():
    ap = argparse.ArgumentParser(description="Extrae datos de fichas de seguridad en PDF.")
    ap.add_argument("carpeta", nargs="?", help="Carpeta con los PDFs")
    ap.add_argument("--salida", help="Ruta del data.js a generar")
    ap.add_argument("--json", action="store_true", help="Guardar tambien un .json aparte")
    ap.add_argument("--vigencia", type=int, default=VIGENCIA_ANIOS,
                    help=f"Anios de vigencia de una ficha (por defecto {VIGENCIA_ANIOS})")
    args = ap.parse_args()

    raiz = Path(__file__).resolve().parent.parent
    carpeta = Path(args.carpeta) if args.carpeta else raiz
    if not carpeta.is_dir():
        print(f"No existe la carpeta: {carpeta}")
        sys.exit(1)

    pdfs = sorted(carpeta.rglob("*.pdf"))
    if not pdfs:
        print(f"No se encontraron PDFs en: {carpeta}")
        sys.exit(1)

    hoy = date.today()
    print(f"Carpeta:  {carpeta}")
    print(f"PDFs:     {len(pdfs)}")
    print(f"Vigencia: {args.vigencia} anios\n")

    registros = []
    for i, pdf in enumerate(pdfs, 1):
        if pdf.stat().st_size == 0:
            registros.append({
                "archivo": pdf.name,
                "estado_extraccion": "error",
                "aviso": "Archivo de 0 bytes. En OneDrive: 'Conservar siempre en este dispositivo'.",
            })
            continue
        try:
            registros.append(procesar(pdf, args.vigencia, hoy))
        except Exception as e:
            registros.append({
                "archivo": pdf.name,
                "estado_extraccion": "error",
                "aviso": f"Error al procesar: {e}",
            })
        if i % 50 == 0:
            print(f"  {i}/{len(pdfs)} procesados...")

    # ---- Resumen ----
    def contar(clave, valor):
        return sum(1 for r in registros if r.get(clave) == valor)

    print("\n" + "=" * 60)
    print("RESULTADO DE LA EXTRACCION")
    print("=" * 60)
    for etiqueta, valor in [("Completos", "ok"), ("Parciales", "parcial"),
                            ("Escaneados", "escaneado"), ("Con error", "error")]:
        n = contar("estado_extraccion", valor)
        if n:
            print(f"  {etiqueta:12} {n:5}/{len(registros)}")

    print("\nVigencia:")
    for etiqueta, valor in [("Vigentes", "vigente"), ("Por vencer", "por_vencer"),
                            ("Vencidas", "vencida"), ("Sin fecha", "sin_fecha")]:
        n = contar("estado_vigencia", valor)
        if n:
            print(f"  {etiqueta:12} {n:5}")

    revisar = [r for r in registros if r.get("estado_extraccion") in ("parcial", "escaneado", "error")]
    if revisar:
        print(f"\nRequieren revision manual: {len(revisar)}")
        for r in revisar[:10]:
            detalle = ", ".join(r.get("campos_faltantes", [])) or r.get("aviso", "")
            print(f"  - {r['archivo']}: {detalle}")
        if len(revisar) > 10:
            print(f"  ... y {len(revisar) - 10} mas")

    # ---- Salida ----
    salida = Path(args.salida) if args.salida else raiz / "data.js"
    contenido = json.dumps(registros, ensure_ascii=False, indent=2)
    cabecera = (
        "// Generado automaticamente por scripts/extraer.py\n"
        f"// Fecha de generacion: {hoy.isoformat()}  |  Fichas: {len(registros)}\n"
        "// No editar a mano: los cambios se pierden al regenerar.\n"
    )
    salida.write_text(f"{cabecera}window.HDS_DATA = {contenido};\n", encoding="utf-8")
    print(f"\nGenerado: {salida}")

    if args.json:
        ruta_json = salida.with_suffix(".json")
        ruta_json.write_text(contenido, encoding="utf-8")
        print(f"Generado: {ruta_json}")


if __name__ == "__main__":
    main()
