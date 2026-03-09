# `src/lib/auth/user-middleware.ts`

JWT authentication middleware that extracts the Bearer token from the Authorization header, validates it against Supabase Auth, and sets the authenticated `User` in the Hono context. Throws 401 Unauthorized if the token is missing or invalid.

**Exports:** `authUserMiddleware` - Hono middleware that sets `c.get("user"): User`

**Dependencies:** `@supabase/supabase-js`, `hono/factory`, `@/lib/database`, `@/lib/error/api-error`
