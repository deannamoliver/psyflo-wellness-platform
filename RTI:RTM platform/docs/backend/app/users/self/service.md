# `src/app/users/self/service.ts`

Self service that handles `/users/self` routes for the authenticated user. Defines a protected `GET /users/self` endpoint that returns the current user's profile data extracted from the JWT token, using `dateOrNull()` for timestamp conversion.

**Routes:** `GET /users/self` (protected) - returns the authenticated user's `UserDto`

**Dependencies:** `@/app/users/schema`, `@/lib/auth/user-middleware`, `@/lib/hono`, `@/lib/time-utils`
