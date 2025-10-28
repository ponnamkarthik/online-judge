# Compiler Service

A microservice that runs untrusted code in limited time for the CodeArena platform.

## Endpoints

- `GET /health` – health check
- `POST /execute` – execute code

Request body:

```
{
  "language": "javascript|typescript|python|cpp|java",
  "code": "string",
  "stdin": "string",
  "timeoutMs": 500..10000
}
```

Response:

```
{
  "result": {
    "stdout": "string",
    "stderr": "string",
    "exitCode": number | null,
    "timedOut": boolean,
    "durationMs": number
  }
}
```

## Development

- Node 18+ required
- Install deps and run dev server:

```
npm install
npm run dev
```

The service listens on `PORT` (default 5001). Set `CORS_ORIGIN` for allowed origins (comma-separated).

## Docker

Build and run:

```
docker build -t compiler-service .
docker run -p 5001:5001 compiler-service
```
