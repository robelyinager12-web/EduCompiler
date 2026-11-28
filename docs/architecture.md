# System architecture

## Overview

    Browser (React) --HTTPS/JSON--> Express API --> Prisma --> PostgreSQL (Neon)
                                        |
                                        +--> Compiler engine (pure TypeScript)

## Server layers

| Layer | Folder | Responsibility |
|---|---|---|
| Route | `src/routes` | URL, middleware order |
| Validator | `src/validators` | Zod schemas for body, params and query |
| Controller | `src/controllers` | Translate HTTP to a function call and back |
| Service | `src/services` | Business rules and database access |
| Compiler engine | `src/compiler` | Analysis. No Express or Prisma imports. |
| Middleware | `src/middleware` | Authentication, roles, validation, rate limits, errors |

Responses use `{ "success": true, "data": ... }` or `{ "success": false, "message": ... }`.
A program with errors is normal data, so compiling invalid code returns HTTP 200 with
`status: "FAILED"`. HTTP 4xx means the request itself was wrong.

## Compiler pipeline

    Source -> Lexer -> Tokens -> Parser -> AST -> Semantic analyzer -> Symbol table
           -> TAC generator -> Optimizer -> Target code generator

- Each phase receives the previous phase's output.
- The first failing phase stops the pipeline. Later phases are marked "skipped" and have no output.
- A lexical failure still returns tokens, a semantic failure still returns the AST and symbol
  table, and a syntax failure returns no AST.
- Result objects are plain JSON, so they are stored in `Json` columns and sent to the browser
  without conversion.

## Client structure

Routes are split into public, student and administrator areas. `ProtectedRoute` and
`AdminRoute` improve navigation, but the real checks are on the server. The Axios client adds
the token and clears it on a 401. Pages share `useFetch` and `PageState` for loading, error
and retry handling.

## Security

- Passwords: bcrypt. Login gives one message for every failure and does a hash check even for
  unknown emails.
- Sessions: HS256 JWT with an expiry. The role is read from the database on each request, so
  deleting or changing an account takes effect immediately.
- Registration always creates a student. Unknown request fields, such as `role`, are removed.
- Exercise answer keys are never selected by student endpoints.
- Lesson, exercise and source text are rendered as text, never as HTML.
- The JWT is kept in `localStorage`, so any script-injection bug would expose it. No untrusted
  HTML is rendered, but this remains a known trade-off.

## Deployment topology

    Vercel (static client) --HTTPS--> Render (API) --> Neon (PostgreSQL)

The API runs `prisma migrate deploy` on start, then the server. CORS allows only `CLIENT_URL`.
