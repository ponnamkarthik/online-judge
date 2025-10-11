# CodeArena Backend

TypeScript Node.js API with MongoDB and JWT-based authentication.

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

## Scripts

- dev: Run with tsx in watch mode
- build: Compile TypeScript
- start: Run compiled JS
- typecheck: tsc noEmit
- lint: ESLint
