# `src/app/users/schema.ts`

Defines the `UserDto` Zod schema for user data transfer objects. Contains fields for `id`, `email` (nullable), `phone` (nullable), `createdAt` (ISO datetime, nullable), and `updatedAt` (ISO datetime, nullable).

**Exports:** `UserDto` - Zod schema used in users service responses and self service responses.

**Dependencies:** `@hono/zod-openapi`
