# `src/app/users/service.ts`

Users service that handles `/users` routes. Registers the `UserDto` schema in the OpenAPI registry, defines a protected `GET /users` endpoint that returns all auth users from the database, and mounts the nested `self` service for `/users/self` routes.

**Routes:** `GET /users` (protected) - returns `{ users: User[] }`

**Dependencies:** `@feelwell/database`, `@/app/users/schema`, `@/app/users/self/service`, `@/lib/auth/user-middleware`, `@/lib/database`, `@/lib/hono`
