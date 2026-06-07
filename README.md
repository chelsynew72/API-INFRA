# API Infrastructure — NestJS

A production-grade API showcasing every major system design concept built with NestJS + TypeScript.

## System Design Concepts Implemented

| Concept | Where |
|---|---|
| **JWT Authentication** | `modules/auth` — Bearer token, HTTP-only strategy |
| **RBAC (Role-Based Access Control)** | `common/guards/roles.guard.ts` — Admin vs User |
| **Rate Limiting / Throttling** | `ThrottlerModule` — 60 req/min global, 30/min on list endpoints |
| **Cache-Aside Pattern** | `products.service.ts` — Redis cache with TTL + invalidation |
| **Pagination** | `common/pipes/pagination.dto.ts` — page/limit on all list endpoints |
| **Background Job Queue** | `queue/notifications.processor.ts` — BullMQ + Redis |
| **Retry with Exponential Backoff** | `http-client/http-client.service.ts` — axios-retry, 3 attempts |
| **Circuit Breaker** | `http-client/http-client.service.ts` — opens after 5 failures |
| **Correlation IDs** | `common/middleware/correlation-id.middleware.ts` — per-request tracing |
| **Global Exception Filter** | `common/filters/http-exception.filter.ts` — standardised errors |
| **Response Envelope** | `common/interceptors/transform.interceptor.ts` — `{ success, data, timestamp }` |
| **Structured Logging** | `common/interceptors/logging.interceptor.ts` — method + URL + status + ms |
| **Input Validation** | `ValidationPipe` + `class-validator` on all DTOs |
| **Database Indexing** | `user.entity.ts` + `product.entity.ts` — indexed search columns |
| **Graceful Shutdown** | `main.ts` — `enableShutdownHooks()` |
| **Compression** | `main.ts` — gzip via `compression` middleware |
| **Security Headers** | `main.ts` — `helmet()` |
| **Swagger API Docs** | `main.ts` — auto-generated at `/docs` |
| **Dead-Letter Queue** | `notifications.processor.ts` — `@OnQueueFailed` handler |
| **Health Check Endpoint** | `modules/health` — DB + memory + uptime |

## Quick Start

```bash
# 1. Start PostgreSQL + Redis
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Copy env
cp .env.example .env

# 4. Run in development
npm run start:dev

# 5. Open Swagger docs
open http://localhost:3000/docs
```

## Project Structure

```
src/
├── config/               # Typed config namespaces (app, db, redis, jwt)
├── common/
│   ├── decorators/       # @CurrentUser, @Roles
│   ├── filters/          # Global exception filter
│   ├── guards/           # RolesGuard
│   ├── interceptors/     # Logging + Transform (response envelope)
│   ├── middleware/       # Correlation ID
│   └── pipes/            # PaginationDto
├── database/             # TypeORM entities (indexed)
├── http-client/          # Axios + retry + circuit breaker
├── queue/                # BullMQ processors + dead-letter handler
└── modules/
    ├── auth/             # JWT register/login, strategy
    ├── products/         # CRUD with caching + RBAC + external API demo
    └── health/           # Health check endpoint
```
