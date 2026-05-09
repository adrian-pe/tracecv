# TraceCV Next.js + Vercel Migration

TraceCV has been migrated from a two-package Express + Next.js workspace into one production-ready Next.js App Router application. The Express `app.listen()` server was removed in favor of Vercel-compatible API Route handlers under `app/api/*`.

## Final structure

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
├── middleware.ts
├── next.config.js
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── vercel.json
```

## API route migrations

| Former Express route | New App Router route | Handler | Notes |
| --- | --- | --- | --- |
| `GET /` | `GET /api` | `app/api/route.ts` | Health/status response for the unified API. |
| `POST /api/activities` | `POST /api/activities` | `app/api/activities/route.ts` | Creates an activity, extracts skills, and stores user skills. |
| `GET /api/profile/:userId` | `GET /api/profile/[userId]` | `app/api/profile/[userId]/route.ts` | Returns activities and de-duplicated skills for a user. |
| `POST /api/github/:username` | `POST /api/github/[username]` | `app/api/github/[username]/route.ts` | Fetches GitHub data, stores repository activities, and returns detected skills. |

## Updated package.json

The root `package.json` is now the only app manifest. It contains Next.js, React, TypeScript, ESLint, and Vercel-ready scripts:

- `pnpm dev` starts the Next.js development server.
- `pnpm build` creates a production build.
- `pnpm start` serves the production build locally.
- `pnpm typecheck` runs TypeScript validation.
- `pnpm lint` runs Next.js linting.

Express-only dependencies (`express`, `cors`, `dotenv`, `axios`, and `nodemon`) were removed because Next.js handles routing, environment loading, and serverless execution directly. The GitHub service now uses the platform `fetch` API.

## Vercel deployment configuration

`vercel.json` declares the Next.js framework, pnpm install/build commands, and a 10-second function budget for the GitHub import endpoint. Required Vercel environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | No, recommended | Personal access token used only server-side to increase GitHub API rate limits. |
| `GITHUB_API_BASE_URL` | No | Defaults to `https://api.github.com`; useful for tests or GitHub Enterprise. |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated list of allowed origins for API calls. Leave empty for same-origin deployments. |
| `NEXT_PUBLIC_API_BASE_URL` | No | The frontend defaults to `/api`; set only if calling a separate API deployment. |

## Required migration steps

1. Install dependencies from the repository root with `pnpm install`.
2. Copy any previous backend `.env` values into Vercel Project Settings or a root `.env.local` file.
3. Run `pnpm typecheck` and `pnpm build` locally.
4. Deploy the repository root to Vercel as a Next.js project.
5. Configure `GITHUB_TOKEN` in Vercel if higher GitHub API rate limits are needed.
6. Test the endpoints after deploy:
   - `GET https://your-app.vercel.app/api`
   - `POST https://your-app.vercel.app/api/github/octocat`
   - `GET https://your-app.vercel.app/api/profile/1`

## Recommended architecture improvements

- Replace the current in-memory store with durable storage such as Vercel Postgres, Neon, Supabase, or PlanetScale. Serverless instances can be recycled, so in-memory data should only be used for demos.
- Add request validation with a schema library such as Zod before writing activities or parsing GitHub import payloads.
- Add authentication middleware before exposing profile or activity data beyond a demo environment.
- Move GitHub imports that may exceed serverless time limits into a background workflow such as Vercel Cron, Inngest, or a queue-backed worker.
- Add integration tests for each `app/api/*` route and unit tests for `lib/skill-engine.ts`.
- Add observability for GitHub API failures and rate limits through Vercel logs or a dedicated monitoring service.
