# Auth Module Architecture (`src/lib/auth/`)

This document provides the detailed architecture overview for the `src/lib/auth/` folder.

## Overview

The `auth/` module provides JWT-based authentication middleware using Supabase. It validates Bearer tokens and exposes the authenticated user to route handlers.

## Directory Structure

```text
src/lib/auth/
└── user-middleware.ts    # JWT validation middleware
```

## Design Patterns

### Middleware Pattern

Authentication is implemented as Hono middleware that:

1. Extracts the Bearer token from the `Authorization` header
2. Validates the token against Supabase Auth
3. Sets the authenticated user in the Hono context
4. Calls `next()` to continue the request chain

### Type-Safe Context

The middleware uses `createMiddleware()` with typed variables:

```typescript
createMiddleware<{
  Variables: {
    user: User;
  };
}>
```

This allows route handlers to access `c.get("user")` with full type safety.

## Usage in Routes

Apply middleware to protected routes:

```typescript
import { authUserMiddleware } from "@/lib/auth/user-middleware";

service.openapi(
  createRoute({
    method: "get",
    path: "/protected",
    middleware: authUserMiddleware,
    // ...
  }),
  (c) => {
    const user = c.get("user");  // Type: User
    // ...
  },
);
```

## Common Tasks

### Adding New Auth Middleware

1. Create file: `src/lib/auth/new-middleware.ts`
2. Use `createMiddleware<{ Variables: { ... } }>()` for type safety
3. Follow the same pattern: validate → set context → call next
4. Create docs: `docs/backend/lib/auth/new-middleware.md`
5. Update this file if architecture changed

### Accessing User in Handlers

After `authUserMiddleware` runs, access the user:

```typescript
const user = c.get("user");
// user.id, user.email, user.phone, etc.
```

## Error Handling

Authentication failures use the `unauthorized()` helper from `@/lib/error/api-error`:

- Missing token: `unauthorized("Missing authorization token")`
- Invalid token: `unauthorized("Invalid authorization token")`

## Dependencies

- `@supabase/supabase-js` - User type and Supabase client
- `hono/factory` - createMiddleware utility
- `@/lib/database` - Supabase client instance
- `@/lib/error/api-error` - Error helpers
