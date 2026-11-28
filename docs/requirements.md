# Requirements

## Functional requirements

| ID | Requirement | Status |
|---|---|---|
| FR1 | A visitor can register as a student and log in | Implemented |
| FR2 | Administrators are created by the seed script only | Implemented |
| FR3 | A student can write EduLang in an online editor and run the compiler | Implemented |
| FR4 | Show tokens with type, line and column | Implemented |
| FR5 | Show the AST as a tree | Implemented |
| FR6 | Show semantic errors and the symbol table | Implemented |
| FR7 | Show three-address code | Implemented |
| FR8 | Show optimization results with an explanation of each step | Implemented |
| FR9 | Show educational target code and its mapping from the intermediate code | Implemented |
| FR10 | Report lexical, syntax and semantic errors with line and column | Implemented |
| FR11 | Show the pipeline and which phase failed | Implemented |
| FR12 | Save, open, update and delete programs | Implemented |
| FR13 | Keep compilation history (the newest 200 runs per student) | Implemented |
| FR14 | Lessons with completion tracking | Implemented |
| FR15 | Exercises with automatic checking and feedback | Implemented |
| FR16 | Dashboard with totals, recent activity and progress | Implemented |
| FR17 | Admin: statistics, list and delete students | Implemented |
| FR18 | Admin: create, edit and delete lessons and exercises | Implemented |
| FR19 | Admin: edit student accounts | Future |
| FR20 | Conditional statements (`if`/`else`) in EduLang | Future |

## Non-functional requirements

| ID | Requirement | How it is met |
|---|---|---|
| NFR1 | Passwords are never stored in plain text | bcrypt, cost 12 |
| NFR2 | Authentication and role-based authorization | JWT, role read from the database on every request, 403 for the wrong role |
| NFR3 | Users see only their own programs and history | Ownership is part of every query, and another user's record gives 404 |
| NFR4 | Input is validated | Zod schemas on the server, limits mirrored in forms |
| NFR5 | Student code is never executed | The compiler analyzes text only, and there is no `eval` or shell call |
| NFR6 | Abuse limits | Request size limit, general and compiler rate limits, source length limit, nesting limit |
| NFR7 | Secrets stay out of the code and out of Git | Environment variables, `.env` ignored, validated at startup |
| NFR8 | Secure transport and headers | HTTPS on the hosts, Helmet, restricted CORS |
| NFR9 | Maintainability | Layered server, independent compiler modules, shared types |
| NFR10 | Testability | Compiler tested without HTTP, API tests with and without a real database |
| NFR11 | Usability | Light and dark themes, responsive layout, loading, error and empty states |
| NFR12 | Accessibility | Labelled form fields, ARIA roles for tabs and menus, keyboard support. Contrast is not formally audited. |
