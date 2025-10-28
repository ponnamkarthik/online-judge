# CodeArena Backend

TypeScript Node.js API with MongoDB and JWT-based authentication.

Now split into two services:

- API (this folder)
- Compiler (execute microservice) at `../compiler`

## Endpoints

- POST /api/auth/register — email, username, password
- POST /api/auth/login — email, password
- GET /api/auth/me — current user (requires auth)
- POST /api/auth/refresh — rotates refresh token and returns new tokens via cookies
- POST /api/auth/logout — revokes refresh session and clears cookies

## Setup

1. Copy `.env.example` to `.env` and fill secrets.
2. Install dependencies.
3. Start dev server.

Env variables:

- `COMPILER_URL` (optional): Base URL of the compiler microservice. Defaults to `http://localhost:5001` in dev. In Docker Compose it's set to `http://compiler:5001`.

### Docker Compose (dev)

From this `backend/` directory:

```
docker compose up --build
```

This starts:

- api at http://localhost:4000
- compiler at http://localhost:5001

## Scripts

- dev: Run with tsx in watch mode
- build: Compile TypeScript
- start: Run compiled JS
- typecheck: tsc noEmit
- lint: ESLint
