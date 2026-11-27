# EduCompiler API

Base URL (local): `http://localhost:5000/api`

Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "message": "..." }`

## Implemented (Phase 12)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | /health | | Service and database status |
| POST | /compiler/lexical | `{ "source": string }` | Tokens |
| POST | /compiler/syntax | `{ "source": string }` | Tokens and AST |
| POST | /compiler/semantic | `{ "source": string }` | Plus symbol table |
| POST | /compiler/compile | `{ "source": string }` | All phases |
| GET | /lessons | | List lessons (no content) |
| GET | /lessons/:id | | One lesson with content |
| GET | /exercises | | List exercises |
| GET | /exercises/:id | | One exercise (no answer key) |

Compiling invalid code returns HTTP 200 with `data.status = "FAILED"`, `data.failedPhase`
and `data.errors`. HTTP 400 means the request itself was bad (for example, no `source`).

Status codes: 400 invalid request, 404 not found, 413 body too large, 429 too many requests.

## Planned (Phase 13)

Authentication (`/auth/register`, `/auth/login`, `/auth/me`), programs, compilation
history, exercise submissions, and admin management of students, lessons and exercises.
