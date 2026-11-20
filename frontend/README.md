# 5C Hackathon — frontend

Single-page site: Next.js (App Router) + TypeScript + Tailwind CSS v4, Inter via `next/font`.

## Run

```bash
npm install
cp .env.example .env.local   # optional; default API is http://localhost:3002/api
npm run dev                  # http://localhost:3000
```

The backend (see `../backend/README.md`) must be running on port 3002 for data to load.

| Command             | What it does          |
|---------------------|-----------------------|
| `npm run dev`       | Dev server on :3000   |
| `npm run build`     | Production build      |
| `npm start`         | Serve the build :3000 |
| `npm run lint`      | ESLint                |
| `npm run typecheck` | `tsc --noEmit`        |

## Config

- `NEXT_PUBLIC_API_URL` — API base URL (default `http://localhost:3002/api`).

## Layout

- `app/` — layout, global styles (palette tokens, light/dark via `prefers-color-scheme`)
- `components/` — one component per section (`Hero`, `Tracks`, `Prizes`, `Schedule`, `Faq`, `RegisterForm`, `TeamBoard`)
- `lib/api.ts` — typed API client matching `docs/api-contract.md`; `lib/types.ts` — shared types

## Deploy on Vercel

Deploy the backend first so you have its production URL.

1. Import the GitHub repo in Vercel as a new project and set **Root Directory** to `frontend` (the Next.js preset is auto-detected; no `vercel.json` needed).
2. Before the first build, add the env var `NEXT_PUBLIC_API_URL` set to the backend's production URL including `/api`, e.g. `https://<backend>.vercel.app/api`. It is inlined at **build time**, so changing it requires a redeploy. If it is left unset, the build falls back to `http://localhost:3002/api` and the live site will not load data.
3. Deploy, then set the backend's `CORS_ORIGIN` to the frontend's URL (e.g. `https://<frontend>.vercel.app`) and redeploy the backend.
4. Optional custom domain (5chack.com): add `5chack.com` and `www.5chack.com` under Project → Settings → Domains, then add the DNS records Vercel shows at your registrar (Squarespace: Domains → DNS Settings), removing any default records pointing at Squarespace's site builder. Update `CORS_ORIGIN` to the custom domain.
