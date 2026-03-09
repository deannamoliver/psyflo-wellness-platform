# `src/lib/error/schema.ts`

Zod schemas for RFC 7807 Problem Details error responses. Defines `ErrorDetail` for individual validation errors (message, location, value) and `ErrorModel` for the complete error response (title, status, detail, optional errors array). Includes `ContentfulStatusCode` as a union of valid HTTP status codes.

**Exports:** `ErrorDetail` (schema + type), `ErrorModel` (schema + type)

**Dependencies:** `@hono/zod-openapi`
