# Catálogo completo de Drive y cruce con listado maestro

Actualización: 29/10/2026.

## Alcance real

Se recorrieron 40 carpetas bajo la carpeta de HDS ECSA y se descargaron los 323 PDF encontrados. Ninguna carpeta alcanzó el límite de 100 hijos de la consulta utilizada. No hubo errores de descarga o apertura. Los PDF se conservan individualmente en el catálogo aunque algunos sean copias o versiones del mismo producto: hay 319 contenidos distintos por SHA-256.

Clasificación documental:

| Tipo | Archivos |
|---|---:|
| PDF escaneado | 58 |
| HDS | 223 |
| Acuse de recepción | 33 |
| Ficha técnica | 9 |

No son 323 productos diferentes. Hay documentos de apoyo, HDS en varias versiones y fragmentos escaneados.

## Lectura y presentación

- 223 HDS con apartados reconocidos de peligros, composición y primeros auxilios.
- 58 PDF sin texto seleccionable, correspondientes a 84 páginas: se procesaron con OCR automático y se marcan pendientes de cotejo. El OCR usó el modelo inglés disponible; no se promueve a instrucciones de seguridad verificadas ni se usa para inferir pictogramas o valores.
- 33 acuses de recepción y 9 fichas técnicas se muestran como documentos de apoyo, no como HDS.
- Se conservaron las 26 fichas resumidas y revisadas de la entrega anterior, todas con la misma huella SHA-256 del PDF descargado en esta revisión.
- Se agrupan instrucciones solo cuando existe un encabezado explícito de la vía de contacto. Los fragmentos automáticos se mantienen literalmente y por versión; las vías ambiguas quedan sin completar. Los extractos completos y las imágenes originales siguen disponibles.
- No se calculan NFPA, pictogramas, clasificación o concentraciones a partir de nombres o clases internas.
- Los documentos conservan su idioma original: no se traducen instrucciones de emergencia automáticamente.
- El detalle se carga al abrir cada documento. Se agruparon 323 lecturas en 14 archivos para facilitar la carga web a GitHub y reducir el peso inicial de la página.

## Listado maestro

Fuente: LM-SSO-SEG-003 Listado Maestro de Sustancias Peligrosas(1).xlsx.
Hoja principal utilizada: Matriz SUSPEL. Registros con nombre comercial: 109.
También se consultó Tabla suspel para referencias de zonas de almacenamiento con nombres comerciales explícitos.

- Se conservaron exactamente las áreas, ubicaciones y estados de los 109 registros de la matriz; cada asociación conserva hoja y fila.
- 38 registros tienen HDS principal: los 37 previos y Carter EP 680, identificado expresamente en la sección 1 del PDF cuyo nombre era un UUID.
- Krones Celerol FL7201 tiene cinco archivos candidatos, de varias versiones o regiones; quedan accesibles sin elegir uno automáticamente.
- Los otros 70 registros no tienen una coincidencia exacta validada con una HDS del catálogo.
- 35 PDF tienen referencias a registros de la matriz. 14 PDF tienen referencias explícitas de zonas en la otra hoja. Son 37 documentos con alguna referencia de ubicación; los conjuntos se solapan.
- La carpeta de origen de Drive no se presenta como ubicación física. Las ubicaciones de las dos hojas se muestran por separado y no se fusionan cuando difieren.
- No se sustituyeron FL por LU, CR por HF, productos comerciales por componentes, ni concentraciones distintas por ser nombres parecidos.

Las discrepancias ya marcadas en buffer pH 10 y nitrato de plata siguen señaladas en sus fichas. Esta revisión organiza y coteja fuentes; no certifica la vigencia ni la adecuación clínica de las HDS.

## Sincronización

El script de actualización ahora recorre TODOS los PDF del inventario catalogo-drive.json. Conserva la lectura anterior si un archivo falla, para no interrumpir la publicación de todo el portal por un PDF inaccesible. Cambiar el contenido del PDF invalida su resumen revisado y las asociaciones dependientes de aquella versión.

**Detección de PDF nuevos:** queda preparada mediante Google Drive API v3 con paginación, pero NO está activada porque no se dispone de GOOGLE_DRIVE_API_KEY en GitHub. Sin esa configuración, se actualizan los 323 PDF ya inventariados; no se descubren archivos nuevos solos. La rutina opcional no se ha probado contra una clave real. El inventario también puede renovarse desde la conexión de Drive en una revisión posterior.

La ejecución de sincronización se probó con las 323 copias descargadas (modo offline): cero errores. No se ejecutó en la cuenta de GitHub ni se modificaron permisos de Drive. El acceso a cada PDF se verificó con la conexión de Drive; no se comprobó el acceso público sin iniciar sesión de los 323 enlaces.

## Comprobaciones

- Correspondencia de los 323 identificadores con su archivo y URL fuente: correcta.
- Integridad por SHA-256 y detección de copias: comprobadas.
- Renderizado programático de las 323 fichas documentales y los 109 registros de planta: sin errores y con acceso al PDF correcto cuando está vinculado.
- Cada ubicación mostrada desde la matriz coincide con su fila del Excel.
- Las instrucciones agrupadas automáticamente son fragmentos literales del apartado de primeros auxilios de su propio PDF.
- Navegador: filtros de tipo y carpeta, conservación de Tri-ACT revisado, apertura de Carter y su ubicación, separación de acuses e imagen/OCR de Sprite en pantalla de 390 píxeles.
- No se hizo validación clínica individual de todas las instrucciones ni comparación normativa de vigencia.

## Inventario de los 323 PDF

| Documento | Tipo | Carpeta de origen | Registros en matriz | Referencias de zona |
|---|---|---|---:|---:|
| 68_Desodorante Liquido Arom rev01.pdf | HDS | HDS Servicios Generales | 0 | 0 |
| HDS PINTURA.pdf | HDS | HDS Servicios Generales | 0 | 0 |
| CLOROTEX-E.pdf-1.pdf | HDS | HDS Planta Riles | 0 | 1 |
| DIVOSAN_HYPOCHLORITE_MSDS norma chilena.pdf | HDS | HDS Planta Riles | 4 | 4 |
| HDS Antiespumante.pdf | HDS | HDS Planta Riles | 0 | 0 |
| HDS DQO HACH.pdf | HDS | HDS Planta Riles | 0 | 0 |
| HDS SNF 1000.pdf | HDS | HDS Planta Riles | 0 | 0 |
| HDS Urea.pdf | HDS | HDS Planta Riles | 0 | 0 |
| HDS_HI 93754A-25_10-25.pdf | HDS | HDS Planta Riles | 0 | 0 |
| PEROXIDO DE HIDROGENO 50__HSDS_V04.3.pdf | HDS | HDS Planta Riles | 0 | 0 |
| 12.AFF - 020281 - BETA CAROTENE - SDS SPANISH 04-24-24.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - 059775 - CLOUD EMULSION - SDS SPANISH 03-28-23.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - 094305 - NATURAL FLAVOR ENHANCER 02 - SDS SPANISH 04-20-20.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - B-288 - NATURAL MONSTER FLAVOR TYPE - SDS SPANISH 02-29-24.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - E-059 - NAT & ART FLAVOR ENHANCER - SDS SPANISH 05-09-22.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - E-060 - NATURAL MONSTER FLAVOR ENHANCER - SDS SPANISH 10-29-21.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - E-091 - NATURAL ENHANCER FLAVOR - SDS SPANISH 07-26-22.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - M-351 - ME FLAVOR ENHANCER BR0102 POWDER - SDS SPANISH 10-06-21.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - O-348 - NAT ORANGE CREAM FLAVOR TYPE - SDS SPANISH 02-03-23.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - P-053 - NAT & ART PINEAPPLE ORANGE - SDS SPANISH 02-03-23.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - R-482 - NAT & ART RIPPER FLAVOR - SDS SPANISH 02-17-23.pdf | HDS | HDS Monster | 0 | 0 |
| 12.AFF - T-238 - TROPICAL FLAVOR - SDS SPANISH 02-03-23.pdf | HDS | HDS Monster | 0 | 0 |
| AFF - 020281 - BETA CAROTENE - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - 020301 - BETA CAROTENE - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - 020854 - RUBY RED P.E. - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - 059775 - CLOUD EMULSION - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - 094305 - NATURAL FLAVOR ENHANCER 02 - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - 094311 - NATURAL FLAVOR ENHANCER - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - B-288 - NATURAL MONSTER FLAVOR TYPE - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - C-946 - NATURAL CITRUS FLAVOR TYPE - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - C-1085 - NATURAL CANDY NOTE FLAVOR TYPE - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - C-1108 - CARAMEL COLOR - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - E-059 - NAT & ART FLAVOR ENHANCER - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - E-060 - NATURAL MONSTER FLAVOR ENHANCER - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - L-020 - NAT LEMONADE FLVR TYPE EMUL  - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - L-027 - NATURAL LEMONADE FLAVOR TYPE SDS ACKNOWLEDGEMENT FORM (12.28.2023).pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - M-294 - NATURAL MONSTER FLAVOR ENHANCER - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - M-351 - ME FLAVOR ENHANCER BR102 POWDER - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - O-348 - NATURAL ORANGE CREAM FLAVOR TYPE - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - P-053 - NAT & ART PINEAPPLE ORANGE FLAVOR - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - R-406 - ARTIFICIAL RED COLOR SOLUTION - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - R-482 - NATURAL & ARTIFICIAL RIPPER FLAVOR - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - T-238 - TROPICAL FLAVOR - SDS ACKNOWLEDGMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| AFF - W-010 - NATURAL & ARTIFICIAL WATERMELON FLAVOR - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| ANHUI SEALONG BIOTECHNOLOGY CO., LTD - MALIC ACID - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| DSM - MONSTER CL CORE BLEND - FS12054A25 - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| DSM - MONSTER CL CORE BLEND V.2 FS13513A25 - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| E-091 SDS ACKNOWLEDGEMENT FORM 2023.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| FS12054A25_ES.pdf | HDS | HDS Monster | 0 | 0 |
| G-296 SDS Acknowledgement Form.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - INSTANTIZED BCAA POWDER -SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - RE14209A - ZERO ULTRA CHILE 25KG - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - RE24414A - CHILE ABSOLUTELY ZERO E-BLEND - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - RE28446B - CHILE PORTFOLIO BLEND - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - RE32152A - CHILE REIGN E-BLEND - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| GLANBIA - RE33917A - CHILE PORTFOLIO E BLEND 25KG - SDS ACKNOWLEDGEMENT FORM.pdf | Acuse de recepción | HDS Monster | 0 | 0 |
| 7b8ef864-d178-4d10-b49b-c60e7fc07bd6.pdf | HDS | HDS Mantención | 1 | 0 |
| 8010_SDS_CL_es_Interflon_Fin_Super_Aerosol.pdf | HDS | HDS Mantención | 1 | 0 |
| 8013_SDS_CL_es_Interflon_Fin_Grease_Aerosol.pdf | HDS | HDS Mantención | 1 | 0 |
| 8238_SDS_CL_es_Interflon_Lube_TF_Aerosol.pdf | HDS | HDS Mantención | 0 | 0 |
| 8551_SDS_CL_es_Interflon_Food_Grease_LT2.pdf | HDS | HDS Mantención | 1 | 0 |
| 8600_SDS_CL_es_Interflon_Food_Lube_G150.pdf | HDS | HDS Mantención | 0 | 0 |
| 8887_SDS_CL_es_Interflon_Slide_Wax_Dry_Aerosol.pdf | HDS | HDS Mantención | 0 | 0 |
| 8968_SDS_CL_es_Interflon_Eco_EM100_plus.pdf | HDS | HDS Mantención | 0 | 0 |
| 9174_SDS_CL_es_Interflon_Food_Grease_HD2_Aerosol.pdf | HDS | HDS Mantención | 1 | 0 |
| 24523289-ES-1.pdf | HDS | HDS Mantención | 0 | 0 |
| CASSIDA_FLUID_HF_100_GB_EN_2_3.pdf | HDS | HDS Mantención | 0 | 0 |
| GSAP_msds_02808996.PDF | HDS | HDS Mantención | 0 | 0 |
| HDS MOBIL DTE OIL EXTRA HEAVY.pdf | HDS | HDS Mantención | 0 | 0 |
| hSGJpSCuJkaXNv8KjCT0g.PDF | HDS | HDS Mantención | 0 | 0 |
| IRP-Es-Brochure-FICHA-DE-DATOS-DE-SEGURIDAD (1).pdf | HDS | HDS Mantención | 0 | 0 |
| IRP-Es-Brochure-FICHA-DE-DATOS-DE-SEGURIDAD.pdf | HDS | HDS Mantención | 0 | 0 |
| KRONES celerol FL 7201_760787_ES_ES_V-1.0.2_SDB (1).pdf | HDS | HDS Mantención | 1 | 0 |
| KRONES celerol FL 7201_760787_ES_ES_V-1.0.2_SDB.pdf | HDS | HDS Mantención | 1 | 0 |
| KRONES celerol FL 7201_762451_MX_ES_V-1.0.0_SDB (1).pdf | HDS | HDS Mantención | 1 | 0 |
| KRONES celerol FL 7201_762451_MX_ES_V-1.0.0_SDB (2).pdf | HDS | HDS Mantención | 1 | 0 |
| KRONES celerol FL 7201_762451_MX_ES_V-1.0.0_SDB.pdf | HDS | HDS Mantención | 1 | 0 |
| KRONES celerol FL 7204_767735_GB_EN_V-1.0.1_SDB.pdf | HDS | HDS Mantención | 0 | 0 |
| Master LED tubo (1).pdf | Ficha técnica | HDS Mantención | 0 | 0 |
| MOBIL SHC CIBUS 220.pdf | HDS | HDS Mantención | 0 | 0 |
| MOBIL SHC GEAR 460.pdf | HDS | HDS Mantención | 0 | 0 |
| MOBILGEAR 600 XP 680.pdf | HDS | HDS Mantención | 0 | 0 |
| PYROLUBE 830.pdf | HDS | HDS Mantención | 0 | 0 |
| Tubo Ecofit T8 (1).pdf | Ficha técnica | HDS Mantención | 0 | 0 |
| 3D TRASAR 3DT465_CL.pdf | HDS | HDS Suministros/NALCO | 0 | 2 |
| CL_ES_22310_NexGuard 22310_SDS_167180613.pdf | HDS | HDS Suministros/NALCO | 1 | 0 |
| CL_ES_PC-510T_PermaTreat PC-510T_SDS_167180613.pdf | HDS | HDS Suministros/NALCO | 1 | 1 |
| HDS TRI-ACT 1830.pdf | HDS | HDS Suministros/NALCO | 1 | 2 |
| NALCO® 19 PULV_CL.pdf | HDS | HDS Suministros/NALCO | 2 | 0 |
| NALSPERSE™ 73550_CL.pdf | HDS | HDS Suministros/NALCO | 1 | 2 |
| hds-008---dioxido-carbono-gaseoso-r14.pdf | HDS | HDS Suministros/LINDE | 1 | 0 |
| n2 liquido1.pdf | HDS | HDS Suministros/INDURA AIR PRODUCTS | 1 | 0 |
| HDS-HIDRO-OR50.pdf | HDS | HDS Suministros/HIDROSERVI | 0 | 0 |
| HDS-HIDROCLOR-10.pdf | HDS | HDS Suministros/HIDROSERVI | 0 | 0 |
| HDS-ANTIESPUMANTE-INDUSTRIAL-CONCENTRADO.pdf | HDS | HDS Suministros/EOX SpA | 0 | 0 |
| HDS_ENEX_PETROLEODIESEL_GRADO_A1-A2-B.pdf | HDS | HDS Suministros/ENEX | 0 | 0 |
| HDS Diesel  REV. 23-03-2023.pdf | HDS | HDS Suministros/COPEC | 0 | 0 |
| UREAGRANULADA.pdf | HDS | HDS Suministros/ANAGRA | 1 | 0 |
| V505-D.01ra06f20 (1).pdf | HDS | HDS Mantención/VIDEOJET | 0 | 0 |
| V820-D.01rs06f20 (1).pdf | HDS | HDS Mantención/VIDEOJET | 0 | 0 |
| V901-Q.a95c06f20 (2).pdf | HDS | HDS Mantención/VIDEOJET | 0 | 0 |
| SODIO HIDROXIDO 0,02N V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO HIDROXIDO 0,05N REV.04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO HIDRÓXIDO 1 N REV.04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO TIOSULFATO 0,1 N V2021.pdf | HDS | HDS Laboratorio/WINKLER | 1 | 0 |
| 101360-ALCOHOL-ETILICO-DESNATURALIZADO-TECNICO-95_2024.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| 303875-SODIO-TIOSULFATO-005N_2024.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| 501510-ALMIDON-2_2024.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO CITRICO 1HIDRATO REV04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO CLORHIDRICO 37% Rev.06.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO SULFURICO 0,02N  Rev.04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO SULFURICO 1N V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO SULFURICO 20% V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ACIDO SULFURICO 25% V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ALCOHOL ETILICO 95% PURO V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| Alcohol-Isopropilico-50_99-MSDM-Rev.02.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| ALMIDON 1% Rev.05.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| EDTA SAL DISODICA 0.01M REV.05.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| FE-0805 - FENOLFTALEINA P.A.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| GLICERINA P.A V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| NARANJA DE METILO SOL. 0.1% Rev. 04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| NEGRO ERIOCROMO T 1% EN NaCL Rev.01.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| PLATA NITRATO 0,02N Rev.06.pdf | HDS | HDS Laboratorio/WINKLER | 1 | 0 |
| POTASIO YODURO 10% REV.06.pdf | HDS | HDS Laboratorio/WINKLER | 1 | 0 |
| SODIO ACETATO 3 HIDRATO P.A Rev.04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO BISULFITO P.A. REV.04.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO CLORURO PURIS V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SODIO HIDROXIDO 0,1 N V2021.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| SOLUCIÓN BUFFER PH10  AMONIO REV04.pdf | HDS | HDS Laboratorio/WINKLER | 1 | 0 |
| WK-CL-10-MSDM-Hipoclorito-sodio-al-10-Rev.03.pdf | HDS | HDS Laboratorio/WINKLER | 0 | 0 |
| HDS Test Hierro Método Fotométrico.pdf | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Hidroxilamonio cloruro_Merck.PDF | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Patrón As_merck.PDF | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Test de As_Merck.PDF | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Test de cloro_100597_Merck.PDF | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Test de Hierro_Merck.PDF | HDS | HDS Laboratorio/MERK | 0 | 0 |
| Reactivo Cloro Libre.pdf | HDS | HDS Laboratorio/HANNA | 1 | 0 |
| Reactivo Cloro Total.pdf | HDS | HDS Laboratorio/HANNA | 1 | 0 |
| Solución Buffer pH 4.01.pdf | HDS | HDS Laboratorio/HANNA | 0 | 0 |
| Solución Buffer pH 7.01.pdf | HDS | HDS Laboratorio/HANNA | 0 | 0 |
| Solución Buffer pH 10.01.pdf | HDS | HDS Laboratorio/HANNA | 0 | 0 |
| Solución Estándar Sodio 10 ppm.pdf | HDS | HDS Laboratorio/HANNA | 1 | 0 |
| Solución Estándar Sodio 100 ppm.pdf | HDS | HDS Laboratorio/HANNA | 1 | 0 |
| Solución ISA para SODIO.pdf | HDS | HDS Laboratorio/HANNA | 0 | 0 |
| CL-1X-900863-03-EXELERATE HS-I_2024.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-901302-FOSBRITE.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-901618-TOPAX 18 CH.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-903414-02-TOPAX NEUTRO.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-903786-AIR FRESH SALOON.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-904071-ENDURE 420-56.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-905521-OXONIA ACTIVE 150.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-919060-ULTRASIL 76 (LA).pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-923318-04-VORTEXX.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| CL-1X-993733-TOPAX 66.pdf | HDS | HDS Formulación/ECOLAB | 0 | 0 |
| 71994 PIS-Dilac Z-A4-es-AR HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| 71994 PIS-Divosan Forte-A4-es-AR HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| 71994 PIS-Divosan Hypochlorite-A4-es-AR HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| 71994 PIS-Resource-A4-es-AR HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| 71994 PIS-Super Dilac-A4-es-AR HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| 82518-PIS-Titan 9-A4-es-CL-HRNC.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| MS2100079_CL02_MS_DIVOSANHYPOFOAM_2025.pdf | HDS | HDS Formulación/DIVERSEY | 1 | 3 |
| MS2100141_CL02_MS_RESOURCE_2025.pdf | HDS | HDS Formulación/DIVERSEY | 4 | 5 |
| MS2100141_CL02_MS_RESOURCE.pdf | HDS | HDS Formulación/DIVERSEY | 4 | 5 |
| MS2100170_CL02_MS_SUPERDILAC_2025.pdf | HDS | HDS Formulación/DIVERSEY | 3 | 3 |
| MS2100170_CL02_MS_SUPERDILAC.pdf | HDS | HDS Formulación/DIVERSEY | 3 | 3 |
| MS2100290_CL02_MS_DIVOSANFORTE_2025.pdf | HDS | HDS Formulación/DIVERSEY | 3 | 5 |
| MS2100290_CL02_MS_DIVOSANFORTE.pdf | HDS | HDS Formulación/DIVERSEY | 3 | 5 |
| MS2100302_CL02_MS_DILACZ.pdf | HDS | HDS Formulación/DIVERSEY | 1 | 3 |
| PIS _ DIVOSAN HYPOFOAM CHILE.pdf | Ficha técnica | HDS Formulación/DIVERSEY | 0 | 0 |
| Titan 9_MSDS.PDF | HDS | HDS Formulación/DIVERSEY | 0 | 0 |
| HDS Sprite parte 1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite parte 1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite parte 1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite parte 2.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite parte 2.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite parte 2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite zero parte 1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite zero parte 1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Sprite zero parte 1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Unido Sprite Parte 1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Unido Sprite Parte 2.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| HDS Unido Sprite Zero Parte 1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Sprite | 0 | 0 |
| GAB0010.72P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAB0010.72P2A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAB0010.72P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAB0010.72P03_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAB0010.72P3A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAB0010.721P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAD0010.90P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAD0010.90P2A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAD0010.90P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAD0010.90P3B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| GAD0010.901P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TW40082.00P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TW40082.00P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TW40082.002P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TWD40083.20P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TWD40083.20P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TWD40083.20P03_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| TWD40083.201P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/Schweppes | 0 | 0 |
| (PC) CAFEINA SINTETICA CA 20 KG.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| ACIDO BENZOICO CA 25 KG.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| ÁCIDO CÍTRICO ANHIDRO 30-100 SA.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| BENZOATO DE SODIO SA PL 25 KG.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| CITRATO TRISÓDICO DIHIDRATADO.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| CLORURO DE SODIO.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| EXTRACTO DE CAFEINA NATURAL 99%.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Acesulfame Potasio_v5.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Acido Sorbico_v5.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Citrato Potasio_v5.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Dextrosa Monohidratada_v5 .pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Sorbato de potasio_v5.pdf | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| SDS_Zerose erythritol 16952_EMEA_2023-May-17.PDF | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| SDS000000000000000001300101700004S_SUCRALOSE LIQUID.PDF | HDS | HDS Formulación/HDS Bases de bebida/Monster | 0 | 0 |
| HDS Ginger ale parte 2a.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Ginger ale parte 2a.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Ginger ale parte 2a.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Ginger ale parte 2c.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Ginger ale parte 2c.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Ginger ale parte 2c.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Ginger Ale | 0 | 0 |
| HDS Fanta  parte 1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta  parte 1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta  parte 1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta  parte 2.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta Fantalight Quatrolight.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta Fantalight Quatrolight.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta Fantalight Quatrolight.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta limon parte 2.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta limon parte 2.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta limon parte 2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta parte 2.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Fanta parte 2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Unido  Fanta Limon.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Unido  Fanta Parte 2.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Unido Fanta light.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS Unido Fanta Parte 1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Fanta | 0 | 0 |
| HDS  Unido Coca Cola Light Parte 1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 2a.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 2a.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC light parte 2a.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC parte1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC parte1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC parte1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC zero parte 1.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC zero parte 1.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS CC zero parte 1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS Coca Cola Unido  Light Parte 2.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS Unido  Coca Cola Zero Parte 1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS Unido CC parte1.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Cocacola | 0 | 0 |
| HDS Agua tonica parte 2a.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Agua tonica parte 2a.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Agua tonica parte 2a.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Agua tonica parte 2c.1.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Agua tonica parte 2c.2.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Agua tonica parte 2c.PDF | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Unido Agua Tonica Parte a.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| HDS Unido Agua Tonica Parte c.pdf | PDF escaneado | HDS Formulación/HDS Bases de bebida/Agua tónica | 0 | 0 |
| PAADN0303.50P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P1A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P1D_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P1F_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P1G_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P2B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P03_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.50P3A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAADN0303.501P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña light | 0 | 0 |
| PAABN0074.31P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31P2B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31P2E_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.31PA_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| PAABN0074.311P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Piña | 0 | 0 |
| ORADN1763.50P1A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORADN1763.50P1F_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORADN1763.50P1G_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORADN1763.50P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORADN1763.50P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORADN1763.50P2D_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja light | 0 | 0 |
| ORABN1713.00P1D_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja | 0 | 0 |
| ORABN1713.00P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Naranja | 0 | 0 |
| APB0105.21P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| APB0105.21P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| APB0105.21P1E_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| APB0105.21P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| APB0105.21P2B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| APB0105.211P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Manzana | 0 | 0 |
| KWD0024.50P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Kiwi light | 0 | 0 |
| KWD0024.50P1E_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Kiwi light | 0 | 0 |
| KWD0024.50P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Kiwi light | 0 | 0 |
| KWD0024.50P2D_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Kiwi light | 0 | 0 |
| KWD0024.50P03_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Kiwi light | 0 | 0 |
| STRAD0014.50P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P1A_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P1E_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P1H_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P2B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| STRAD0014.50P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Frutilla light | 0 | 0 |
| PEAB0537.00P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno nf | 0 | 0 |
| PEAB0537.00P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno nf | 0 | 0 |
| PEAB0537.00P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno nf | 0 | 0 |
| PEADN0475.50P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.50P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.50P1E_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.50P1F_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.50P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.50P03_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| PEADN0475.501P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Durazno light | 0 | 0 |
| ACB0063.01P01_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P1C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P1F_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P02_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P2B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P2C_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.01P2F_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |
| ACB0063.011P1B_MTR_CHGH_ES.pdf | HDS | HDS Formulación/HDS Bases de bebida/ADV Damasco | 0 | 0 |

## Cruce de los 109 registros de planta

| Fila en matriz | Producto | Área | Ubicación | Vinculación |
|---:|---|---|---|---|
| 2 | Solvelec L | Mantención | Taller de mantención | Pendiente de coincidencia exacta |
| 3 | Super Convention | Mantención | Taller de mantención | Pendiente de coincidencia exacta |
| 4 | Resource | Suministros | Sala de Aguas | HDS vinculada |
| 5 | Nalco PC-510T | Suministros | Sala de Aguas | HDS vinculada |
| 6 | Divosan Hypochlorite | Suministros | Sala de Aguas | HDS vinculada |
| 7 | NexGuard 22310 | Suministros | Calderas | HDS vinculada |
| 8 | Tri-ACT 1830 | Suministros | Calderas | HDS vinculada |
| 9 | Nalco 7330 | Suministros | Calderas | Pendiente de coincidencia exacta |
| 10 | Nalco 2584 | Suministros | Calderas | Pendiente de coincidencia exacta |
| 11 | Nalco 2584 | Suministros | Calderas | Pendiente de coincidencia exacta |
| 12 | Nalsperse 73550 | Suministros | Calderas | HDS vinculada |
| 13 | Nalco 19 Pulv | Suministros | Calderas | HDS vinculada |
| 14 | Nalco 19 Pulv | Suministros | Calderas | HDS vinculada |
| 15 | Divosan Hypochlorite | Suministros | Calle Inamar | HDS vinculada |
| 16 | Dioxido de Carbono | Suministros | Calle principal | HDS vinculada |
| 17 | Nitrogeno gaseoso | Suministros | Calle Inamar | Pendiente de coincidencia exacta |
| 18 | Nitrogeno líquido Refrigerado | Suministros | Calle Inamar | HDS vinculada |
| 19 | Super Dilac | Formulación | Calle Inamar | HDS vinculada |
| 20 | Resource | Formulación | Calle Inamar | HDS vinculada |
| 21 | Divosan Forte | Formulación | Calle Inamar | HDS vinculada |
| 22 | Resource | Producción | Calle Inamar | HDS vinculada |
| 23 | Divosan Hypochlorite | Producción | Calle Inamar | HDS vinculada |
| 24 | Lujob | Producción | Calle Inamar | Pendiente de coincidencia exacta |
| 25 | Super Dilac | Producción | Calle Inamar | HDS vinculada |
| 26 | Dry Tech 7 | Producción | Calle Inamar | Pendiente de coincidencia exacta |
| 27 | Hypofoam | Producción Linea 1 | Central de dilución | HDS vinculada |
| 28 | Dilac Z | Producción Linea 1 | Central de dilución | HDS vinculada |
| 29 | Divosan Forte | Producción Linea 1 | Central de dilución | HDS vinculada |
| 30 | Titan 500 | Producción Linea 1 | Central de dilución | Pendiente de coincidencia exacta |
| 31 | Lujob | Producción Linea 1 | Central de dilución | Pendiente de coincidencia exacta |
| 32 | Dry Tech 7 | Producción Linea 1 | Central de dilución | Pendiente de coincidencia exacta |
| 33 | Dry Tech 7 | Producción Linea 2 | Paletizadora | Pendiente de coincidencia exacta |
| 34 | Divosan Forte | Producción Linea Apet | Entrelineas | HDS vinculada |
| 35 | Super Dilac | Producción Linea Apet | Entrelineas | HDS vinculada |
| 36 | Resource | Producción Linea Apet | Entrelineas | HDS vinculada |
| 37 | Floculante Gysfloc | Suministros | Riles | Pendiente de coincidencia exacta |
| 38 | Urea Granulada | Suministros | Riles | HDS vinculada |
| 39 | Antifoam Nu tech | Suministros | Riles | Pendiente de coincidencia exacta |
| 40 | Divosan Hypochlorite | Suministros | Riles | HDS vinculada |
| 41 | Interflon Food Grease LT 2 | Mantención | Bodega de lubricantes | HDS vinculada |
| 42 | Melt o Clean | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 43 | Klüberoil 4 UH1-68N | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 44 | Klüberfood 4 NH1- 32...100 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 45 | Interflon Degreaser EM30+ | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 46 | Interflon Fin Lube HT SF4 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 47 | Solvelec L | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 48 | Super Convention | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 49 | Interflon Fin Grease (aerosol) | Mantención | Bodega de lubricantes | HDS vinculada |
| 50 | Interflon Fin Super Aerosols | Mantención | Bodega de lubricantes | HDS vinculada |
| 51 | Interflon Food Lube Aerosols | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 52 | Krones Celerol SP7401 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 53 | Mobilux EP 1 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 54 | Shell Morlina S2 B | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 55 | Mobil Unirex N2 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 56 | Mobilux EP 2 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 57 | Mobil Glygoyl 320 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 58 | Carter EP 680 | Mantención | Bodega de lubricantes | HDS vinculada |
| 59 | Cassida Fluid CR 100 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 60 | KHS Multi Grease 01 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 61 | Mobil Delvac 1330 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 62 | Krones Celerol FL7201 | Mantención | Bodega de lubricantes | 5 versiones candidatas |
| 63 | KHS Pressure Fluid 12 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 64 | Krones Celerol L 7007 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 65 | KHS Pressure Fluid 15 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 66 | Krones Celerol LU 7604 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 67 | Krones Celerol LU 7610 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 68 | Krones Celerol LU 7603 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 69 | Krones Celerol L7009 | Mantención | Bodega de lubricantes | Pendiente de coincidencia exacta |
| 70 | Interflon Food Grease HD2 (aerosol) | Mantención | Bodega de lubricantes | HDS vinculada |
| 97 | Kit aluminio | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 98 | Kit de Fierro | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 99 | Kit de hierro | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 100 | Kit de Sulfato | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 101 | Metanol | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 102 | Molibdato de Amonio 4 hidratado | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 103 | Molibdato de Amonio 7% | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 104 | Murexida | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 105 | Naranja de metilo | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 106 | Negro de EriocromoT T | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 107 | Nitrato de Plata 0,02 N | Calidad | Laboratorio Apet | HDS vinculada |
| 108 | Permanganato de Potasio 0,1 N | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 109 | Reactivo T1 | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 110 | Reactivo Z2 | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 111 | Solución Buffer pH 10 amonio | Calidad | Laboratorio Apet | HDS vinculada |
| 112 | Solución de acondicionamiento, Test de Sodio | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 113 | Solucion de almacenamiento electrodo pH | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 114 | Solución de almacenamiento, Test de Sodio | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 115 | Solución de limpieza de electrodos | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 116 | Solucion de relleno electrodo pH | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 117 | Solución estándar arsénico | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 118 | Solución estándar de fosfato | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 119 | Standard sodio 10 ppm | Calidad | Laboratorio Apet | HDS vinculada |
| 120 | Standard sodio 100 ppm | Calidad | Laboratorio Apet | HDS vinculada |
| 121 | Test de Cloro libre, Colorimetría | Calidad | Laboratorio Apet | HDS vinculada |
| 122 | Test de Cloro total, Colorimetría | Calidad | Laboratorio Apet | HDS vinculada |
| 123 | Test de Ozono | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 124 | Tiosulfato de sodio 0,1 N | Calidad | Laboratorio Apet | HDS vinculada |
| 125 | Tiosulfato de Sodio 5 Hidrato | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 126 | Yoduro de Potasio 10% | Calidad | Laboratorio Apet | HDS vinculada |
| 127 | Solución Fenoltaleina 2% | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 128 | Solución Naranja Metilo 1% | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 129 | Sol. Negro eriocromo T 0,5 en etanol | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 130 | Solución Cromato de Potasio 5% | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 131 | Solución de relleno electrodo pH 500 mL | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 132 | Solución ácida molibdato de amonio | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 133 | Solución Sodio Acetato | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 134 | Electrodo con protector plástico para pH | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 135 | Cafeina Anhidra | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
| 136 | HIDROQUINONA PURIFICADA | Calidad | Laboratorio Apet | Pendiente de coincidencia exacta |
