# `src/lib/database.ts`

Database client initialization module. Creates and exports a Drizzle ORM client (`db`) connected to PostgreSQL via `SUPABASE_PG_URL` with snake_case column mapping and the shared schema, plus a Supabase client (`supabase`) for auth operations using `SUPABASE_API_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

**Exports:** `db` (Drizzle client), `supabase` (Supabase client)

**Dependencies:** `@feelwell/database`, `@supabase/supabase-js`, `drizzle-orm/postgres-js`, `postgres`
