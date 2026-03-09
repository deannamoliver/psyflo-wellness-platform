# App Module Architecture (`src/app/`)

This document provides the detailed architecture overview for the `src/app/` folder.

## Overview

The `app/` module contains all API route definitions and OpenAPI configurations. It follows a resource-based structure where each resource (e.g., users) has its own folder with service and schema files.

## Directory Structure

```text
src/app/
├── index.ts              # Main app entry, mounts routes, configures OpenAPI docs
└── users/
    ├── schema.ts         # Zod DTOs with OpenAPI annotations
    ├── service.ts        # /users routes
    └── self/
        └── service.ts    # /users/self routes (nested)
```

## Design Patterns

### Service Pattern

Each resource has a dedicated service file that:

1. Creates an OpenAPIHono instance with a base path
2. Registers DTOs in the OpenAPI registry
3. Defines routes using `createRoute()` from `@hono/zod-openapi`
4. Exports the service as the default export

```typescript
const service = openAPIHono("/users");
service.openAPIRegistry.register("User", UserDto);
service.openapi(createRoute({ ... }), handler);
export default service;
```

### Schema Pattern

DTOs are defined in separate `schema.ts` files using Zod schemas:

1. Define Zod schemas with `.openapi()` annotations for documentation
2. Export the schemas for use in services and type inference
3. Register schemas in the service's OpenAPI registry

### Nested Routes Pattern

Nested resources are organized in subfolders:

1. Create a subfolder (e.g., `users/self/`)
2. Define the nested service with a relative base path (e.g., `/self`)
3. Mount the nested service on the parent: `parentService.route("/", childService)`

## Route Definition

All routes use the OpenAPI-first approach:

```typescript
service.openapi(
  createRoute({
    method: "get",
    path: "/",
    middleware: authUserMiddleware,  // Optional auth
    responses: {
      200: {
        description: "Success description",
        content: {
          "application/json": {
            schema: z.object({ data: DataSchema }),
          },
        },
      },
    },
  }),
  async (c) => {
    // Handler logic
    return c.json({ data });
  },
);
```

## Authentication

Protected routes include `authUserMiddleware` in the route's `middleware` option. After middleware runs, access the authenticated user via `c.get("user")`.

## Common Tasks

### Adding a New Resource

1. Create folder: `src/app/<resource>/`
2. Create `schema.ts` with Zod DTOs
3. Create `service.ts` with routes
4. Mount in `src/app/index.ts`: `app.route("/", resourceService)`
5. Create docs: `docs/backend/app/<resource>/schema.md` and `service.md`
6. Update this file if architecture changed

### Adding Routes to Existing Resource

1. Read the existing service's function-level docs
2. Add new route using `service.openapi(createRoute(...), handler)`
3. Update the function-level docs with new route info

### Adding Nested Routes

1. Create subfolder: `src/app/<parent>/<child>/`
2. Create `service.ts` with `openAPIHono("/<child>")`
3. Mount on parent: `parentService.route("/", childService)`
4. Create docs: `docs/backend/app/<parent>/<child>/service.md`

## Dependencies

- `@hono/zod-openapi` - OpenAPI route definitions and Zod integration
- `@/lib/hono` - OpenAPIHono factory
- `@/lib/auth/user-middleware` - Authentication middleware
- `@/lib/database` - Database client
- `@feelwell/database` - Shared database schema

## Response Format

Always wrap response data in objects:

```typescript
// Correct
return c.json({ users: data });

// Incorrect
return c.json(data);
```

## Error Handling

Use typed error helpers from `@/lib/error/api-error`. These throw HTTPException with proper status codes and return type `never`.
