# supabase.ts

Server-only Supabase client creation using `@supabase/ssr`. Exports `serverSupabase()` which creates a Supabase server client with cookie-based session management for Next.js App Router.

**Usage:**
```typescript
const supabase = await serverSupabase();
const { data: { session } } = await supabase.auth.getSession();
```

**Interacts with:** Next.js `cookies()` for session storage, used by `drizzle.ts` for JWT tokens
