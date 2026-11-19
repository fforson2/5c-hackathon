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
