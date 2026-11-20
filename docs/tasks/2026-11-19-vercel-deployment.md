# Vercel deployment

- **Status:** Done
- **Date:** 2026-11-19
- **Request:** "Let's do only for vercel deployment for now for the current repo"

## Summary
Make the repo deployable on Vercel as two projects (root dirs `frontend/` and `backend/`). The backend's JSON-file storage cannot persist on Vercel, so add a Redis (Upstash via Vercel Marketplace) store used when its env vars are present; keep the file store for local dev.

## API contract changes
None to endpoints. Base URL in production is the backend project's URL, set via `NEXT_PUBLIC_API_URL` (frontend) and `CORS_ORIGIN` (backend).

## Backend tasks
- [ ] Make Express app deployable on Vercel (export app per Vercel Express support; keep `npm run dev` local listen working; no listen() on Vercel)
- [ ] Storage interface: file store (local) vs Upstash Redis (when `UPSTASH_REDIS_REST_URL`/`KV_REST_API_URL` + token env present). Keep duplicate-email check atomic (e.g. SADD/HSETNX on lowercased email)
- [ ] `CORS_ORIGIN` accepts comma-separated list (prod frontend URL + localhost:3000)
- [ ] Tests still pass (add a test for the redis store with a mock/in-memory fake); README "Deploy on Vercel" section with env vars

## Frontend tasks
- [ ] Verify build on Vercel (Next.js, root dir `frontend/`); `NEXT_PUBLIC_API_URL` documented, no localhost hardcoding beyond default
- [ ] README "Deploy on Vercel" section

## Acceptance criteria
- [ ] Both projects build locally with the Vercel settings described (`npm run build`)
- [ ] Backend works with Redis env vars (verified against fake) and without (file store)
- [ ] Step-by-step deploy instructions the user can follow (CLI install, link, Marketplace Redis, env vars, deploy order)
- [ ] No secrets committed

## Review log
| Round | Verdict | Notes |
|-------|---------|-------|
| 1 | CHANGES REQUESTED | backend .gitignore missed .vercel/.env*.local (secret leak risk); README order |
| 2 | Fixed, re-review skipped | gitignore verified by manager; README-only otherwise |
