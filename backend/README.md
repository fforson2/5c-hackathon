# 5C Hackathon API

Express 5 + TypeScript. Persists to JSON files in `data/` (gitignored, created on demand).

## Setup
```
npm install
cp .env.example .env   # optional; defaults work
npm run dev            # http://localhost:3002/api
```
Env vars (see `.env.example`): `PORT`, `CORS_ORIGIN`, `DATA_DIR`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`. The dev script does not load `.env` automatically; export vars or use `node --env-file=.env`.

## Scripts
- `npm run dev` — watch mode
- `npm test` — vitest + supertest
- `npm run typecheck`
- `npm run build` then `npm start`

## Endpoints
See `../docs/api-contract.md`. Registrant emails are stored lowercased in `data/registrations.json` and never returned by any endpoint. POSTs are rate limited per IP (default 10/min). Note: behind a proxy, set Express `trust proxy` so the limiter sees client IPs.

## Storage
- Local (default): JSON files in `DATA_DIR` (`data/`).
- Redis: when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or Vercel's `KV_REST_API_URL` + `KV_REST_API_TOKEN`) are set, Upstash Redis is used. Duplicate emails are guarded atomically with `SADD` on the lowercased email.

`CORS_ORIGIN` accepts a comma-separated list of origins.

## Deploy on Vercel
Vercel's filesystem is read-only, so production must use Redis. The Express app is the default export of `src/index.ts` (zero-config Express support); it only calls `listen()` when not running on Vercel.

1. Push the repo and import it in Vercel as a new project. Set **Root Directory** to `backend`. Framework preset: Express (auto-detected).
2. In the project's **Storage** tab (or Marketplace), add **Upstash Redis** and connect it to the project. This injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` (and/or `UPSTASH_REDIS_REST_*`) automatically.
3. Optional env vars: `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`. (`CORS_ORIGIN` is set in step 6, once the frontend URL exists. Until then it defaults to `http://localhost:3000`.)
4. Deploy, then check `https://<backend>.vercel.app/api/health`.
5. Deploy the frontend with `NEXT_PUBLIC_API_URL` = `https://<backend>.vercel.app/api`.
6. Back in the backend project, set `CORS_ORIGIN` to the frontend URL (exact, no trailing slash; comma-separate to also allow `http://localhost:3000`), e.g. `https://my-frontend.vercel.app,http://localhost:3000`, then **redeploy** so it takes effect.

Optional CLI equivalent (run inside `backend/`):
```
npm i -g vercel
vercel link                      # creates .vercel/ (git-ignored)
vercel env add CORS_ORIGIN production
vercel --prod
```
`vercel env pull` writes `.env.local` containing secrets (e.g. the Redis REST token). It is git-ignored; never commit it.

Note: the rate limiter is in-memory and therefore per function instance, so it is best-effort on Vercel. Use Vercel Firewall rate limiting for a hard limit.
