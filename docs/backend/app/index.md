# `src/app/index.ts`

Main application entry point that creates the root OpenAPIHono app at `/api`, registers the `ErrorModel` schema, configures OpenAPI documentation at `/docs` and `/docs/json`, and mounts the users service.

**Exports:** Default export with `{ port: 8000, fetch: app.fetch }` for Bun server.

**Dependencies:** `@scalar/hono-api-reference`, `@/lib/error/schema`, `@/lib/hono`, `./users/service`
