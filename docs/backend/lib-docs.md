# Lib Module Architecture (`src/lib/`)

This document provides the detailed architecture overview for the `src/lib/` folder.

## Overview

The `lib/` module contains shared utilities, middleware, and database clients used across the backend application. It provides foundational infrastructure that resource services depend on.

## Directory Structure

```text
src/lib/
├── hono.ts               # OpenAPIHono factory with validation hook
├── database.ts           # Drizzle + Supabase clients
├── time-utils.ts         # Date/time utility functions
├── auth/
│   └── user-middleware.ts  # JWT authentication middleware
└── error/
    ├── api-error.ts      # HTTP exception helpers
    └── schema.ts         # ErrorModel and ErrorDetail Zod schemas
```

## Design Patterns

### Factory Pattern (hono.ts)

The `openAPIHono()` function is a factory that creates preconfigured OpenAPIHono instances with:

- A default validation hook for request validation errors
- A base path for route prefixing

### Singleton Pattern (database.ts)

Database clients are initialized once and exported as singletons:

- `db` - Drizzle ORM client for PostgreSQL queries
- `supabase` - Supabase client for auth operations

### Error Helper Pattern (api-error.ts)

Typed error helpers that:

- Accept a detail message and optional error details
- Throw HTTPException with proper status codes
- Return type `never` to indicate they always throw

## Subdirectories

### `auth/` - Authentication

Contains middleware for JWT-based authentication using Supabase. See `docs/backend/lib/auth-docs.md` for detailed architecture.

### `error/` - Error Handling

Contains standardized error schemas and helper functions following RFC 7807 Problem Details format. See `docs/backend/lib/error-docs.md` for detailed architecture.

## Common Tasks

### Using the Database

```typescript
import { db } from "@/lib/database";
import { someTable } from "@feelwell/database";

const data = await db.select().from(someTable);
```

### Adding a New Utility Function

1. If it fits an existing category, add to the appropriate file
2. If it's a new category, create a new file in `src/lib/`
3. Keep files under 250 lines - extract if needed
4. Create function-level docs: `docs/backend/lib/<filename>.md`

### Adding New Middleware

1. Read `docs/backend/lib/auth-docs.md` for patterns
2. Create file: `src/lib/<category>/new-middleware.ts`
3. Use `createMiddleware()` from `hono/factory` for type safety
4. Create docs: `docs/backend/lib/<category>/new-middleware.md`

### Adding New Error Types

1. Read `docs/backend/lib/error-docs.md`
2. Add function to `src/lib/error/api-error.ts`
3. Update `docs/backend/lib/error/api-error.md`

## Dependencies

- `@hono/zod-openapi` - OpenAPI types and Hono integration
- `hono/factory` - Middleware creation utilities
- `hono/http-exception` - HTTP exception class
- `drizzle-orm` - Type-safe ORM
- `postgres` - PostgreSQL driver
- `@supabase/supabase-js` - Supabase client SDK
- `@feelwell/database` - Shared database schema

## Environment Variables

| Variable | Used By | Purpose |
| -------- | ------- | ------- |
| `SUPABASE_PG_URL` | `database.ts` | PostgreSQL connection string |
| `SUPABASE_API_URL` | `database.ts` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `database.ts` | Supabase service role key |

## Import Conventions

Use path aliases for imports:

```typescript
import { db } from "@/lib/database";
import { unauthorized } from "@/lib/error/api-error";
```
