# Proyect Platform — Arquitectura Completa

> Documento generado el 2026-05-28. Análisis exhaustivo del sistema de principio a fin.

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Monorepo](#3-estructura-del-monorepo)
4. [Backend (FastAPI + LangChain)](#4-backend)
   - 4.1 [Capa API (Routers)](#41-capa-api-routers)
   - 4.2 [Motor de Cálculo (Engine)](#42-motor-de-cálculo-engine)
   - 4.3 [Agente Conversacional (Agent)](#43-agente-conversacional-agent)
   - 4.4 [Herramientas del Agente (Tools)](#44-herramientas-del-agente-tools)
   - 4.5 [Autenticación y Multi-Tenancy](#45-autenticación-y-multi-tenancy)
5. [Frontend (Next.js 14)](#5-frontend)
   - 5.1 [Routing y Layouts](#51-routing-y-layouts)
   - 5.2 [Componentes Principales](#52-componentes-principales)
   - 5.3 [Estado y Data Fetching](#53-estado-y-data-fetching)
   - 5.4 [Modo Presentación y Podcast](#54-modo-presentación-y-podcast)
   - 5.5 [Panel Admin](#55-panel-admin)
   - 5.6 [Theming y Accesibilidad](#56-theming-y-accesibilidad)
6. [Capa Semántica (Schemas)](#6-capa-semántica)
7. [Base de Datos (Supabase/PostgreSQL)](#7-base-de-datos)
8. [Infraestructura y Deploy](#8-infraestructura-y-deploy)
9. [Nota: Módulo Operacional](#9-nota-módulo-operacional)
10. [Flujos de Datos End-to-End](#10-flujos-de-datos-end-to-end)
11. [Patrones de Arquitectura Clave](#11-patrones-de-arquitectura-clave)
12. [Testing](#12-testing)
13. [Variables de Entorno](#13-variables-de-entorno)

---

## 1. Visión General

Proyect Platform es una **plataforma multi-tenant de analítica financiera** con IA conversacional. Permite a empresas visualizar estados de resultados, ratios financieros, dashboards con KPIs, y conversar con un agente LLM que calcula métricas en tiempo real.

**Qué hace:**
- Dashboard ejecutivo con KPIs, waterfall EBITDA, evolutivo mensual e insights IA
- Estado de Resultados (EERR) con comparativo año anterior, presupuesto y evolutivo
- Chat IA financiero (agente LangChain + Gemini) que calcula ratios bajo demanda
- Modo presentación fullscreen con slides generados por IA y podcast narrado
- Panel admin para gestión de tenants, usuarios, roles, módulos y capa semántica

**Arquitectura en una línea:**
```
Next.js 14 ←→ FastAPI + LangChain Agent ←→ Supabase (auth + metadata) + BigQuery (datos financieros)
```

**Deploy de referencia:** VM en GCP con Nginx + systemd (ver §8) — detalles de host/dominio de la infraestructura original no forman parte de esta versión pública.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js (App Router) + TypeScript | 14 |
| **UI** | Tailwind CSS + Radix UI + Recharts | 3.4 / latest |
| **State** | TanStack React Query | 5 |
| **Backend** | FastAPI + Uvicorn | 0.110+ |
| **Agente IA** | LangChain + Google Gemini | langchain-google-genai 4.1+ |
| **Auth** | Supabase Auth (JWT) | 2.3+ |
| **DB Metadata** | Supabase PostgreSQL (schema `platform`) | — |
| **DB Financiera** | BigQuery → cache Parquet local | — |
| **ORM** | SQLAlchemy 2.0 + psycopg2 | 2.0+ |
| **Validación** | Pydantic 2 + JSON Schema | 2.0+ |
| **Proxy** | Nginx (Docker) + Certbot SSL | Alpine |
| **CI/CD** | GitHub Actions → SSH deploy | — |
| **Runtime** | Python 3.11 / Node.js 20 | — |

---

## 3. Estructura del Monorepo

```
proyect-platform/
├── backend/
│   ├── src/
│   │   ├── motor/                    # Paquete principal
│   │   │   ├── api/                  # Routers FastAPI
│   │   │   │   ├── rest.py           # App principal + registro de routers
│   │   │   │   ├── financiero/       # Dashboard, EERR, ratios, deck, podcast
│   │   │   │   ├── chat/             # Conversaciones + sugerencias
│   │   │   │   ├── admin/            # CRUD tenants, users, semantic, modules
│   │   │   │   ├── shell/            # /me + sidebar
│   │   │   │   └── webhooks.py       # Integraciones externas
│   │   │   ├── engine/               # Cálculo puro (sin LLM)
│   │   │   │   ├── config_loader.py  # Carga y valida capa semántica
│   │   │   │   ├── dal.py            # Data Access Layer (BQ/Parquet/SQL)
│   │   │   │   ├── cache.py          # Cache TTL en memoria
│   │   │   │   ├── ratio_engine.py   # Motor de cálculo de ratios
│   │   │   │   ├── connection.py     # Singleton SQLAlchemy
│   │   │   │   ├── formatter.py      # Formato numérico/fechas
│   │   │   │   ├── narrative.py      # Narrativas template-based
│   │   │   │   └── semantic_backend.py  # Interfaz abstracta FS/DB/Dual
│   │   │   ├── agent/                # Agente conversacional
│   │   │   │   ├── factory.py        # Singleton AgentExecutor compartido
│   │   │   │   ├── runtime.py        # run_turn_async + timeout
│   │   │   │   ├── tenant_context.py # ContextVar aislamiento tenant
│   │   │   │   ├── tenant_guard.py   # Validación cruzada en tools
│   │   │   │   ├── session_memory.py # Memoria conversacional (40 msgs)
│   │   │   │   ├── *_session_backend.py  # Memory/DB/Dual persistence
│   │   │   │   ├── llm_factory.py    # Provider Gemini
│   │   │   │   ├── deck_narrative.py # Generación slides presentación
│   │   │   │   └── podcast_script.py # Script podcast narrado
│   │   │   └── tools/                # Herramientas invocables por LLM
│   │   │       ├── ratios.py         # calcular_ratio_financiero
│   │   │       ├── calculator.py     # Calculadora Decimal
│   │   │       ├── plan_cuentas.py   # Inspección plan de cuentas
│   │   │       └── visualization.py  # Render gráficos para frontend
│   │   └── platform_auth/           # Middleware JWT + control acceso
│   │       ├── middleware.py         # Validación JWT (Supabase / HS256)
│   │       └── access.py            # user_has_tenant_access + cache
│   ├── tests/                        # 30+ archivos pytest
│   ├── scripts/                      # Utilidades (bench, export, diagnose)
│   ├── cache/                        # Parquets cacheados por tenant
│   └── secrets/                      # Service accounts (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── layout.tsx            # Root layout + providers
│   │   │   ├── (auth)/login/         # Página de login
│   │   │   ├── auth/callback/        # OAuth callback
│   │   │   ├── [tenant]/             # Rutas dinámicas por tenant
│   │   │   │   ├── layout.tsx        # Sidebar + Header
│   │   │   │   └── [module]/[view]/  # Vista dinámica
│   │   │   └── admin/                # Panel administración
│   │   ├── components/               # Componentes React
│   │   │   ├── charts/               # KPI cards, waterfall, evolutivo
│   │   │   ├── chat/                 # Panel chat IA
│   │   │   ├── financial/            # EERR, dashboard
│   │   │   ├── presentation/         # Modo presentación (9 slides)
│   │   │   ├── admin/                # UI admin
│   │   │   ├── layout/               # Header, Sidebar, Theme
│   │   │   └── ui/                   # Primitivos Radix
│   │   ├── hooks/                    # Custom hooks
│   │   ├── lib/
│   │   │   ├── api/                  # Cliente API (server + browser)
│   │   │   ├── queries/              # React Query hooks
│   │   │   └── supabase/             # Cliente Supabase (server/browser)
│   │   └── middleware.ts             # Auth redirect + session refresh
│   └── package.json
│
├── schemas/
│   ├── shared/                       # Esquemas JSON oficiales
│   │   ├── chart_of_accounts.schema.json
│   │   ├── ratios_logic.schema.json
│   │   ├── kpi_definitions.schema.json
│   │   ├── categorias.json
│   │   ├── familias_semanticas.json
│   │   ├── catalogo_oficial.json
│   │   └── catalogo_oficial_operacional.json
│   └── clients/<tenant>/            # Specs por tenant (tenant demo en esta versión pública)
│
├── supabase/migrations/              # Migraciones SQL versionadas (ver §7)
├── docker/                           # Nginx + Certbot (docker-compose)
├── .github/workflows/deploy.yml      # CI/CD GitHub Actions
└── scripts/deploy.sh                 # Script de deploy inteligente
```

---

## 4. Backend

### 4.1 Capa API (Routers)

El punto de entrada es `motor.api.rest`, que crea la app FastAPI y registra todos los routers.

**Middlewares globales:**
- CORS configurable via `MOTOR_CORS_ORIGINS`
- Timing middleware (`X-Response-Time-Ms` header)
- Mapeo automático de excepciones de dominio a HTTP:
  - `SemanticNotFoundError` → 404
  - `ParquetNotReadyError` → 503
- Lifespan hook para pre-warming de cache al startup

**Tabla de routers:**

| Prefijo | Router | Función |
|---------|--------|---------|
| `/tenants/{t}/dashboard/` | `financiero/dashboard.py` | KPIs, waterfall, evolutivo, insights |
| `/tenants/{t}/eerr` | `financiero/eerr.py` | Estado de Resultados |
| `/tenants/{t}/eerr/export` | `financiero/eerr_export.py` | Export Excel/PDF |
| `/tenants/{t}/ratios/` | `financiero/ratios_extra.py` | Endpoints de ratios adicionales |
| `/tenants/{t}/ratios/explain` | `financiero/ratios_explain.py` | Narrativas de ratios (sin LLM) |
| `/tenants/{t}/dashboard/deck-narrative-sse` | `financiero/deck.py` | Stream SSE para presentación |
| `/tenants/{t}/podcast/` | `financiero/podcast.py` | Audio generado (edge-tts) |
| `/tenants/{t}/search` | `financiero/search.py` | Búsqueda full-text |
| `/tenants/{t}/conversations` | `chat/conversations.py` | CRUD conversaciones |
| `/tenants/{t}/chat/suggestions` | `chat/chat_suggestions.py` | Sugerencias typeahead |
| `/me/*` | `shell/me_and_sidebar.py` | Info usuario + sidebar |
| `/admin/tenants/` | `admin/admin_tenants_crud.py` | CRUD tenants |
| `/admin/users/` | `admin/admin_users.py` | Gestión usuarios |
| `/admin/tenants/{t}/semantic/` | `admin/admin_semantic.py` | Publicación capa semántica |
| `/admin/tenants/{t}/modules/` | `admin/admin_modules.py` | Activación módulos |
| `/admin/audit/` | `admin/admin_audit.py` | Log de auditoría |

### 4.2 Motor de Cálculo (Engine)

El engine es la capa de cálculo puro — **sin LLM**, sin HTTP. Procesa datos financieros y devuelve resultados estructurados.

#### ConfigLoader (Capa Semántica)
- **Singleton** que carga specs JSON por tenant
- Valida contra JSON Schemas en `schemas/shared/*.schema.json`
- Tres backends intercambiables:
  - `FileSystemSemanticLoader` → lee de `schemas/clients/<tenant>/`
  - `DbSemanticLoader` → lee de `platform.semantic_layer_versions`
  - `DualSemanticLoader` → DB primario + FS fallback
- Controlado por `MOTOR_SEMANTIC_SOURCE` (fs | db | dual)
- Cachea `ClientConfig` por (tenant, módulo)

**ClientConfig contiene:**
- `indicadores`: definiciones de ratios con fórmulas
- `cuentas`: mapeo plan de cuentas
- `cuentas_derivadas`: cuentas calculadas
- `eerr_layout`: estructura del Estado de Resultados
- `waterfall_ebitda`: cascada EBITDA
- `nota_cliente`: contexto de negocio para el agente IA

#### DAL (Data Access Layer)
Función principal: `fetch_monthly_movements(cliente, cuentas, fecha_inicio, fecha_fin, ...)`

**Resolución de fuente de datos (por prioridad):**
1. `platform.data_sources` → tipo `bigquery` → cache parquet local → fallback BQ directo
2. `platform.data_sources` → tipo `parquet_local` → ruta configurada
3. Env var legacy `MOTOR_PARQUET_<CLIENTE>`
4. SQL fallback: `SELECT FROM public.movimientos_contables`

**Procesamiento:**
- Mapeo de columnas físicas → canónicas por tenant
- Inversión de signo para cuentas de naturaleza crédito
- Cache en memoria con invalidación por mtime del parquet
- Modo estricto: `MOTOR_REQUIRE_PARQUET=1` → 503 si falta parquet

#### Cache
- TTL en memoria (default 300s), thread-safe con RLock
- LRU eviction (max 2048 entries)
- CacheKey: `(cliente, ratio, fecha_inicio, fecha_fin, empresas, cc, tipo_valor, scope)`
- Scopes separados: `dashboard_card`, `ratio_full`, `default`
- Invalidación por cliente: `invalidate_cliente(tenant)` tras refresh de datos
- Índice invertido `cliente → set[digests]` para O(1) invalidation

#### RatioEngine
- Evalúa `formula_logica` de cada indicador con safe-eval (whitelist: abs, min, max, round)
- Métodos: `calcular_total()`, `calcular_mensual()`, `calcular_total_agregado()`
- Soporta fórmulas encadenadas (un ratio puede depender de otro)

### 4.3 Agente Conversacional (Agent)

#### Patrón Shared Executor
- **Un solo `AgentExecutor`** para todo el proceso (singleton)
- No crece en memoria por cantidad de tenants
- El contexto del tenant se inyecta por turno via system prompt dinámico

#### Runtime (`run_turn_async`)
```python
result = await run_turn_async(
    cliente="demo",
    message="¿Cuál es el margen operacional?",
    session=session,
    timeout_s=180
)
# → {"output": "El margen...", "tool_calls": [...], "latency_ms": 1234}
```

- Hard timeout con `asyncio.wait_for()`
- En timeout: persiste mensaje de aviso y retorna `error="timeout"`
- System prompt renderizado por tenant (incluye indicadores activos, contexto, herramientas)

#### Memoria de Sesión
- Interfaz abstracta `SessionBackend` con 3 implementaciones:
  - `MemorySessionBackend` → dict en memoria (dev/tests)
  - `DbSessionBackend` → tabla `platform.agent_messages`
  - `DualSessionBackend` → memoria + DB fallback
- Cap de 40 mensajes por conversación
- Persiste: user + assistant messages + metadata (tokens, latency, tool_calls)

#### Aislamiento de Tenant
- `ContextVar` `_current_tenant` seteado por `tenant_context(tenant)` context manager
- Cada tool valida con `assert_tenant_matches(claimed_tenant)` antes de acceder datos
- En mismatch: audit log + `TenantMismatchError` → el LLM puede reintentar con tenant correcto
- **Imposible** filtración cross-tenant incluso con invocaciones maliciosas del LLM

### 4.4 Herramientas del Agente (Tools)

| Tool | Función | Input Principal |
|------|---------|----------------|
| `calcular_ratio_financiero` | Calcula cualquier ratio definido en la capa semántica | tenant, ratio, fechas, empresas |
| `CalculadoraFinanciera` | Aritmética de alta precisión (Decimal) | expresión matemática |
| `inspeccionar_plan_cuentas` | Drill-down del plan de cuentas | tenant, cuenta, modo (estructura/apertura/auto) |
| `render_visualization` | Genera payload de gráfico para frontend | tenant, tipo (kpi_card/line/donut/bar/table), data |

**Fuzzy matching:** Si el usuario pide un ratio que no existe, sugiere nombres similares.

**Tipos de visualización:**
- `kpi_card`: valor único + delta
- `evolutivo_line`: serie temporal (1-2 series)
- `composition_donut`: breakdown porcentual
- `composition_bar`: ranking horizontal
- `table`: datos tabulares

### 4.5 Autenticación y Multi-Tenancy

**Flujo de autenticación (3 capas de defensa):**

```
[Request con JWT] 
  → Capa 1: middleware.py valida JWT (Supabase o HS256 legacy)
    → Capa 2: access.py verifica tenant access (staff bypass / JWT / cache / DB)
      → Capa 3: tenant_guard.py valida en cada tool call del agente
```

**AuthContext (extraído del JWT):**
```python
@dataclass(frozen=True)
class AuthContext:
    user_id: str              # auth.uid()
    email: str
    tenant_code: Optional[str]  # app_metadata.tenant_code
    is_platform_staff: bool      # acceso global
    roles: List[str]            # roles en el tenant activo
```

**Verificación de acceso (`user_has_tenant_access`):**
1. Staff bypass → siempre true
2. JWT tenant_code match → rápido (sin DB)
3. Cache en memoria (60s TTL)
4. Query DB `platform.user_tenant_roles`
5. Default: deny

---

## 5. Frontend

### 5.1 Routing y Layouts

**Rutas públicas:**
- `/login` → formulario email + password (Supabase Auth)
- `/auth/callback` → OAuth callback handler
- `/` → redirect al primer tenant accesible

**Rutas protegidas (requieren JWT):**
- `/{tenant}/[module]/[view]` → vistas dinámicas del dashboard
  - `/{tenant}/financiero/resumen` → Dashboard ejecutivo
  - `/{tenant}/financiero/eerr` → Estado de Resultados
  - `/{tenant}/financiero/chat` → Chat IA
- `/admin/*` → Panel admin (requiere `is_platform_staff` o rol admin)

**Flujo de navegación:**
1. **Middleware** (`middleware.ts`): refresca sesión Supabase, redirige no-autenticados a `/login`
2. **[tenant] Layout**: valida acceso al tenant, carga sidebar con módulos
3. **[module]/[view] Page**: renderiza componente correspondiente

### 5.2 Componentes Principales

**Árbol de componentes (Dashboard Ejecutivo):**
```
<RootLayout>
  <ThemeProvider>
  <PresentationModeProvider>
  <TextSizeProvider>
  <QueryProvider>
  <GlobalSearchProvider>
    <TenantLayout>
      <Header />             ← tenant switcher, admin link, sign out
      <Sidebar />            ← módulos, ticker EERR, appearance
      <main>
        <DashboardClient>
          <DashboardFilters />     ← year/month/company dropdowns
          <InsightCards />         ← insights generados por IA
          <KPICardWithDialog />[]  ← grid de KPIs con sparklines
          <EvolutivoCombo />       ← gráfico líneas mensual
          <WaterfallEBITDA />      ← cascada waterfall
          <PodcastCard />          ← narración IA
          <PresentationDeck />     ← modo fullscreen
        </DashboardClient>
      </main>
    </TenantLayout>
```

**Estado de Resultados (EERR):**
```
<EerrView>
  <DashboardFilters />
  <ModeSelector />       ← Resumen / vs Año Anterior / vs Presupuesto / Evolutivo
  <CompactToggle />
  <EerrExportMenu />     ← download XLSX
  <EerrTable />           ← tabla principal
  <EerrEvolutivoTable />  ← tabla pivotada mensual (si modo = evolutivo)
```

**Chat IA:**
```
<ChatPanel>
  <ConversationList />        ← sidebar colapsable
  <ChatArea>
    <ChatMessage />[]         ← historial
    <InputForm />             ← input + send
    <ChatSuggestions />
  </ChatArea>
  <ChatVisualizationCanvas /> ← panel derecho con gráficos extraídos
```

### 5.3 Estado y Data Fetching

**Sin store centralizado** — React Query + localStorage es suficiente.

**Patrón de queries (Dashboard):**
- 4 queries paralelas: `useDashboardCards()`, `useDashboardWaterfall()`, `useDashboardEvolutivo()`, `useDashboardInsights()`
- **Snapshot pattern**: no renderiza hasta que las 4 completen → evita "chart flickering"
- staleTime: 5min, gcTime: 30min

**Filtros en URL (source of truth):**
- `year=YYYY`, `month=MM` → periodo
- `empresas=A,B,C` → empresas seleccionadas
- `excluir=1` → excluir mes actual
- Normalizados via `resolveFilters()` para compartir cache entre combinaciones equivalentes

**API Client dual:**
- `apiFetch()` → Server Components (inyecta JWT desde cookies)
- `apiFetchBrowser()` → Client Components (inyecta JWT desde Supabase browser client)
- `apiFetchCached()` → deduplicación por request via `React.cache()`

### 5.4 Modo Presentación y Podcast

**Flujo:**
1. Usuario presiona botón "Presentación" o `Shift+Cmd/Ctrl+P`
2. Entra fullscreen via `usePresentationMode().enter()`
3. Abre stream SSE a `/tenants/{t}/dashboard/deck-narrative-sse`
4. Renderiza slides dinámicamente conforme llegan secciones:
   - CoverSlide, TldrSlide, KpiSlide, WaterfallSlide, EvolutivoSlide, ComparativaSlide, QnaSlide, ClosingSlide
5. Audio podcast (MP3 vía edge-tts) con playback karaoke word-by-word
6. Navegación: flechas, Escape para salir
7. Auto-hide cursor tras 2.4s de inactividad

### 5.5 Panel Admin

Accesible en `/admin/*` para `is_platform_staff` o roles admin.

**Secciones:**
- **Tenants**: CRUD (create, update, status: active/onboarding/suspended/archived)
- **Users**: invitaciones por email, listado, asignación de roles
- **Modules**: activación/desactivación por tenant
- **Semantic Layer**: editor Monaco con validación JSON Schema, publicación atómica, historial de versiones, rollback
- **Agent Profiles**: configuración de perfiles del agente
- **Audit Log**: trail de auditoría
- **Feature Flags**: toggles de funcionalidades

### 5.6 Theming y Accesibilidad

- **Dark mode**: toggle via ThemeProvider, CSS custom properties
- **Text zoom (A+/A-)**: TextSizeProvider con `data-text-scale` en `<html>`
- **Variables CSS**: `--bg-*`, `--fg-*`, `--accent-*`, `--semaforo-*` (excelente/bueno/alerta/critico), `--chart-*`
- **Keyboard**: Radix UI maneja navegación, modal focus trap, Command palette (Cmd+K)
- **Dynamic imports**: charts cargados on-demand con Suspense + skeleton loaders

---

## 6. Capa Semántica

La capa semántica es el **contrato** entre la data financiera cruda y la presentación. Define qué ratios existen, cómo se calculan, y cómo se muestran.

### Esquemas JSON (en `schemas/shared/`)

| Archivo | Propósito | Versión |
|---------|-----------|---------|
| `chart_of_accounts.schema.json` | Plan de cuentas con metadata UI/LLM | v3 |
| `ratios_logic.schema.json` | Definiciones de indicadores financieros | v3 |
| `kpi_definitions.schema.json` | KPIs operacionales (inventario, compras) | v1 |
| `categorias.json` | Taxonomía financiera (5 categorías) | — |
| `familias_semanticas.json` | 9 familias operacionales | — |
| `catalogo_oficial.json` | Catálogo maestro de ratios financieros | — |
| `catalogo_oficial_operacional.json` | 29 indicadores operacionales | — |

### Estructura de un Indicador Financiero
```json
{
  "id_canonico": "margen_bruto",
  "etiqueta_display": "Margen Bruto",
  "categoria": "rentabilidad",
  "formula_logica": "(ingresos_operacionales - costo_ventas) / ingresos_operacionales",
  "formula_display": "(Ingresos - Costo Ventas) / Ingresos",
  "cuentas_base_requeridas": ["ingresos_operacionales", "costo_ventas"],
  "tipo_agregacion": "flujo",
  "formato": "percentage",
  "sinonimos": ["gross margin", "margen bruto"],
  "_nota_cliente": "Contexto específico del negocio..."
}
```

### Flujo de Publicación
1. Admin edita spec en editor Monaco → POST `/admin/tenants/{t}/semantic/publish`
2. Validación JSON Schema
3. Dry-run: construye `ClientConfig`, detecta ciclos en fórmulas
4. Write atómico via `platform.publish_semantic_version()` (función SQL)
5. Invalidación de cache en el worker que recibe el POST

### Categorías Financieras
- **Rentabilidad** (trending_up, #1E88E5)
- **Liquidez** (water_drop, #00ACC1)
- **Endeudamiento** (account_balance, #8E24AA)
- **Actividad** (autorenew, #43A047)
- **Magnitud** (bar_chart, #546E7A)

### Familias Operacionales (9)
disponibilidad, cobertura, capital_inmovilizado, eficiencia, calidad_predictiva, compra_reposicion, temporalidad_riesgo, auditoria_explicacion, metrica_ejecutiva

---

## 7. Base de Datos

### Schema `platform` (Gobernanza)

**Tablas principales:**

| Tabla | Propósito |
|-------|-----------|
| `platform.tenants` | Multi-tenancy (code, legal_name, industry, status, theme) |
| `platform.companies` | Entidades fiscales dentro de un tenant |
| `platform.users` | Perfil app (1:1 con auth.users), flag `is_platform_staff` |
| `platform.roles` | Roles system-wide y tenant-scoped |
| `platform.user_tenant_roles` | Asignación usuario → tenant → rol |
| `platform.modules` | Módulos disponibles (financiero, etc.) |
| `platform.tenant_modules` | Activación de módulo por tenant |
| `platform.company_modules` | Binding empresa → módulo |
| `platform.semantic_layer_versions` | Specs versionadas (COA, ratios, KPIs) con checksum SHA256 |
| `platform.data_sources` | Fuentes de datos por tenant (bigquery, parquet_local) |
| `platform.agent_conversations` | Metadata conversaciones (título, status, timestamps) |
| `platform.agent_messages` | Mensajes individuales + metadata |
| `platform.audit_log` | Trail de auditoría |
| `platform.feature_flags` | Feature toggles |

### RLS (Row-Level Security)
- Políticas en todas las tablas de `platform`
- `is_platform_staff()` → bypass global
- `is_tenant_admin()` → acceso dentro del tenant
- Usuarios regulares → solo sus propios datos
- **Nota crítica:** No usar `EXISTS` contra la misma tabla en políticas (recursión infinita)

### Migraciones
15 archivos SQL versionados en `supabase/migrations/`:
- `20260423195836_platform_schema_initial.sql` — schema inicial con todas las tablas + seed del tenant único `demo` (industry `General`, módulo `financiero` activado)
- `20260423223223_semantic_seed_demo_financiero_v1.sql` — seed de capa semántica (chart of accounts) del tenant `demo`
- `20260423223416_semantic_seed_demo_ratios_logic_v1.sql` — seed de capa semántica (ratios_logic) del tenant `demo`
- `20260423234735_sync_auth_to_platform_users.sql` — sync `auth.users` → `platform.users`
- `20260423234812_rls_basica_platform.sql` — RLS policies base
- `20260424000243_grant_platform_schema_to_authenticated.sql` — grants de schema
- `20260424000332_fix_rls_helpers_security_definer.sql` — fix helpers RLS `SECURITY DEFINER`
- `20260424000429_fix_rls_recursion_utr_conv_policies.sql` — fix recursión en policies
- `20260424001057_semantic_is_current_uniqueness_and_publish_fn.sql` — constraint `is_current` + función `publish_semantic_version()`
- `20260424005248_enable_pgcrypto_for_semantic_checksum.sql` — extensión pgcrypto (checksum SHA256)
- `20260424012556_session_persistence_counters_and_helpers.sql` — contadores y helpers de sesión del agente
- `20260503010000_remove_glosas_view_from_financiero.sql` — cleanup de vista legacy
- `20260503020000_company_modules.sql` — tabla `platform.company_modules`
- `20260503030000_update_agent_profile_model_to_gemini3.sql` — update de modelo del agente
- `20260503040000_update_agent_profile_llm_params.sql` — update de parámetros LLM del agente

---

## 8. Infraestructura y Deploy

### Servidor de Producción (referencia)
- **VM:** GCP, Ubuntu 24.04
- **Python:** 3.11.7 via pyenv
- **Node:** 20 via nvm
- **SSL:** Let's Encrypt (certbot, auto-renewal cada 12h)

> Detalles concretos de host, IP y dominio de la infraestructura original no se incluyen en esta versión pública.

### Arquitectura de Deploy
```
                    Internet
                       │
                   [Nginx :443]  ← Docker container
                    /        \
            /api/*            /*
               │                │
        [FastAPI :8000]    [Next.js :3000]
         (systemd)          (systemd)
```

### Servicios systemd
- `proyect-platform-backend.service` → uvicorn con warmup timeout
- `proyect-platform-frontend.service` → `npm start` con path absoluto nvm

### CI/CD
- **Trigger:** push a branch `Rama-Nueva`
- **Pipeline:** GitHub Actions → SSH al servidor
- **Deploy script** (`scripts/deploy.sh`):
  - Detección inteligente de cambios (backend/frontend/nginx/docker)
  - Solo reinstala dependencias si `Pipfile` o `package.json` cambiaron
  - **Bloquea si detecta migraciones SQL** (requiere aprobación manual)
  - Smoke tests post-deploy (health endpoint + HTTP status)
  - Refresh automático de BigQuery configurable (`AUTO_REFRESH_BQ`)
  - Reinicio atómico de servicios systemd

### Docker
- `docker/docker-compose.yml`: Nginx (Alpine) + Certbot
- Nginx: proxy `/api/*` → :8000, `/*` → :3000
- Certbot: renovación webroot con deploy-hook

---

## 9. Nota: Módulo Operacional

Una versión anterior de esta plataforma incluía un módulo operacional adicional (salud de inventario, sugerido de compra) integrado al motor financiero, además de un proyecto standalone relacionado. Ambos fueron removidos por completo de esta versión pública — el código, sus rutas de API, sus componentes de frontend y sus datos de ejemplo ya no existen en el repo. Esta sección se deja como referencia histórica breve; no se documenta su funcionamiento interno porque ya no aplica al estado actual del código.

---

## 10. Flujos de Datos End-to-End

### Flujo 1: Dashboard Ejecutivo (KPI Cards)
```
[Usuario abre /{tenant}/financiero/resumen]
  → [DashboardClient monta, lee filtros de URL]
    → [React Query: GET /tenants/{t}/dashboard/cards?year=2026&month=5&empresas=A,B]
      → [FastAPI: route handler]
        → [dal.fetch_monthly_movements() → resolve data source → parquet/BQ/SQL]
          → [ratio_engine.calcular_total() para cada KPI]
            → [cache.get_or_compute() → TTL 5min]
              → [formatter → JSON response]
                → [Frontend: renderiza KPICardWithDialog con sparkline]
```

### Flujo 2: Chat IA
```
[Usuario escribe "¿Cuál es el margen bruto de 2025?"]
  → [POST /tenants/{t}/conversations/{cid}/messages]
    → [auth middleware → validate JWT → extract tenant]
      → [tenant_context(tenant) → set ContextVar]
        → [run_turn_async(tenant, message, session)]
          → [AgentExecutor invoca calcular_ratio_financiero]
            → [tenant_guard: assert_tenant_matches ✓]
              → [ratio_engine.calcular_total("margen_bruto", ...)]
                → [Agent formatea respuesta markdown]
                  → [Persiste en platform.agent_messages]
                    → [Response: {output, tool_calls, latency_ms}]
                      → [Frontend: renderiza ChatMessage + VizRenderer]
```

### Flujo 3: Publicación de Capa Semántica
```
[Admin edita JSON en Monaco Editor]
  → [POST /admin/tenants/{t}/semantic/publish {spec_type, spec}]
    → [Validar JSON Schema contra shared/*.schema.json]
      → [Dry-run: build ClientConfig, detectar ciclos]
        → [platform.publish_semantic_version() → atomic DB write]
          → [Invalidar cache del ConfigLoader]
            → [Response: {version, checksum, published_at}]
```

### Flujo 4: Modo Presentación
```
[Usuario presiona Shift+Cmd+P]
  → [PresentationModeProvider.enter() → fullscreen]
    → [GET /tenants/{t}/dashboard/deck-narrative-sse (SSE stream)]
      → [Backend: deck_narrative.py genera secciones con Gemini]
        → [Stream: executive_headline → tldr → section_1...N]
          → [Frontend renderiza slides progresivamente]
            → [Podcast: edge-tts genera MP3 → playback karaoke]
              → [ESC para salir]
```

---

## 11. Patrones de Arquitectura Clave

### 11.1 Multi-Tenancy en 3 Capas
1. **HTTP**: JWT → AuthContext → `assert_tenant_access()`
2. **DB**: RLS policies en PostgreSQL
3. **Agent**: ContextVar + `assert_tenant_matches()` en cada tool

### 11.2 Singleton Compartido (Agent)
Un solo `AgentExecutor` para todos los tenants. El contexto se inyecta por turno via system prompt dinámico. No hay crecimiento de memoria por N tenants.

### 11.3 Data Source Resolution
Cadena de fallbacks: `platform.data_sources` → env var legacy → SQL directo. Permite migrar tenants gradualmente de SQL → BigQuery → parquet cacheado.

### 11.4 Semantic Layer as Configuration
Los ratios, cuentas y KPIs no están hardcodeados — son JSON versionado en DB con validación JSON Schema + dry-run antes de publicar.

### 11.5 Snapshot Pattern (Frontend)
Las 4 queries del dashboard deben completar antes de re-render. Evita "chart flickering" cuando una query resuelve antes que otra.

### 11.6 Domain Errors → HTTP
Excepciones de dominio se mapean automáticamente a status HTTP. No hay try/catch boilerplate en endpoints.

### 11.7 Cache con Scopes
Diferentes productores usan scopes separados (`dashboard_card`, `ratio_full`). Misma key no colisiona entre producers.

---

## 12. Testing

### Categorías
| Tipo | Archivos | Requiere DB |
|------|----------|-------------|
| Smoke tests | `test_api_rest.py` | No (uvicorn live) |
| Unit tests | `test_dal.py`, `test_cache_scope.py`, etc. | No (mocked) |
| Integration | `test_admin_*.py`, `test_conversations.py` | Sí |
| RLS security | `test_rls_isolation.py` | Sí (gated por env var) |
| Auth | `test_platform_auth_*.py` | Sí |

### Infraestructura
- **Framework:** pytest + pytest-asyncio
- **Aislamiento:** Transaction rollback por test
- **Auth injection:** `app.dependency_overrides[get_auth_context]`
- **30+ archivos de test** cubriendo API, DAL, cache, admin, auth, agent, sesiones

### Comandos
```bash
# Todos los tests
cd backend && pipenv run pytest

# Solo tests rápidos (sin DB)
pipenv run pytest -m "not requires_db"

# Tests RLS (requiere FINANCIAL_DB_URL apuntando a DB de test)
RLS_TEST_DB_URL=... pipenv run pytest tests/test_rls_isolation.py
```

---

## 13. Variables de Entorno

### Backend (.env)

| Variable | Propósito | Default |
|----------|-----------|---------|
| `FINANCIAL_DB_URL` | PostgreSQL/Supabase connection string | requerido |
| `SUPABASE_URL` | Endpoint Supabase Auth | requerido (prod) |
| `SUPABASE_ANON_KEY` | Anon key Supabase | requerido (prod) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin ops) | requerido |
| `SUPABASE_JWT_SECRET` | Secret HS256 (tests legacy) | opcional |
| `GOOGLE_API_KEY` | Gemini LLM API key | requerido (agent) |
| `AI_CLIENTE` | Tenant default en CLI | `demo` |
| `MOTOR_SEMANTIC_SOURCE` | Fuente capa semántica | `dual` |
| `MOTOR_SESSION_BACKEND` | Persistencia sesiones | `db` |
| `MOTOR_AGENT_TIMEOUT_S` | Timeout agente | 180 |
| `MOTOR_WARMUP_DISABLED` | Deshabilitar warmup | 0 |
| `MOTOR_REQUIRE_PARQUET` | Modo estricto parquet | 0 |
| `MOTOR_CORS_ORIGINS` | CORS whitelist | localhost |
| `MOTOR_LOG_LEVEL` | Nivel logging | INFO |

### Frontend (.env.local)

| Variable | Propósito |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `NEXT_PUBLIC_BACKEND_URL` | URL backend (http://localhost:8000) |
| `NEXT_PUBLIC_DEFAULT_TENANT` | Tenant por defecto |

---

## Diagrama de Arquitectura General

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     Dominio de producción (referencia)                  │
│                    Nginx (Docker) + Certbot SSL                         │
│                   /api/* → :8000    /* → :3000                          │
└───────────┬──────────────────────────────────┬───────────────────────────┘
            │                                  │
┌───────────▼──────────────┐    ┌──────────────▼───────────────────────────┐
│   FastAPI Backend :8000  │    │     Next.js Frontend :3000               │
│                          │    │                                          │
│  ┌─────────────────────┐ │    │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   API Routers       │ │    │  │Dashboard │  │  EERR    │  │Chat IA │ │
│  │ financiero/admin/   │ │    │  │Ejecutivo │  │  View    │  │ Panel  │ │
│  │ chat                │ │    │  └──────────┘  └──────────┘  └────────┘ │
│  └────────┬────────────┘ │    │  ┌──────────┐  ┌──────────┐             │
│           │              │    │  │  Admin   │  │Presenta- │             │
│  ┌────────▼────────────┐ │    │  │  Panel   │  │ción+Pod  │             │
│  │  Auth Middleware     │ │    │  └──────────┘  └──────────┘             │
│  │  (JWT + RLS)         │ │    │                                          │
│  └────────┬────────────┘ │    │  State: React Query + URL params         │
│           │              │    │  Auth: Supabase (cookie-based JWT)        │
│  ┌────────▼────────────┐ │    └──────────────────────────────────────────┘
│  │  Engine             │ │
│  │  ├── ConfigLoader   │ │
│  │  ├── DAL            │ │    ┌──────────────────────────────────────────┐
│  │  ├── RatioEngine    │ │    │           Supabase                       │
│  │  └── Cache (TTL)    │ │    │  ┌─────────────┐  ┌──────────────────┐  │
│  └────────┬────────────┘ │    │  │  Auth       │  │  PostgreSQL      │  │
│           │              │    │  │  (JWT/RLS)  │  │  schema platform │  │
│  ┌────────▼────────────┐ │    │  └─────────────┘  │  (tenants, users │  │
│  │  Agent (LangChain)  │ │    │                   │   semantic, msgs)│  │
│  │  ├── Gemini LLM     │◄────┤                   └──────────────────┘  │
│  │  ├── Tools          │ │    └──────────────────────────────────────────┘
│  │  ├── TenantGuard    │ │
│  │  └── SessionMemory  │ │    ┌──────────────────────────────────────────┐
│  └─────────────────────┘ │    │           BigQuery                       │
│                          │    │  Datos financieros contables              │
│  Data sources:           │    │  → cache parquet local en backend/cache/  │
│  BQ → Parquet → SQL      │    └──────────────────────────────────────────┘
└──────────────────────────┘
```

---

*Documento generado automáticamente. Para cambios en la arquitectura, actualizar este archivo y los esquemas correspondientes.*
