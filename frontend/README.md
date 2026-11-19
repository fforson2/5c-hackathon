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
