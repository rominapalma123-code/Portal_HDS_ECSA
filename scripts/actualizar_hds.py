"""Actualiza extractos desde los PDF públicos ya vinculados. No infiere peligros ni asigna PDF por similitud."""
from __future__ import annotations
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlparse, parse_qs, unquote
from urllib.request import Request, urlopen
import fitz

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'data.js'
HEADING = re.compile(r'(?i)^(?:SECCI[ÓO]N\s*)?(1[0-6]|[1-9])\s*[.\-:]\s*[-:]?\s*(?!\d)(?:Identifica|Composici|Primeros|Procedimiento|Medidas|Manipulaci|Controles|Control de|Propiedades|Estabilidad|Informaci|Consideraciones|Otras)')
TEXT_HEADING = re.compile(r'(?i)(?:SECCI[ÓO]N\s*)?\b(1[0-6]|[1-9])\s*[.\-:]\s*[-:]?\s*(?!\d)(Identifica(?:ción|cion)|Composici[oó]n|Primeros auxilios|Procedimientos de emergencia y primeros auxilios|Medidas|Procedimiento en caso|Manipulaci[oó]n|Controles|Control de|Propiedades|Estabilidad|Informaci[oó]n|Consideraciones|Otras informaciones)[^\n]{0,100}')

def read_assignment(source, name):
    marker = name + ' = '
    position = source.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(source[position:])[0]

def drive_id(url):
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname != 'drive.google.com':
        raise ValueError('Se requiere un enlace HTTPS de Google Drive: ' + url)
    match = re.search(r'/file/d/([A-Za-z0-9_-]+)', parsed.path)
    ident = match.group(1) if match else parse_qs(parsed.query).get('id', [''])[0]
    if not re.fullmatch(r'[A-Za-z0-9_-]+', ident):
        raise ValueError('No se pudo identificar el PDF: ' + url)
    return ident

def process(ident, url, previous, product):
    request = Request('https://drive.google.com/uc?export=download&id=' + ident,
                      headers={'User-Agent': 'Portal-HDS/1.0'})
    with urlopen(request, timeout=60) as response:
        content_type = response.headers.get('Content-Type', '')
        binary = response.read(30 * 1024 * 1024 + 1)
        disposition = response.headers.get('Content-Disposition', '')
    if len(binary) > 30 * 1024 * 1024:
        raise ValueError(product + ': PDF mayor a 30 MB; revisar manualmente.')
    if not binary.startswith(b'%PDF'):
        raise ValueError(product + ': Drive no entregó un PDF. Revisar el permiso de lectura del enlace. ' + content_type)
    digest = hashlib.sha256(binary).hexdigest()
    if previous and previous.get('sha256') == digest:
        return ident, previous, False
    pdf = fitz.open(stream=binary, filetype='pdf')
    if pdf.needs_pass:
        raise ValueError(product + ': PDF protegido con contraseña.')
    text = '\n'.join(page.get_text(sort=True) for page in pdf)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    headings = list(TEXT_HEADING.finditer(text))
    sections = {}
    for i, match in enumerate(headings):
        title = match.group(0)
        lower = title.lower()
        kind = ('hazards' if 'identifica' in lower and 'peligro' in lower else
                'components' if 'composici' in lower else
                'aid' if 'primeros auxilios' in lower else None)
        if kind and kind not in sections:
            end = headings[i+1].start() if i+1 < len(headings) else len(text)
            sections[kind] = {'title': title.strip(), 'text': text[match.end():end].strip()}
    # Fail closed rather than replace a usable record with guessed or missing medical information.
    if any(not sections.get(k, {}).get('text') for k in ('hazards', 'components', 'aid')):
        raise ValueError(product + ': no se pudieron reconocer las secciones de peligros, composición y primeros auxilios. Se conserva la versión publicada hasta revisar el PDF.')
    anchors = []
    for pn, page in enumerate(pdf):
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                line_text = ''.join(span['text'] for span in line['spans']).strip()
                if HEADING.search(line_text):
                    anchors.append({'page': pn, 'y': line['bbox'][1], 'text': line_text})
    anchors.sort(key=lambda a: (a['page'], a['y']))
    start = next((a for a in anchors if 'identifica' in a['text'].lower() and 'peligro' in a['text'].lower()), None)
    if not start:
        raise ValueError(product + ': no se pudo localizar visualmente el apartado de peligros.')
    nexts = [a for a in anchors if (a['page'], a['y']) > (start['page'], start['y']) and not ('identifica' in a['text'].lower() and 'peligro' in a['text'].lower())]
    end = nexts[0] if nexts else {'page': start['page'] + 1, 'y': 0}
    images = []
    for pn in range(start['page'], min(end['page'] + 1, len(pdf))):
        page = pdf[pn]
        top = max(28, start['y']-5) if pn == start['page'] else 55
        bottom = end['y']-5 if pn == end['page'] else page.rect.height-40
        if bottom-top < 20:
            continue
        rect = fitz.Rect(35, top, page.rect.width-30, bottom)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), clip=rect)
        images.append({'page': pn+1, 'data': 'data:image/jpeg;base64,' + base64.b64encode(pix.tobytes('jpeg', jpg_quality=82)).decode()})
    if not images:
        raise ValueError(product + ': no se generó una imagen de la señalización del PDF.')
    for kind, word in [('components', 'composici'), ('aid', 'primeros')]:
        anchor = next((a for a in anchors if word in a['text'].lower()), None)
        if anchor:
            sections[kind]['page'] = anchor['page'] + 1
    sections['hazards']['page'] = start['page'] + 1
    dates = re.findall(r'(?i)Fecha de (?:versi[oó]n|emisi[oó]n|revisi[oó]n)\s*:?\s*([^\n]{1,70})', text[:3000])
    name_match = re.search(r'filename\*?=(?:UTF-8\x27\x27)?"?([^";]+)', disposition)
    filename = unquote(name_match.group(1)).strip() if name_match else (previous or {}).get('fileName', product + '.pdf')
    record = {'id': ident, 'url': url, 'fileName': filename,
              'processedAt': datetime.now(timezone.utc).date().isoformat(),
              'documentDate': dates[0].strip() if dates else '',
              'sha256': digest, 'sections': sections, 'labelImages': images}
    # A reviewed summary is version-specific. It is not carried across a changed PDF hash.
    pdf.close()
    return ident, record, True

def main():
    source = DATA_PATH.read_text(encoding='utf-8')
    products = read_assignment(source, 'window.HDS_DATA')
    documents = read_assignment(source, 'window.HDS_DOCUMENTS')
    targets = {}
    for product in products:
        if product.get('hdsUrl'):
            ident = drive_id(product['hdsUrl'])
            targets.setdefault(ident, (product['hdsUrl'], product['producto']))
    def task(item):
        ident, (url, product) = item
        return process(ident, url, documents.get(ident), product)
    # Nothing is written unless every linked PDF passes its checks.
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(task, targets.items()))
    updated = sum(changed for _, _, changed in results)
    if not updated:
        print(f'Sin cambios en las {len(targets)} HDS enlazadas.')
        return
    current = {ident: record for ident, record, _ in results}
    output = 'window.HDS_DATA = ' + json.dumps(products, ensure_ascii=False, indent=2) + ';\n'
    output += '\n// Extractos e imágenes del PDF fuente; no se calculan valores NFPA.\nwindow.HDS_DOCUMENTS = ' + json.dumps(current, ensure_ascii=False, separators=(',', ':')) + ';\n'
    temporary = DATA_PATH.with_suffix('.js.tmp')
    temporary.write_text(output, encoding='utf-8')
    temporary.replace(DATA_PATH)
    print(f'{updated} HDS actualizadas. Se conservaron los {len(products)} registros de planta.')

if __name__ == '__main__':
    main()
