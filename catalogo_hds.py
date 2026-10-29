"""Extracción conservadora de PDF: no deduce NFPA, pictogramas ni instrucciones clínicas."""
from __future__ import annotations
import base64,hashlib,json,re,unicodedata
from datetime import datetime,timezone
from pathlib import Path
import fitz
VERSION=4
MAIN=re.compile(r'^\s*(?:(?:SECCI[ÓO]N|SECTION|SE[CÇ][AÃ]O)\s*)?(1[0-6]|[1-9]|XVI|XV|XIV|XIII|XII|XI|IX|VIII|VII|VI|IV|V|III|II|I|X)\s*(?:[.:-]\s*|[ \t]{2,})(?!\d)(.{3,140})$',re.I)
KNOWN=re.compile(r'identific|hazard|peligro|compos|ingredient|primeros|first.aid|socorros|medidas|fighting|release|manejo|manipul|handling|expos|propiedades|physical|estabilidad|stability|toxic|ecol|dispos|elimin|transporte|transport|regulat|reglament|informaci|information',re.I)
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn').lower()
def assignment(source,name):return json.JSONDecoder().raw_decode(source.split(name+' = ',1)[1])[0]
def read_doc(path):
    try:return assignment(path.read_text(),'window.HDS_DOCUMENTS['+json.dumps(path.stem)+']')
    except (ValueError,FileNotFoundError):return None

def doc_kind(name,text,scanned=False):
    n=norm(name);t=re.sub(r'\s+',' ',norm(text[:20000]))
    if re.search(r'acknowledg(?:e)?ment|acknowledgement|acuse de recib|acuse de recep',n):return 'Acuse de recepción'
    if re.search(r'\bpis\b',n) or name.startswith('71994 PIS') or 'master led' in n or 'tubo ecofit' in n:return 'Ficha técnica'
    if re.search(r'hojas? de (?:datos de )?seguridad|ficha de (?:datos de )?seguridad|material safety data sheet|safety data sheet|ficha tecnica y hoja de seguridad',t):return 'HDS'
    if scanned:return 'PDF escaneado'
    return 'Documento por clasificar'

def product_name(name,text):
    # Extract only explicit product-name fields. Otherwise retain the actual filename.
    for line in text[:10000].splitlines():
        m=re.match(r'^\s*(?:Nombre del producto|Nombre comercial|Product name|Nombre del Producto|Nombre de la sustancia)\s*[:：]?\s{1,}(.{2,180})$',line,re.I)
        if m:
            candidate=re.sub(r'\s+',' ',m.group(1)).strip(' :\t')
            if len(candidate)>1 and not re.match(r'^(?:no |cas|ver |pagina|página|secci|identifica)',candidate,re.I):return candidate
    return re.sub(r'\.pdf$','',name,flags=re.I)

def section_kind(title):
    t=norm(title).replace('-',' ')
    if any(w in t for w in ['primeros auxilios','first aid','primeiros socorros','procedimientos de emergencia y primeros']):return 'aid'
    if any(w in t for w in ['composici','composition','composicao','ingredientes','ingredients','componentes']):return 'components'
    if any(w in t for w in ['peligro','hazard','identificacion de los riesgos','identificacion del riesgo']):return 'hazards'
    return None

def extract(binary,meta,previous=None,ocr_pages=None):
    sha=hashlib.sha256(binary).hexdigest()
    if previous and previous.get('sha256')==sha and (previous.get('extractorVersion')==VERSION or previous.get('summary')):
        return {**previous,'folderPath':meta['folderPath'],'areaFolder':meta['areaFolder'],'fileName':meta['title'],'url':meta['url'],'extractorVersion':VERSION}
    pdf=fitz.open(stream=binary,filetype='pdf')
    if pdf.needs_pass:raise ValueError('PDF protegido con contraseña')
    page_text=[page.get_text(sort=True) for page in pdf]; scanned=sum(len(x.strip()) for x in page_text)<100
    native_text='\n'.join(page_text)
    kind=doc_kind(meta['title'],native_text,scanned)
    ocr_text='\n'.join(ocr_pages or []) or (previous.get('ocrText','') if previous and previous.get('sha256')==sha else '')
    # OCR is indexed but never promoted to actionable section fields automatically.
    title=product_name(meta['title'],native_text) if not scanned else re.sub(r'\.pdf$','',meta['title'],flags=re.I)
    anchors=[]
    for pn,page in enumerate(pdf):
        for block in page.get_text('dict')['blocks']:
            lines=block.get('lines',[])
            if len(lines)>=2:
                first=''.join(s['text'] for s in lines[0]['spans']).strip();second=''.join(s['text']for s in lines[1]['spans']).strip()
                split=re.fullmatch(r'(?:SECCI[ÓO]N|SECTION)\s+(1[0-6]|[1-9])',first,re.I)
                if split and KNOWN.search(second):anchors.append({'page':pn,'y':float(lines[0]['bbox'][1]),'title':first+'  '+second,'number':int(split[1]),'kind':section_kind(second)})
            for line in lines:
                text=''.join(s['text'] for s in line['spans']).strip();m=MAIN.match(text)
                if m and KNOWN.search(m[2]):anchors.append({'page':pn,'y':float(line['bbox'][1]),'title':text,'number':int(m[1]) if m[1].isdigit() else {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,'XVI':16}[m[1].upper()],'kind':section_kind(text)})
    anchors.sort(key=lambda a:(a['page'],a['y']))
    # Discard repeated headers at the top of following pages; retain first main heading per numbered section.
    unique=[];seen=set()
    for a in anchors:
        key=(a['number'],a['kind'])
        if key not in seen:unique.append(a);seen.add(key)
    anchors=unique
    sections={};images=[]
    for index,a in enumerate(anchors):
        key=a['kind']
        if not key or key in sections:continue
        end=anchors[index+1] if index+1<len(anchors) else {'page':len(pdf)-1,'y':pdf[-1].rect.height}
        chunks=[]
        for pn in range(a['page'],end['page']+1):
            page=pdf[pn];top=max(0,a['y']-1) if pn==a['page'] else 0;bottom=end['y']-2 if pn==end['page'] else page.rect.height
            if bottom<=top:continue
            text=page.get_text(clip=fitz.Rect(0,top,page.rect.width,bottom),sort=True)
            if pn==a['page'] and a['title'] in text:text=text.split(a['title'],1)[1]
            chunks.append(text)
            if key=='hazards' and len(images)<4:
                pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),clip=fitz.Rect(20,top,page.rect.width-20,bottom))
                images.append({'page':pn+1,'data':'data:image/jpeg;base64,'+base64.b64encode(pix.tobytes('jpeg',jpg_quality=78)).decode()})
        text='\n'.join(chunks).strip()
        if text:sections[key]={'title':a['title'],'page':a['page']+1,'text':text}
    if kind=='Documento por clasificar' and all(k in sections for k in ('hazards','components','aid')):kind='HDS'
    dates=re.findall(r'(?im)(?:Fecha de (?:versi[oó]n|emisi[oó]n|revisi[oó]n)|Revision Date|Revisi[oó]n)\s*[:：]?\s*([^\n]{3,70})',native_text[:8000])
    # One original page is available for scans, acknowledgements and documents with no recognized headings.
    preview=None
    if scanned or kind!='HDS' or not sections:
        pix=pdf[0].get_pixmap(matrix=fitz.Matrix(1.25,1.25));preview='data:image/jpeg;base64,'+base64.b64encode(pix.tobytes('jpeg',jpg_quality=76)).decode()
    rec={'id':meta['id'],'url':meta['url'],'fileName':meta['title'],'productName':title,'sha256':sha,'pages':len(pdf),'documentType':kind,'processedAt':datetime.now(timezone.utc).date().isoformat(),'documentDate':dates[0].strip() if dates else '', 'sections':sections,'labelImages':images,'previewImage':preview,'folderPath':meta['folderPath'],'areaFolder':meta['areaFolder'],'textMethod':'OCR sin validar' if scanned and ocr_text else 'Sin texto seleccionable' if scanned else 'Texto del PDF','ocrText':ocr_text if scanned else '', 'excerpt':native_text[:16000] if kind!='HDS' or not sections else '', 'extractorVersion':VERSION}
    if kind=='HDS':extract_routes(rec)
    pdf.close();return rec

def write_document(root,doc):
    path=root/'hds'/(doc['id']+'.js');path.parent.mkdir(parents=True,exist_ok=True)
    payload='window.HDS_DOCUMENTS = window.HDS_DOCUMENTS || {};\nwindow.HDS_DOCUMENTS['+json.dumps(doc['id'])+'] = '+json.dumps(doc,ensure_ascii=False,separators=(',',':'))+';\n'
    tmp=path.with_suffix('.js.tmp');tmp.write_text(payload,encoding='utf-8');tmp.replace(path)

def make_catalog(root,manifest,documents):
    counts={};hashes={}
    for doc in documents.values():hashes.setdefault(doc['sha256'],[]).append(doc['id'])
    bundle_paths={ident:f'hds/paquete-{n//24+1:02d}.js'for n,ident in enumerate(sorted(documents))}
    bundle_versions={}
    ordered=sorted(documents)
    for offset in range(0,len(ordered),24):
        subset={i:documents[i]for i in ordered[offset:offset+24]}
        name=f'hds/paquete-{offset//24+1:02d}.js'
        bundle_versions[name]=hashlib.sha256(json.dumps(subset,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()[:16]
    items=[]
    for meta in manifest['files']:
        doc=documents.get(meta['id'],{});area=re.sub(r'^HDS\s*','',meta['areaFolder']);counts[area]=counts.get(area,0)+1
        words=' '.join(x.get('text','') for x in doc.get('sections',{}).values())
        terms=' '.join(dict.fromkeys(re.findall(r'\b\d{2,7}-\d{2}-\d\b',words)))
        items.append({'id':meta['id'],'producto':doc.get('productName') or re.sub(r'\.pdf$','',meta['title'],flags=re.I),'area':area,'ubicacion':'Por confirmar con listado maestro','estado':'','clase':'','hdsUrl':meta['url'],'drivePath':meta['folderPath'],'fileName':meta['title'],'documentType':doc.get('documentType','Pendiente de lectura'),'documentDate':doc.get('documentDate',''),'textMethod':doc.get('textMethod','Pendiente de lectura'),'sectionsAvailable':list(doc.get('sections',{})),'hasReviewedSummary':bool(doc.get('summary')),'sha256':doc.get('sha256',''),'duplicateIds':[i for i in hashes.get(doc.get('sha256'),[]) if i!=meta['id']],'searchTerms':' '.join([terms,re.sub(r'\s+',' ',doc.get('sections',{}).get('components',{}).get('text',''))[:6000],re.sub(r'\s+',' ',doc.get('ocrText',''))[:2500]]),'isCatalog':True,'documentFile':bundle_paths.get(meta['id'],''),'documentVersion':bundle_versions.get(bundle_paths.get(meta['id'],''),''),'placements':doc.get('placements',[]),'storageReferences':doc.get('storageReferences',[]),'plantAreas':sorted(set(x['area'] for x in doc.get('placements',[])))})
    info={'rootFolderId':manifest['rootFolderId'],'rootFolderUrl':manifest['rootFolderUrl'],'updatedAt':datetime.now(timezone.utc).date().isoformat(),'inventoryDate':manifest.get('inventoryDate',''),'totalDocuments':len(items),'folders':manifest['folders'],'areas':sorted(set(re.sub(r'^HDS\s*','',f['areaFolder']) for f in manifest['folders'])),'areaCounts':counts,'locationStatus':'Pendiente de contrastar con listado maestro','uniquePdfContents':len(hashes)}
    (root/'catalogo.js').write_text('window.HDS_CATALOG = '+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\nwindow.HDS_CATALOG_INFO = '+json.dumps(info,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    index_path=root/'index.html'
    if index_path.exists():
        html=index_path.read_text(encoding='utf-8');fingerprint=hashlib.sha256((root/'catalogo.js').read_bytes()).hexdigest()[:16]
        html=re.sub(r'catalogo\.js\?v=[^\"]+', 'catalogo.js?v='+fingerprint, html)
        index_path.write_text(html,encoding='utf-8')
    return items,info

ROUTE=re.compile(r'(?:^|\n|(?<=\.)[ \t]+)(?P<label>(?:En caso de\s+|Despu[eé]s de\s+)?(?:contacto\s+(?:con\s+(?:los\s+ojos|la\s+piel)|ocular)|inhalaci[oó]n|ingesti[oó]n)|eye contact|skin contact|inhalation|ingestion)(?:[ \t\n]*[:：][ \t\n]*|[ \t]*\n+[ \t]*|[ \t]{2,})',re.I)
ROUTE_STOP=re.compile(r'(?:\b4\.[23]\s|(?:^|\n)\s*(?:Efectos (?:agudos|retardados)|Principales s[ií]ntomas|Protecci[oó]n de|Notas para|Notas especiales|Most important symptoms|Indication of|Protection of))',re.I)
def extract_routes(doc):
    raw=doc.get('sections',{}).get('aid',{}).get('text','');stop=ROUTE_STOP.search(raw);text=raw[:stop.start()]if stop else raw;matches=list(ROUTE.finditer(text));aid=[];seen=set()
    for i,m in enumerate(matches):
        label=m['label'].lower();route='Ojos'if re.search('ojos|ocular|eye',label)else'Piel'if re.search('piel|skin',label)else'Inhalación'if'inhal'in label else'Ingestión'
        if route in seen:continue
        seen.add(route);end=matches[i+1].start()if i+1<len(matches)else len(text);value=text[m.end():end].strip()
        if not value or len(value)>2500:continue
        if re.search(r'HOJA DE DATOS|FICHA DE DATOS|SDS\s*#|Quick-FDS|Página\s*\d|Page\s*\d|Fecha de revisi|Autoprotecci[oó]n',value,re.I):continue
        aid.append({'route':route,'text':value})
    doc['aidExtracts']=aid;doc['aidExtractsSha256']=doc['sha256']
    return doc

def read_documents(root):
    documents={}
    for path in sorted((root/'hds').glob('paquete-*.js')):
        source=path.read_text(encoding='utf-8');marker='Object.assign(window.HDS_DOCUMENTS, '
        payload=json.JSONDecoder().raw_decode(source.split(marker,1)[1])[0];documents.update(payload)
    return documents

def write_bundles(root,documents):
    ids=sorted(documents);paths={};files={}
    for offset in range(0,len(ids),24):
        name=f'paquete-{offset//24+1:02d}.js';subset={ident:documents[ident]for ident in ids[offset:offset+24]}
        source='window.HDS_DOCUMENTS = window.HDS_DOCUMENTS || {};\nObject.assign(window.HDS_DOCUMENTS, '+json.dumps(subset,ensure_ascii=False,separators=(',',':'))+');\n'
        files[name]=source
        for ident in subset:paths[ident]='hds/'+name
    (root/'hds').mkdir(exist_ok=True)
    for name,source in files.items():
        path=root/'hds'/name;temp=path.with_suffix('.js.tmp');temp.write_text(source,encoding='utf-8');temp.replace(path)
    for path in (root/'hds').glob('paquete-*.js'):
        if path.name not in files:path.unlink()
    return paths
