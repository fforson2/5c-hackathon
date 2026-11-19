# API contract

The single source of truth for how `frontend/` and `backend/` talk to each other.
**Only the Manager edits this file.** Frontend and backend build against it. If either finds a problem, they report it to the Manager.

## Conventions

- Base URL: `/api` (dev: backend on `http://localhost:3002/api`; frontend on `http://localhost:3000`, CORS allows that origin. Frontend reads base URL from `NEXT_PUBLIC_API_URL`, default `http://localhost:3002/api`)
- Format: JSON, `Content-Type: application/json`
- Field naming: `camelCase`
- Dates: ISO 8601 strings in UTC
- Auth: none (public site). No endpoint ever returns registrant emails.

### Error format

Every non-2xx response uses this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

| Status | When                                  |
|--------|---------------------------------------|
| 400    | Invalid input (`VALIDATION_ERROR`)    |
| 401    | Not authenticated (`UNAUTHENTICATED`) |
| 403    | Not allowed (`FORBIDDEN`)             |
| 404    | Not found (`NOT_FOUND`)               |
| 500    | Server error (`INTERNAL_ERROR`)       |

## Endpoints

Colleges enum (`college`): `Pomona`, `Claremont McKenna`, `Scripps`, `Pitzer`, `Harvey Mudd`, `Keck Graduate Institute`, `Other`.
Track ids: `ai`, `social-good`, `creative`, `open`.

### GET /api/event
**Response 200:**
```json
{
  "name": "5C Hackathon",
  "tagline": "string",
  "startsAt": "2027-02-20T17:00:00.000Z",
  "endsAt": "2027-02-21T23:00:00.000Z",
  "location": "string",
  "tracks": [{ "id": "ai", "name": "string", "description": "string" }],
  "prizes": [{ "place": "1st", "title": "string", "amount": "string" }],
  "stats": { "registrations": 0, "teams": 0 }
}
```

### GET /api/schedule
**Response 200:**
```json
{ "items": [{ "id": "string", "day": 1, "startsAt": "ISO", "title": "string", "description": "string", "location": "string" }] }
```
Sorted by `startsAt`.

### GET /api/faq
**Response 200:** `{ "items": [{ "id": "string", "question": "string", "answer": "string" }] }`

### POST /api/registrations
**Request:**
```json
{ "name": "string (1-100)", "email": "valid email", "college": "enum", "year": "Freshman|Sophomore|Junior|Senior|Grad", "trackId": "optional track id", "experience": "beginner|intermediate|advanced", "dietary": "optional string (<=200)" }
```
**Response 201:** `{ "id": "string", "name": "string", "college": "string", "createdAt": "ISO" }`

**Errors:** 400 VALIDATION_ERROR (`details` = `{ field: "message" }`), 409 `ALREADY_REGISTERED` (same email, case-insensitive). Rate limit: 429 `RATE_LIMITED`.

### GET /api/teams
Query: `?lookingFor=<string>` optional filter (case-insensitive substring on skills).
**Response 200:**
```json
{ "items": [{ "id": "string", "name": "string", "idea": "string", "trackId": "string|null", "lookingFor": ["string"], "spotsOpen": 2, "contact": "string", "createdAt": "ISO" }] }
```
Newest first.

### POST /api/teams
**Request:**
```json
{ "name": "string (1-60)", "idea": "string (1-280)", "trackId": "optional track id", "lookingFor": ["string (max 6 items, each <=30)"], "spotsOpen": "integer 1-4", "contact": "string (1-100) — shown publicly, e.g. Discord handle" }
```
**Response 201:** the team object (same shape as in GET /api/teams).

**Errors:** 400 VALIDATION_ERROR, 429 RATE_LIMITED.

### GET /api/health
**Response 200:** `{ "status": "ok" }`

Additional error codes: 429 `RATE_LIMITED`, 409 `ALREADY_REGISTERED`.
