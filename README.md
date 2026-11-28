# EduCompiler

**Interactive Compiler Learning and Visualization System.** An academic project that helps
Software Engineering students understand how a compiler works. Students write programs in a
small teaching language called **EduLang**, run them through every compiler phase, and inspect
the output of each phase.

EduCompiler **analyses** programs. It never runs student code, and its target code is
educational pseudo-assembly for an imaginary machine, not executable machine code.

## Objectives

1. Explain compiler architecture through a working, inspectable compiler.
2. Let students write EduLang in an online editor.
3. Show lexical, syntax and semantic analysis, the symbol table, intermediate code,
   optimization and target code.
4. Explain compilation errors with exact line and column.
5. Provide lessons and exercises, and save programs and compilation history.

## Features (implemented)

**Compiler engine** (plain TypeScript, no Express or Prisma imports)

- Lexer with line/column tracking, comments, string escapes and error recovery
- Recursive-descent parser that builds an AST, with panic-mode recovery and a depth limit
- Semantic analyzer with a scope-aware symbol table, type checking and warnings
- Three-address code generation
- Optimizer: constant propagation, constant folding and dead code elimination, each step
  explained, and no change of program behavior (verified by tests)
- Educational target code with a TAC-to-target mapping
- One pipeline that stops at the first failing phase

**Web application**

- Registration and login (JWT), student and administrator roles
- Compiler workspace: Monaco editor with EduLang highlighting and error squiggles, a tab for
  every phase, a React Flow AST and pipeline diagram
- Saved programs, compilation history, lessons with progress, exercises with automatic checking
- Dashboard, light and dark themes, responsive layout with a mobile menu
- Admin area: statistics, student list and deletion, lesson and exercise management

## Technology

| Part | Technology |
|---|---|
| Client | React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Monaco Editor, React Flow, Lucide |
| Server | Node.js, Express, TypeScript, JWT, bcrypt, Zod, Helmet, express-rate-limit |
| Database | Neon PostgreSQL with Prisma |
| Quality | Vitest, Supertest, Testing Library, ESLint, Prettier |
| Hosting | Vercel (client), Render (API), Neon (database) |

## Architecture

    Browser (React) --HTTPS/JSON--> Express API --> Prisma --> PostgreSQL (Neon)
                                        |
                                        +--> Compiler engine (no web or database code)

The server is layered: route, validator, controller, service. The compiler engine is called
by the service layer and knows nothing about HTTP. See `docs/architecture.md`.

## Folder structure

    EduCompiler/
    |-- client/            React app (Vercel)
    |   `-- src/ components, pages, routes, services, hooks, context, types, utils
    |-- server/            Express API (Render)
    |   |-- prisma/        schema, migrations, seed
    |   |-- src/           config, controllers, routes, services, middleware, validators, utils
    |   |   `-- compiler/  lexer, parser, ast, semantic, symbol-table, intermediate,
    |   |                  optimizer, code-generator, pipeline, docs
    |   `-- tests/         compiler, api, integration
    |-- docs/              project documentation and Postman collection
    |-- render.yaml        Render Blueprint
    `-- README.md

## Installation

Requirements: Node.js 20 or newer, Git, and a Neon account.

    git clone https://github.com/YOUR-USERNAME/EduCompiler.git
    cd EduCompiler

    # Server
    cd server
    npm install
    cp .env.example .env        # then fill in the values below
    npx prisma migrate deploy   # creates the tables
    npm run prisma:seed         # admin account, 5 lessons, 10 exercises
    npm run dev                 # http://localhost:5000

    # Client (a second terminal)
    cd client
    npm install
    cp .env.example .env
    npm run dev                 # http://localhost:5173

## Environment variables

`server/.env`

| Name | Meaning |
|---|---|
| `DATABASE_URL` | Neon pooled connection string (used by the app) |
| `DIRECT_URL` | Neon direct connection string (used by migrations) |
| `JWT_SECRET` | Random string of at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `CLIENT_URL` | Allowed browser origin(s), comma separated, no trailing slash |
| `PORT`, `NODE_ENV` | Set by the host in production |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the seed script |
| `TEST_DATABASE_URL` | Optional, a separate database for integration tests |

`client/.env`: `VITE_API_URL` (for example `http://localhost:5000/api`). Never put secrets in
client variables, because the browser can read them. Never commit `.env` files.

## Development commands

| Command | Purpose |
|---|---|
| `npm --prefix server run dev` | Start the API with auto-restart |
| `npm --prefix client run dev` | Start the client |
| `npm --prefix server run typecheck` / `lint` | Check the server |
| `npm --prefix client run build` / `lint` | Check the client |
| `npm run format` | Format with Prettier |
| `npx prisma migrate dev` (in `server`) | Create a migration after changing the schema |
| `npm --prefix server run prisma:seed` | Load the admin account, lessons and exercises |

## Testing

    npm --prefix server test                    # compiler and API tests, no database needed
    npm --prefix server run test:integration    # real PostgreSQL, needs TEST_DATABASE_URL
    npm --prefix client test                    # client tests

See `docs/testing-strategy.md`.

## API

Summary in `docs/api-documentation.md`. A Postman collection is in `docs/postman/`.

## Deployment

Vercel for the client, Render for the API, Neon for the database. See `docs/deployment.md`.

## Limitations and future work

Implemented features are listed above. These are **not** implemented:

- `if`/`else`, loops, functions and arrays in EduLang (`if` and `else` are reserved words)
- Password change and reset, email verification, and editing students as an administrator
- Refresh tokens or httpOnly cookies (the token is kept in `localStorage`)
- Clicking an error to jump to its line, and rich text in lessons
- Register allocation and real machine code
- Browser end-to-end tests

## Credits

Academic project for a Software Engineering course.
