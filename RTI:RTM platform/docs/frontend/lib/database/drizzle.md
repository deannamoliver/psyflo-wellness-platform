# drizzle.ts

Server-only Drizzle ORM client with Supabase Row-Level Security (RLS) support. Exports `serverDrizzle()` which returns an object with `admin` (bypasses RLS), `userId()` (gets authenticated user ID), and `rls()` (executes queries within RLS context by setting JWT claims).

**Usage:**
```typescript
const db = await serverDrizzle();
const userId = db.userId(); // Throws if not authenticated
await db.rls(async (tx) => tx.select().from(users)); // With RLS
await db.admin.insert(alerts).values({ ... }); // Without RLS
```

**Interacts with:** `supabase.ts` for session tokens, `@feelwell/database` for schema
