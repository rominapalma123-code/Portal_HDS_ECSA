# Proyect Platform — Maqueta

Maqueta/portafolio de una plataforma financiera multitenant con agente de IA: dashboards financieros (EERR, ratios, KPIs), una capa semántica configurable por tenant, y un agente conversacional que responde preguntas sobre los datos de cada cliente.

> Este repositorio es una versión pública y depurada de un proyecto de consultoría privado. Se removieron todos los datos y credenciales de clientes reales; el tenant `demo` incluido usa cifras y nombres ficticios. Ver [ARQUITECTURA_COMPLETA.md](./ARQUITECTURA_COMPLETA.md) para el detalle técnico completo.

Guía paso a paso para levantar el proyecto completo (backend + frontend + base de datos) en una máquina nueva.

---

## Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) — marcar "Add to PATH" en Windows |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| pipenv | cualquiera | `pip install pipenv` |
| Git | cualquiera | Para clonar el repo |
| Cuenta Supabase | — | Proyecto existente o nuevo en [supabase.com](https://supabase.com) |
| Google AI Studio key | — | Para el agente LLM ([aistudio.google.com](https://aistudio.google.com)) |

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repo> proyect-platform
cd proyect-platform
```

---

## 2. Configurar la base de datos (Supabase)

El proyecto usa Supabase como Postgres + auth. Si vas a conectarte al proyecto de producción existente, sáltate al paso 2.3. Si necesitas uno nuevo, sigue desde el 2.1.

### 2.1 Crear proyecto en Supabase (solo si es entorno nuevo)

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Elige nombre, contraseña de DB y región
3. Espera ~2 minutos a que el proyecto esté listo

### 2.2 Ejecutar las migraciones

Las migraciones crean el schema `platform.*` completo. Ejecútalas en orden desde el **SQL Editor** de Supabase o vía `psql`:

```
supabase/migrations/20260423195836_platform_schema_initial.sql
supabase/migrations/20260423223223_semantic_seed_demo_financiero_v1.sql
supabase/migrations/20260423223416_semantic_seed_demo_ratios_logic_v1.sql
supabase/migrations/20260423234735_sync_auth_to_platform_users.sql
supabase/migrations/20260423234812_rls_basica_platform.sql
supabase/migrations/20260424000243_grant_platform_schema_to_authenticated.sql
supabase/migrations/20260424000332_fix_rls_helpers_security_definer.sql
supabase/migrations/20260424000429_fix_rls_recursion_utr_conv_policies.sql
supabase/migrations/20260424001057_semantic_is_current_uniqueness_and_publish_fn.sql
supabase/migrations/20260424005248_enable_pgcrypto_for_semantic_checksum.sql
supabase/migrations/20260424012556_session_persistence_counters_and_helpers.sql
supabase/migrations/20260503010000_remove_glosas_view_from_financiero.sql
supabase/migrations/20260503020000_company_modules.sql
supabase/migrations/20260503030000_update_agent_profile_model_to_gemini3.sql
supabase/migrations/20260503040000_update_agent_profile_llm_params.sql
supabase/migrations/20260503050000_rename_biwiser_staff_to_platform_staff.sql
supabase/migrations/20260503060000_activate_financial_agent_for_demo.sql
```

> **Importante:** ejecutar en el orden listado (o simplemente todos los archivos de la carpeta en orden alfabético/cronológico, ya coinciden).

Via `psql` (más rápido para múltiples archivos):
```bash
for f in supabase/migrations/*.sql; do
  psql "$SUPABASE_DB_URL" -f "$f"
done
```

### 2.3 Obtener las credenciales

En el dashboard de Supabase → **Project Settings → API**:

| Variable | Dónde encontrarla |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (mantener secreta) |
| `FINANCIAL_DB_URL` | Settings → Database → Connection string (modo "URI") |

La `FINANCIAL_DB_URL` tiene el formato:
```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

---

## 3. Configurar el backend

### 3.1 Crear el archivo `.env`

```bash
cd backend
cp .env.example .env
```

Editar `.env` con los valores obtenidos en el paso 2.3:

```env
FINANCIAL_DB_URL=postgresql://postgres.<ref>:<password>@...supabase.com:5432/postgres
GOOGLE_API_KEY=<tu-key-de-google-ai-studio>
AI_CLIENTE=demo

SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=<service_role_jwt>
```

Variables opcionales (puedes dejar sin definir para usar los defaults):
```env
# MOTOR_SEMANTIC_SOURCE=dual     # fs | db | dual (default: dual si hay DB)
# MOTOR_SESSION_BACKEND=db       # memory | db | dual
# MOTOR_AGENT_TIMEOUT_S=180
# MOTOR_WARMUP_DISABLED=1        # útil en desarrollo para arranque más rápido
```

### 3.2 Instalar dependencias

**Windows (recomendado):**
```bat
cd backend
setup.bat
```

**macOS / Linux:**
```bash
cd backend
pip install pipenv
pipenv install --dev
```

> Si pipenv detecta un virtualenv externo activo (conda, pyenv, etc.) y falla:
> ```bash
> PIPENV_IGNORE_VIRTUALENVS=1 pipenv install --dev
> ```

Alternativa sin pipenv (cualquier OS):
```bash
cd backend
pip install -e '.[dev]'
```

### 3.3 Verificar la instalación

```bash
# Con pipenv:
pipenv run test-one

# Sin pipenv:
pytest tests/test_smoke.py -v
```

Deberías ver los tests de smoke pasando. Los tests RLS (`test_rls_isolation.py`) se saltean automáticamente si no hay `SUPABASE_JWT_SECRET_TEST` definido — es el comportamiento esperado.

### 3.4 Levantar el backend

```bash
# Con pipenv:
pipenv run dev

# Sin pipenv:
uvicorn motor.api.rest:app --reload --port 8000
```

Verificar que responde:
```bash
curl http://localhost:8000/health
# → {"status":"ok","db":"up","timestamp":"..."}
```

---

## 4. Configurar el frontend

### 4.1 Crear el archivo `.env.local`

```bash
cd frontend
cp .env.local.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_TENANT=demo
```

> `NEXT_PUBLIC_BACKEND_URL` apunta al backend local. En producción reemplazar por la URL real del servidor.

### 4.2 Instalar dependencias y levantar

```bash
cd frontend
npm install
npm run dev
```

Acceder en: **http://localhost:3000**

---

## 5. Configurar la capa semántica

La capa semántica son los specs de ratios y plan de cuentas por tenant. Sin ella, los dashboards financieros devuelven 404.

El tenant `demo` ya tiene configuración en las migraciones (paso 2.2). Para verificar:

```bash
# Con el backend corriendo:
curl http://localhost:8000/tenants/demo/dashboard/cards?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
```

Si para un tenant nuevo obtienes `{"error":"semantic_not_found"}`, necesitas publicar su configuración semántica vía el panel admin (`/admin/tenants/<tenant>/semantic`) o creando los archivos JSON en `schemas/clients/<tenant>/`.

### Crear un tenant nuevo (punto de partida rápido)

```bash
mkdir -p schemas/clients/<nuevo-tenant>
```

Usa las migraciones `20260423223223_semantic_seed_demo_financiero_v1.sql` y `20260423223416_semantic_seed_demo_ratios_logic_v1.sql` como plantilla de `chart_of_accounts.json` / `ratios_logic.json`, y edítalas con el plan de cuentas real del nuevo cliente.

---

## 6. Crear el primer usuario administrador

1. En Supabase → **Authentication → Users** → **Invite user** (o usar el endpoint `POST /admin/users/invite` con la `SUPABASE_SERVICE_ROLE_KEY`)
2. El usuario confirma el email y establece contraseña
3. En Supabase → **SQL Editor**, asignar rol de staff:

```sql
UPDATE platform.users
SET is_platform_staff = true
WHERE email = 'tu@email.com';
```

> **Nota:** además de la tabla `platform.users`, el campo `is_platform_staff` debe reflejarse en el `app_metadata` del usuario en Supabase Auth (el JWT es la fuente que lee el middleware). Actualízalo vía la Admin API o el dashboard de Supabase → Authentication → Users → editar usuario → User Metadata.

> Los usuarios staff pueden acceder a todos los tenants y al panel `/admin`.

---

## 7. Datos financieros (parquet opcional)

Si el entorno tiene un archivo parquet preprocesado del cliente (`contable_financiero_cache.parquet`), el backend lo detecta automáticamente si está en:

```
backend/cache/<tenant>/movimientos_contables.parquet
```

Sin parquet, el backend usa SQL directamente contra la DB.

---

## Credenciales y datos privados

Este repo nunca versiona secretos: `.env`, `.env.local` y `backend/secrets/` están en `.gitignore`. La carpeta `datos_privados_bw/` es un espacio local (también gitignoreado) pensado para guardar tus propias credenciales fuera del control de versiones — se sube vacía (solo con un `.gitkeep`).

---

## Resumen rápido (entorno ya configurado)

Una vez que el entorno está configurado, el flujo diario es:

```bash
# Terminal 1 — backend
cd backend && pipenv run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Panel admin: http://localhost:3000/admin
API docs: http://localhost:8000/docs

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| `health` devuelve `db: degraded` | `FINANCIAL_DB_URL` incorrecta o DB no alcanzable | Verificar URL y conectividad |
| Dashboard devuelve 404 `semantic_not_found` | Falta config semántica del tenant | Ver paso 5 |
| Login falla con 401 | `SUPABASE_URL` o `SUPABASE_ANON_KEY` incorrectos | Verificar valores en Supabase dashboard |
| `pipenv install` falla en Windows | Python no en PATH o versión < 3.10 | Reinstalar Python marcando "Add to PATH" |
| `pipenv install` falla con venv externo activo | pipenv reutiliza el venv del sistema | Usar `PIPENV_IGNORE_VIRTUALENVS=1 pipenv install --dev` |
| Frontend no conecta al backend | CORS o `NEXT_PUBLIC_BACKEND_URL` incorrecto | Verificar que el backend está en `localhost:8000` |
| Tests RLS se saltan | Variables de test no definidas | Es esperado; definir `SUPABASE_JWT_SECRET_TEST` solo si necesitas correr RLS tests |
