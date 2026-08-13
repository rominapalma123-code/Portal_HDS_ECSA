"""
Diagnostico de una carpeta de fichas de seguridad (HDS/FDS) en PDF.

NO extrae datos: solo revisa que hay adentro para dimensionar el trabajo.
Responde tres preguntas:
  1. Cuantos PDFs tienen texto real y cuantos son escaneados (necesitan OCR).
  2. Cuantos formatos distintos hay (plantilla SGA conocida vs. otras).
  3. Que campos clave se detectan y en cuantos archivos fallan.

Uso:
    python diagnostico.py "C:/ruta/a/la/carpeta"

Si no se pasa ruta, usa la carpeta del proyecto.
Genera 'diagnostico.csv' con el detalle archivo por archivo.
"""

import csv
import sys
from collections import Counter
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Falta la libreria pypdf. Instalala con:")
    print("    python -m pip install pypdf")
    sys.exit(1)

# Un PDF con menos caracteres que esto por pagina se considera escaneado.
MIN_CHARS_POR_PAGINA = 100

# Marcadores que identifican la plantilla SGA de 16 secciones.
MARCADORES_SGA = [
    "FICHA DE DATOS DE SEGURIDAD",
    "SECCION 1",
    "SECCION 2",
    "SECCION 3",
    "SECCION 4",
]

# Campos clave que el parser va a necesitar despues.
CAMPOS_CLAVE = {
    "codigo_producto": ["Codigo(s) del producto", "Nombre Del Producto"],
    "fecha_revision": ["Fecha de revision"],
    "nfpa": ["NFPA"],
    "componentes": ["Nombre quimico", "N CAS", "Composicion"],
    "primeros_auxilios": ["Primeros auxilios"],
    "clasificacion_ghs": ["GHS Clasificacion", "Clasificacion"],
}


def sin_tildes(texto):
    """Quita tildes y enies para que las busquedas no dependan del encoding."""
    reemplazos = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
    }
    for origen, destino in reemplazos.items():
        texto = texto.replace(origen, destino)
    return texto


def leer_texto(ruta):
    """Devuelve (texto, n_paginas, error). Texto vacio si es escaneado."""
    try:
        lector = PdfReader(str(ruta))
        paginas = len(lector.pages)
        partes = []
        for pagina in lector.pages:
            try:
                partes.append(pagina.extract_text() or "")
            except Exception:
                # Una pagina rota no invalida el resto del documento.
                partes.append("")
        return "\n".join(partes), paginas, None
    except Exception as e:
        return "", 0, str(e)


def analizar(ruta):
    """Analiza un PDF y devuelve un dict con el diagnostico."""
    texto, paginas, error = leer_texto(ruta)

    fila = {
        "archivo": ruta.name,
        "paginas": paginas,
        "caracteres": len(texto),
        "tipo": "",
        "plantilla": "",
        "error": error or "",
    }

    if error:
        fila["tipo"] = "ERROR"
        return fila, texto

    # Un PDF escaneado es imagen: extrae muy poco o nada de texto.
    chars_por_pagina = len(texto) / paginas if paginas else 0
    if chars_por_pagina < MIN_CHARS_POR_PAGINA:
        fila["tipo"] = "ESCANEADO"
    else:
        fila["tipo"] = "TEXTO"

    plano = sin_tildes(texto).upper()
    encontrados = sum(1 for m in MARCADORES_SGA if sin_tildes(m).upper() in plano)
    if encontrados >= 4:
        fila["plantilla"] = "SGA"
    elif encontrados >= 2:
        fila["plantilla"] = "SGA-PARCIAL"
    else:
        fila["plantilla"] = "OTRO"

    # Marca que campos clave aparecen en el documento.
    for campo, marcadores in CAMPOS_CLAVE.items():
        hay = any(sin_tildes(m).upper() in plano for m in marcadores)
        fila[campo] = "si" if hay else "NO"

    return fila, texto


def main():
    if len(sys.argv) > 1:
        carpeta = Path(sys.argv[1])
    else:
        carpeta = Path(__file__).resolve().parent.parent

    if not carpeta.is_dir():
        print(f"No existe la carpeta: {carpeta}")
        sys.exit(1)

    pdfs = sorted(carpeta.rglob("*.pdf"))
    if not pdfs:
        print(f"No se encontraron PDFs en: {carpeta}")
        sys.exit(1)

    print(f"Carpeta:  {carpeta}")
    print(f"PDFs:     {len(pdfs)}")
    print("Analizando...\n")

    filas = []
    for i, pdf in enumerate(pdfs, 1):
        # Un archivo de 0 bytes casi siempre es OneDrive sin descargar.
        if pdf.stat().st_size == 0:
            filas.append({
                "archivo": pdf.name, "paginas": 0, "caracteres": 0,
                "tipo": "VACIO", "plantilla": "",
                "error": "archivo de 0 bytes (revisar OneDrive: 'Conservar siempre en este dispositivo')",
            })
            continue

        fila, _ = analizar(pdf)
        filas.append(fila)

        if i % 50 == 0:
            print(f"  {i}/{len(pdfs)} procesados...")

    # ---- Resumen ----
    tipos = Counter(f["tipo"] for f in filas)
    plantillas = Counter(f["plantilla"] for f in filas if f["plantilla"])
    total = len(filas)

    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)

    print("\nTipo de archivo:")
    for tipo, n in tipos.most_common():
        print(f"  {tipo:12} {n:5}  ({n / total * 100:5.1f}%)")

    print("\nFormato / plantilla:")
    for plantilla, n in plantillas.most_common():
        print(f"  {plantilla:12} {n:5}  ({n / total * 100:5.1f}%)")

    con_texto = [f for f in filas if f["tipo"] == "TEXTO"]
    if con_texto:
        print(f"\nCampos clave (sobre {len(con_texto)} PDFs con texto):")
        for campo in CAMPOS_CLAVE:
            n = sum(1 for f in con_texto if f.get(campo) == "si")
            print(f"  {campo:20} {n:5}/{len(con_texto)}  ({n / len(con_texto) * 100:5.1f}%)")

    escaneados = tipos.get("ESCANEADO", 0)
    errores = tipos.get("ERROR", 0) + tipos.get("VACIO", 0)

    print("\n" + "=" * 60)
    print("CONCLUSION")
    print("=" * 60)
    procesables = total - escaneados - errores
    print(f"  Procesables automaticamente:  {procesables}/{total}  ({procesables / total * 100:.1f}%)")
    if escaneados:
        print(f"  Requieren OCR o carga manual: {escaneados}")
    if errores:
        print(f"  Con problemas (revisar):      {errores}")

    # ---- CSV con el detalle ----
    salida = carpeta / "diagnostico.csv"
    columnas = ["archivo", "paginas", "caracteres", "tipo", "plantilla"] + list(CAMPOS_CLAVE) + ["error"]
    with open(salida, "w", newline="", encoding="utf-8-sig") as fh:
        escritor = csv.DictWriter(fh, fieldnames=columnas, extrasaction="ignore")
        escritor.writeheader()
        escritor.writerows(filas)

    print(f"\nDetalle por archivo: {salida}")


if __name__ == "__main__":
    main()
