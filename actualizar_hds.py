"""Relee todos los PDF del inventario de Drive y conserva las fichas ante fallos parciales.
La detección de nuevos archivos requiere actualizar catalogo-drive.json o configurar
GOOGLE_DRIVE_API_KEY para la enumeración opcional de carpetas públicas.
"""
from __future__ import annotations
import argparse,json,os,time,urllib.request,urllib.parse,re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from catalogo_hds import extract,read_documents,write_bundles,make_catalog,assignment,norm
ROOT=Path(__file__).resolve().parents[1]

def discover(previous,key):
    """Google Drive API v3, con paginación. No supone que 100 archivos sean toda la carpeta."""
    root=previous['rootFolderId'];queue=[(root,'','')];folders=[];files=[];seen=set()
    while queue:
        ident,path,area=queue.pop(0)
        if ident in seen:continue
        seen.add(ident);token=None
        while True:
            query={'key':key,'q':f"'{ident}' in parents and trashed = false",'fields':'files(id,name,mimeType,webViewLink),nextPageToken','pageSize':'1000'}
            if token:query['pageToken']=token
            request=urllib.request.Request('https://www.googleapis.com/drive/v3/files?'+urllib.parse.urlencode(query),headers={'User-Agent':'Portal-HDS/2.0'})
            with urllib.request.urlopen(request,timeout=60)as response:page=json.load(response)
            for f in page.get('files',[]):
                if f['mimeType']=='application/vnd.google-apps.folder':
                    child_path=path+'/'+f['name']if path else f['name'];child_area=area or f['name'];queue.append((f['id'],child_path,child_area));folders.append({'id':f['id'],'path':child_path,'areaFolder':child_area})
                elif f['mimeType']=='application/pdf':files.append({'id':f['id'],'title':f['name'],'url':f.get('webViewLink')or'https://drive.google.com/file/d/'+f['id']+'/view','folderId':ident,'folderPath':path or 'Carpeta raíz','areaFolder':area or 'Sin área en carpeta'})
            token=page.get('nextPageToken')
            if not token:break
    if not files:raise ValueError('Drive no devolvió PDF; se conserva el inventario anterior para evitar vaciar el catálogo.')
    from datetime import datetime,timezone
    return {**previous,'inventoryDate':datetime.now(timezone.utc).date().isoformat(),'folders':folders,'files':files}

def download(meta):
    request=urllib.request.Request('https://drive.google.com/uc?'+urllib.parse.urlencode({'export':'download','id':meta['id']}),headers={'User-Agent':'Portal-HDS/2.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request,timeout=70)as response:binary=response.read(40*1024*1024+1)
            if not binary.startswith(b'%PDF'):raise ValueError('Drive no entregó un PDF público. Revisar el acceso por enlace.')
            if len(binary)>40*1024*1024:raise ValueError('PDF mayor a 40 MB; requiere revisión')
            return meta,binary,None
        except Exception as error:
            if attempt==2:return meta,None,str(error)
            time.sleep(attempt+1)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--offline-dir',type=Path);args=parser.parse_args()
    manifest=json.loads((ROOT/'catalogo-drive.json').read_text(encoding='utf-8'));previous=read_documents(ROOT);crosswalk=json.loads((ROOT/'maestro-vinculos.json').read_text(encoding='utf-8')).get('matches',{});failures=[]
    if os.environ.get('GOOGLE_DRIVE_API_KEY')and not args.offline_dir:
        try:manifest=discover(manifest,os.environ['GOOGLE_DRIVE_API_KEY'])
        except Exception as error:failures.append({'phase':'inventory','error':str(error).split('?')[0]});print('::warning::No se actualizó el inventario de carpetas; se mantiene la copia anterior.')
    else:print('Inventario de carpetas: copia de '+manifest.get('inventoryDate','fecha no registrada')+'. Sin GOOGLE_DRIVE_API_KEY no se detectan nuevos archivos automáticamente.')
    master=assignment((ROOT/'data.js').read_text(encoding='utf-8'),'window.HDS_DATA')
    def product_key(value):return re.sub(r'[^a-z0-9]','',norm(value or ''))
    documents={};changed=0
    def offline(meta):
        try:return meta,(args.offline_dir/(meta['id']+'.pdf')).read_bytes(),None
        except Exception as error:return meta,None,str(error)
    # Only network transfer uses threads. PDF parsing remains sequential (PyMuPDF is not thread-safe).
    with ThreadPoolExecutor(max_workers=4)as pool:
        for meta,binary,error in pool.map(offline if args.offline_dir else download,manifest['files']):
            prev=previous.get(meta['id'])
            if error:
                failures.append({'id':meta['id'],'name':meta['title'],'error':error})
                if prev:documents[meta['id']]=prev
                continue
            try:
                doc=extract(binary,meta,prev)
                same_version=bool(prev and prev['sha256']==doc['sha256'])
                if same_version:
                    doc['placements']=prev.get('placements',[]);doc['storageReferences']=prev.get('storageReferences',[])
                else:
                    # New/replaced PDFs do not inherit source-version-specific location matches or summaries.
                    doc['placements']=[];doc['storageReferences']=[]
                    if not prev and meta['id']in crosswalk:
                        doc['placements']=crosswalk[meta['id']].get('placements',[]);doc['storageReferences']=crosswalk[meta['id']].get('storageReferences',[])
                    if doc.get('documentType')=='HDS':
                        exact=[p for p in master if product_key(p['producto'])==product_key(doc.get('productName'))]
                        doc['placements']=[{'producto':p['producto'],'area':p['area'],'ubicacion':p['ubicacion'],'estado':p.get('estado',''),'sheet':p.get('masterSheet','Matriz SUSPEL'),'row':p.get('masterRow'),'method':'Nombre explícito coincide exactamente con el maestro'}for p in exact]
                    changed+=1
                documents[meta['id']]=doc
            except Exception as exc:
                failures.append({'id':meta['id'],'name':meta['title'],'error':str(exc)})
                if prev:documents[meta['id']]=prev
    if not documents:raise RuntimeError('No se pudo conservar ni leer ningún documento; no se publican datos vacíos.')
    for product in master:
        candidates=[d for d in documents.values()if d.get('documentType')=='HDS'and any(p.get('row')==product.get('masterRow')for p in d.get('placements',[]))]
        product['hdsCandidates']=[{'id':d['id'],'name':d['fileName'],'url':d['url'],'date':d.get('documentDate','')}for d in candidates]
        if not product.get('hdsUrl')and len({d['sha256']for d in candidates})==1:product['hdsUrl']=candidates[0]['url']
    (ROOT/'data.js').write_text('window.HDS_DATA = '+json.dumps(master,ensure_ascii=False,indent=2)+';\nwindow.HDS_DOCUMENTS = {};\n',encoding='utf-8')
    write_bundles(ROOT,documents);make_catalog(ROOT,manifest,documents)
    (ROOT/'catalogo-drive.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    status={'catalogued':len(manifest['files']),'readableRecords':len(documents),'changed':changed,'failures':failures,'discoveryEnabled':bool(os.environ.get('GOOGLE_DRIVE_API_KEY'))};(ROOT/'estado-sincronizacion.json').write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f"{len(documents)} documentos conservados o leídos; {changed} versiones nuevas; {len(failures)} incidencias.")
    if failures:print('::warning::Algunos PDF no se actualizaron. Se conservaron sus lecturas anteriores; revisar estado-sincronizacion.json.')
if __name__=='__main__':main()
