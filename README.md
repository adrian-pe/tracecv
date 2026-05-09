# TraceCV

> **Identidad profesional basada en actividad verificable, no en afirmaciones auto-reportadas.**

TraceCV es un motor de prueba de habilidades que convierte actividad técnica real —repositorios, contribuciones, eventos y participación técnica— en un perfil profesional dinámico y verificable. La versión actual incluye una API en Express.js con integración de GitHub y extracción automática de skills a partir de repositorios públicos.

## Estado actual

| Área | Estado | Detalle |
| --- | --- | --- |
| Backend API | ✅ Implementado | API Express servida bajo `/api` en el puerto `3001` por defecto. |
| Integración GitHub | ✅ Implementada | Lee perfil/repositorios públicos y detecta lenguajes, topics y tecnologías. |
| Base de datos | ⚠️ Temporal | Persistencia en memoria; los datos se pierden al reiniciar el servidor. |
| Frontend | 🚧 Scaffold inicial | Existe el paquete Next.js, pero la UI todavía está pendiente de implementación. |
| Documentación | ✅ Versionada | La carpeta `docs/` contiene guías, arquitectura, ejemplos y checklist. |

## Estructura del proyecto

```text
tracecv/
├── backend/                 # API Express.js
│   ├── src/
│   │   ├── index.js         # Entrada del servidor
│   │   ├── routes.js        # Endpoints de la API
│   │   ├── skillEngine.js   # Extracción de habilidades
│   │   ├── githubService.js # Cliente e integración con GitHub
│   │   └── db.js            # Almacenamiento en memoria
│   └── package.json
├── frontend/                # Paquete Next.js para la futura UI
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── docs/                    # Documentación del proyecto
│   ├── architecture/
│   ├── examples/
│   ├── guides/
│   └── DOCUMENTATION_INDEX.md
├── package.json             # Metadatos del monorepo
├── pnpm-workspace.yaml      # Workspaces de pnpm
├── pnpm-lock.yaml           # Lockfile de dependencias
└── README.md
```

## Requisitos

- Node.js 18 o superior
- pnpm 10 o superior
- Opcional: token de GitHub para aumentar límites de rate limit

## Instalación

```bash
pnpm install
```

## Configuración

El backend carga variables de entorno con `dotenv`. Crea un archivo `backend/.env` si necesitas sobrescribir valores locales:

```bash
cp backend/.env.example backend/.env
```

Variables útiles:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto del backend. Por defecto: `3001`. |
| `GITHUB_TOKEN` | No | Token personal de GitHub para subir límites de la API. |
| `GITHUB_API_BASE_URL` | No | URL base de GitHub API. Por defecto: `https://api.github.com`. |

> Nota: los archivos `.env` no deben subirse al repositorio.

## Uso en desarrollo

### Backend

```bash
pnpm --filter api dev
```

La API queda disponible en:

- `GET http://localhost:3001/`
- Endpoints bajo `http://localhost:3001/api`

También puedes ejecutar desde la carpeta del backend:

```bash
cd backend
pnpm dev
```

### Frontend

El paquete `frontend/` contiene la configuración inicial de Next.js. Cuando la UI tenga archivos de aplicación, podrá ejecutarse con:

```bash
pnpm --filter tracecv-frontend dev
```

## Endpoints principales

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
curl http://localhost:3001/api/profile/1
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
curl -X POST http://localhost:3001/api/github/octocat \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

## Cómo funciona

```text
Actividad real → Ingesta de datos → Extracción de skills → Perfil dinámico
```

1. Un usuario realiza actividad técnica real.
2. TraceCV recibe la actividad manualmente o desde integraciones como GitHub.
3. El motor de skills detecta lenguajes, frameworks, tecnologías y especializaciones.
4. La API agrega actividades y skills en un perfil consultable.

## Documentación

La carpeta `docs/` **sí conviene subirla al repositorio** porque contiene contexto útil para instalación, arquitectura, ejemplos y decisiones del proyecto. No debe ignorarse salvo que en el futuro incluya artefactos generados, credenciales, dumps, reportes pesados o archivos privados.

Documentos destacados:

- [Índice de documentación](./docs/DOCUMENTATION_INDEX.md)
- [Guía rápida](./docs/guides/QUICK_START.md)
- [Configuración de GitHub](./docs/guides/GITHUB_SETUP.md)
- [Arquitectura](./docs/architecture/ARCHITECTURE.md)
- [Ejemplos de API](./docs/examples/API_EXAMPLES.md)

## Seguridad y control de versiones

- ✅ Sube documentación, código fuente, scripts y lockfiles.
- ✅ Sube `pnpm-lock.yaml` para builds reproducibles.
- ❌ No subas `.env`, tokens, claves privadas, dumps locales o bases de datos de desarrollo.
- ❌ No subas `node_modules/`, builds (`dist/`, `.next/`, `out/`) ni caches.
- ⚠️ Si agregas archivos dentro de `docs/`, revisa que no contengan secretos ni datos personales.

## Scripts útiles

```bash
# Instalar dependencias del monorepo
pnpm install

# Levantar backend en desarrollo
pnpm --filter api dev

# Ejecutar script manual de prueba de GitHub
chmod +x test-github-integration.sh
./test-github-integration.sh
```

## Roadmap

- [ ] Implementar UI de frontend en Next.js
- [ ] Agregar autenticación de usuarios
- [ ] Reemplazar almacenamiento en memoria por base de datos persistente
- [ ] Mejorar scoring y deduplicación de skills
- [ ] Agregar integración con eventos técnicos
- [ ] Publicar perfiles públicos
- [ ] Exportar perfil en JSON/PDF
- [ ] Explorar verificación blockchain con Stellar

## Contribución

1. Crea una rama para tu cambio.
2. Mantén documentación y README actualizados cuando cambie el comportamiento.
3. No incluyas secretos ni archivos generados.
4. Ejecuta las pruebas/checks disponibles antes de abrir un PR.

## Licencia

ISC
