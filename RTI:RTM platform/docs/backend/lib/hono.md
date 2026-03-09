# `src/lib/hono.ts`

Factory function `openAPIHono(basePath)` that creates preconfigured OpenAPIHono instances. Sets up a default validation hook that returns 422 errors in RFC 7807 format with detailed error information including message, location, and value for each validation issue.

**Exports:** `openAPIHono(basePath: string)` - returns configured OpenAPIHono instance with base path applied.

**Dependencies:** `@hono/zod-openapi`, `./error/schema`
