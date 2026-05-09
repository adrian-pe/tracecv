# TraceCV

> **Identidad profesional basada en actividad verificable, no en afirmaciones auto-reportadas.**

TraceCV es una aplicación Next.js App Router que convierte actividad técnica real —repositorios, contribuciones, eventos y participación técnica— en un perfil profesional dinámico y verificable. La versión actual incluye UI en Next.js, API Routes serverless bajo `/app/api/*`, integración con GitHub y extracción automática de skills a partir de repositorios públicos.

## Estado actual

| Área | Estado | Detalle |
| --- | --- | --- |
| Aplicación Next.js | ✅ Implementada | Una sola aplicación App Router lista para Vercel. |
| API serverless | ✅ Implementada | Endpoints bajo `/api` usando Route Handlers de Next.js. |
| Integración GitHub | ✅ Implementada | Lee perfil/repositorios públicos y detecta lenguajes, topics y tecnologías. |
| Base de datos | ⚠️ Temporal | Persistencia en memoria; para producción se recomienda Vercel Postgres, Neon, Supabase o PlanetScale. |
| Frontend | ✅ Implementado | UI para analizar perfiles de GitHub desde la misma aplicación. |
| Documentación | ✅ Versionada | La carpeta `docs/` contiene guías, arquitectura, ejemplos, checklist y la guía de migración a Vercel. |

## Estructura del proyecto

```text
tracecv/
├── app/
│   ├── api/
│   │   ├── activities/route.ts
│   │   ├── github/[username]/route.ts
│   │   ├── profile/[userId]/route.ts
│   │   └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── api.ts
│   ├── db.ts
│   ├── github-service.ts
│   └── skill-engine.ts
├── docs/
├── middleware.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── vercel.json
```

## Requisitos

- Node.js 20 o superior
- pnpm 10 o superior
- Opcional: token de GitHub para aumentar límites de rate limit

## Instalación

```bash
pnpm install
```

## Configuración

Copia el ejemplo de variables de entorno si necesitas valores locales:

```bash
cp .env.example .env.local
```

Variables útiles:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | Token personal de GitHub usado solo del lado servidor para subir límites de la API. |
| `GITHUB_API_BASE_URL` | No | URL base de GitHub API. Por defecto: `https://api.github.com`. |
| `CORS_ALLOWED_ORIGINS` | No | Lista separada por comas de orígenes permitidos para `/api`. |
| `NEXT_PUBLIC_API_BASE_URL` | No | La UI usa `/api` por defecto; configúrala solo si necesitas llamar otra API. |

> Nota: los archivos `.env*` locales no deben subirse al repositorio.

## Uso en desarrollo

```bash
pnpm dev
```

La aplicación queda disponible en:

- UI: `http://localhost:3000`
- API health: `GET http://localhost:3000/api`
- Endpoints bajo `http://localhost:3000/api/*`

## Endpoints principales

### Health check

```http
GET /api
```

### Crear una actividad manual

```http
POST /api/activities
Content-Type: application/json

{
  "userId": 1,
  "type": "event",
  "source": "manual",
  "title": "Node.js workshop",
  "url": "https://example.com/event"
}
```

### Consultar perfil agregado

```http
GET /api/profile/:userId
```

Ejemplo:

```bash
curl http://localhost:3000/api/profile/1
```

### Procesar perfil de GitHub

```http
POST /api/github/:username
Content-Type: application/json

{
  "userId": 1
}
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

## Scripts útiles

```bash
# Instalar dependencias
pnpm install

# Levantar la aplicación Next.js
pnpm dev

# Validar tipos
pnpm typecheck

# Crear build de producción
pnpm build

# Ejecutar script manual de prueba de GitHub con pnpm dev activo
chmod +x test-github-integration.sh
./test-github-integration.sh
```

## Deploy en Vercel

1. Conecta este repositorio como un proyecto Next.js en Vercel.
2. Usa la raíz del repositorio como root directory.
3. Mantén `pnpm install` como install command y `pnpm build` como build command.
4. Agrega `GITHUB_TOKEN` si necesitas mayores límites de GitHub API.
5. Despliega y prueba `https://your-app.vercel.app/api`.

Consulta la guía completa en [docs/deployment/NEXTJS_VERCEL_MIGRATION.md](./docs/deployment/NEXTJS_VERCEL_MIGRATION.md).

## Cómo funciona

```text
Actividad real → Ingesta de datos → Extracción de skills → Perfil dinámico
```

1. Un usuario realiza actividad técnica real.
2. TraceCV recibe la actividad manualmente o desde integraciones como GitHub.
3. El motor de skills detecta lenguajes, frameworks, tecnologías y especializaciones.
4. Las API Routes agregan actividades y skills en un perfil consultable.

## Roadmap

- [ ] Reemplazar almacenamiento en memoria por base de datos persistente
- [ ] Agregar autenticación de usuarios
- [ ] Mejorar scoring y deduplicación de skills
- [ ] Agregar integración con eventos técnicos
- [ ] Publicar perfiles públicos
- [ ] Exportar perfil en JSON/PDF
- [ ] Explorar verificación blockchain con Stellar

## Licencia

ISC
