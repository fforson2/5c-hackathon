# 5C Hackathon website

- **Status:** In progress
- **Date:** 2026-11-19
- **Request:** "let's create a website for 5c hackathon with nice UI and minimalistic as possible"

## Summary

Landing site for the 5C (Claremont Colleges) hackathon: hero with live countdown, tracks, prizes, schedule, FAQ, a registration form, and a team-finder board.

## API contract changes

Added: GET /api/event, /api/schedule, /api/faq, /api/teams, /api/health; POST /api/registrations, /api/teams.

## Backend tasks

- [ ] Node + Express (TypeScript ok) in `backend/`, port 3002, CORS for localhost:3000
- [ ] Seed data for event, schedule, FAQ (5C-themed)
- [ ] Registrations + teams persisted to JSON file under `backend/data/` (gitignored)
- [ ] Validation, error format, duplicate email 409, basic rate limit, never expose emails
- [ ] Tests for validation and duplicates; README with run steps

## Frontend tasks

- [ ] Next.js (App Router) + Tailwind in `frontend/`, port 3000
- [ ] Sections: hero + countdown, tracks, prizes, schedule, FAQ accordion, register form, team board (list, filter, post team)
- [ ] Minimalistic design: monochrome palette + one accent, generous whitespace, one typeface, no gradients/stock imagery/heavy animation; responsive, accessible, loading/error/empty states
- [ ] Typed API client against the contract

## Acceptance criteria

- [ ] Both apps start with documented commands and talk to each other
- [ ] Registering works, duplicate email shows a friendly error
- [ ] Posting and filtering teams works
- [ ] No emails exposed; inputs validated on both sides
- [ ] Build and tests pass

## Review log

| Round | Verdict | Notes |
|-------|---------|-------|
|       |         |       |
