# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Read This BEFORE Any Work

**BEFORE modifying ANY code file:**

1. **Read the relevant folder-level docs for the task** (e.g., `../docs/backend/app-docs.md`)
2. **Read the relevant function-level docs for the task** (e.g., `../docs/backend/app/users/service.md`)
3. **Understand how it interacts with other files**
4. **Follow the patterns documented there**

**BEFORE committing ANY code:**

1. **Type check the project:** `bunx tsc --noEmit`
2. **ALL must pass - no exceptions**
3. **Update function-level docs** (keep concise: 1-3 sentences)
4. **Update folder-level docs if architecture changed** (keep detailed)
5. **Verify all code files under 250 lines**

## 🛑 MANDATORY PRE-COMMIT CHECKLIST

**Run this command after ANY code change:**

```bash
bunx tsc --noEmit
```

**What this does:**

- Verifies TypeScript code compiles without errors
- Checks for type errors and warnings
- Validates TypeScript syntax and patterns

**If the command fails:**

- ❌ DO NOT proceed
- ❌ DO NOT commit
- ❌ DO NOT mark feature complete
- ✅ Fix the issues first

## 🔴 Mandatory Development Rules

### Rule 1: Read Documentation Before Modifying

**ALWAYS read both documentation types before modifying code:**

1. **Folder-Level Docs (Detailed)** - Read the architecture overview for the folder
2. **Function-Level Docs (Concise)** - Read the specific file documentation

**Two-Tier Documentation System:**

**Folder-Level (Detailed):**

- `../docs/backend/app-docs.md` → Architecture overview for `src/app/` folder
- `../docs/backend/lib-docs.md` → Architecture overview for `src/lib/` folder

**Function-Level (Concise: 1-3 sentences):**

- `../docs/backend/app/index.md` → Documents `src/app/index.ts`
- `../docs/backend/app/users/service.md` → Documents `src/app/users/service.ts`
- `../docs/backend/app/users/schema.md` → Documents `src/app/users/schema.ts`
- `../docs/backend/lib/hono.md` → Documents `src/lib/hono.ts`
- `../docs/backend/lib/database.md` → Documents `src/lib/database.ts`
- `../docs/backend/lib/auth/user-middleware.md` → Documents `src/lib/auth/user-middleware.ts`

**After modifying code, update both documentation types:**

**Function-Level (keep concise: 1-3 sentences):**

- What the file/function does
- Key interactions with other files

**Folder-Level (keep detailed, update if architecture changed):**

- Design patterns and common tasks
- How files work together
- When to add new files vs modify existing

### Rule 2: 250 Line Maximum (Extreme Modularity)

**Every code file MUST be under 250 lines. Documentation files (*.md) are exempt.**

**When a code file approaches 250 lines:**

1. Identify logical boundaries
2. Extract to new focused files
3. Update imports
4. Create corresponding `../docs/backend/**/*.md` files

### Rule 3: Build-Driven Completion

**A feature is NOT complete until:**

1. ✅ All code written (under 250 lines per file)
2. ✅ `bunx tsc --noEmit` passes
3. ✅ No TypeScript warnings
4. ✅ `../docs/backend/**/*.md` updated

### Rule 4: Minimal, High-Level Logging

**DO Log (high-level, critical):**

- ✅ Server startup/shutdown
- ✅ Authentication failures
- ✅ Database connection errors
- ✅ External API failures
- ✅ Unhandled exceptions

**DO NOT Log (low-level, verbose):**

- ❌ Function entry/exit
- ❌ Variable values during processing
- ❌ User data content (privacy risk)
- ❌ Every HTTP request/response

## Documentation Structure

**Two-tier system: Folder-level (detailed) + Function-level (concise)**

### Folder-Level Docs (Detailed)

**Format:** `../docs/backend/<foldername>-docs.md`

**Examples:**

- `../docs/backend/app-docs.md` → Architecture overview for `src/app/`
- `../docs/backend/lib-docs.md` → Architecture overview for `src/lib/`
- `../docs/backend/lib/error-docs.md` → Architecture overview for `src/lib/error/`
- `../docs/backend/lib/auth-docs.md` → Architecture overview for `src/lib/auth/`

**Content (Detailed):**

- Design patterns and architectural decisions
- Common tasks and how to approach them
- How files in the folder work together
- When to add new files vs modify existing ones
- Dependencies and integration points

**Purpose:** Read BEFORE working in that folder to understand the big picture

### Function-Level Docs (Concise)

**Location:** `../docs/backend/**/*.md` mirroring code structure (1:1 mapping)

**Examples:**

- `../docs/backend/app/index.md` → Documents `src/app/index.ts`
- `../docs/backend/app/users/service.md` → Documents `src/app/users/service.ts`
- `../docs/backend/lib/hono.md` → Documents `src/lib/hono.ts`

**Content (Concise: 1-3 sentences):**

- What the file/function does
- Key interactions with other files
- Public functions/types overview

**Purpose:** Read BEFORE modifying specific files

### Full Structure

```text
apps/
├── backend/
│   └── src/
│       ├── app/
│       │   ├── index.ts              # Main app entry, mounts routes
│       │   └── users/
│       │       ├── service.ts        # /users routes
│       │       ├── schema.ts         # Zod DTOs (UserDto)
│       │       └── self/
│       │           └── service.ts    # /users/self routes
│       └── lib/
│           ├── hono.ts               # OpenAPIHono factory
│           ├── database.ts           # Drizzle + Supabase clients
│           ├── time-utils.ts         # Date utilities
│           ├── auth/
│           │   └── user-middleware.ts  # JWT auth middleware
│           └── error/
│               ├── api-error.ts      # HTTP exception helpers
│               └── schema.ts         # ErrorModel Zod schema
└── docs/
    └── backend/
        ├── app-docs.md               # Folder-level (detailed)
        ├── lib-docs.md               # Folder-level (detailed)
        ├── app/
        │   ├── index.md              # Function-level (concise)
        │   └── users/
        │       ├── service.md        # Function-level (concise)
        │       ├── schema.md         # Function-level (concise)
        │       └── self/
        │           └── service.md    # Function-level (concise)
        └── lib/
            ├── hono.md               # Function-level (concise)
            ├── database.md           # Function-level (concise)
            ├── time-utils.md         # Function-level (concise)
            ├── auth-docs.md          # Folder-level (detailed)
            ├── auth/
            │   └── user-middleware.md  # Function-level (concise)
            ├── error-docs.md         # Folder-level (detailed)
            └── error/
                ├── api-error.md      # Function-level (concise)
                └── schema.md         # Function-level (concise)
```

## Quick Reference

### Most Common Commands

```bash
# Development
bun run dev                       # Start dev server (hot reload, port 8000)
bun run --hot src/app/index.ts    # Start dev server directly

# Type Checking
bunx tsc --noEmit                 # Type check without emitting files

# Testing API
curl http://localhost:8000/api/docs/json  # Get OpenAPI spec
open http://localhost:8000/api/docs       # Open Scalar docs UI
```

### Before Every Commit

```bash
# 1. Run mandatory type check
bunx tsc --noEmit

# 2. Verify documentation updated
# Check that ../docs/backend/**/*.md reflects code changes

# 3. Verify line counts
# All code files under 250 lines
```

### Feature Completion Checklist

- [ ] Code written and under 250 lines per file
- [ ] Read folder-level docs before working in folder
- [ ] Read function-level docs before modifying specific files
- [ ] `bunx tsc --noEmit` passes
- [ ] No TypeScript warnings
- [ ] Function-level docs updated (concise: 1-3 sentences)
- [ ] Folder-level docs updated if architecture changed (detailed)
- [ ] Logging is minimal and high-level only

## Project Overview

**@feelwell/backend** is a Hono-based REST API running on Bun that provides authenticated endpoints for the FeelWell mental wellness platform.

**Database Schema:** See `packages/database/src/schema/` for all table definitions (profile, school, chat-sessions, wellness-coach, alert, checkin, screener, admin tables).

**Key Technologies:**

- Bun runtime
- Hono web framework
- @hono/zod-openapi for OpenAPI spec generation
- Drizzle ORM with PostgreSQL
- Supabase for authentication
- Scalar for API documentation UI

**Core Components:**

1. **App Entry** (`src/app/`) - Route definitions and OpenAPI configuration
2. **Lib** (`src/lib/`) - Shared utilities, middleware, and database clients
3. **Auth** (`src/lib/auth/`) - Authentication middleware using Supabase JWT
4. **Error** (`src/lib/error/`) - Standardized error handling and schemas
5. **Documentation** (`../docs/backend/`) - Per-file code documentation

## Development Commands

### Running the Application

```bash
# Start dev server with hot reload
bun run dev

# Or run directly
bun run --hot src/app/index.ts --port 8000
```

### Type Checking

```bash
# Check types without building
bunx tsc --noEmit
```

### API Documentation

```bash
# View API docs in browser
open http://localhost:8000/api/docs

# Get raw OpenAPI JSON
curl http://localhost:8000/api/docs/json
```

## Code Organization Patterns

### Adding New Resource Service

1. Read `../docs/backend/app-docs.md` (folder-level, detailed)
2. Create folder: `src/app/<resource>/`
3. Create files:
   - `schema.ts` - Zod DTOs with `.openapi()` annotations
   - `service.ts` - Routes using `openAPIHono(basePath)`
4. Create function-level docs:
   - `../docs/backend/app/<resource>/schema.md` (concise: 1-3 sentences)
   - `../docs/backend/app/<resource>/service.md` (concise: 1-3 sentences)
5. Mount in `src/app/index.ts`
6. Run checklist: `bunx tsc --noEmit`
7. Update `../docs/backend/app-docs.md` if you changed the architecture

### Adding New Middleware

1. Read `../docs/backend/lib-docs.md` (folder-level, detailed)
2. Create file: `src/lib/<category>/new-middleware.ts`
3. Create function-level docs: `../docs/backend/lib/<category>/new-middleware.md` (concise: 1-3 sentences)
4. Export from appropriate index if needed
5. Run checklist
6. Update `../docs/backend/lib-docs.md` if you changed the architecture

### Adding New Error Type

1. Read `../docs/backend/lib/error-docs.md` (folder-level, detailed)
2. Add function to `src/lib/error/api-error.ts`
3. Update `../docs/backend/lib/error/api-error.md`
4. Run checklist
5. Update `../docs/backend/lib/error-docs.md` if you changed the architecture

### Adding Nested Routes

1. Read parent service's function-level docs
2. Create nested folder: `src/app/<parent>/<child>/`
3. Create `service.ts` with `openAPIHono("/<child>")`
4. Create function-level docs: `../docs/backend/app/<parent>/<child>/service.md`
5. Mount on parent: `parentService.route("/", childService)`
6. Run checklist

## Environment Variables

| Variable | Description | Default | Required |
| -------- | ----------- | ------- | -------- |
| `SUPABASE_PG_URL` | PostgreSQL connection string | None | Yes |
| `SUPABASE_API_URL` | Supabase project URL | None | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | None | Yes |

## Architecture Overview

### Core Components

1. **App Entry** (`src/app/`)
   - `index.ts` - Main Hono app, mounts all routes, configures OpenAPI docs

2. **Resource Services** (`src/app/<resource>/`)
   - `service.ts` - OpenAPI routes with Zod validation
   - `schema.ts` - Zod DTOs registered in OpenAPI registry
   - Nested `<subresource>/service.ts` for sub-routes

3. **Lib - Shared Utilities** (`src/lib/`)
   - `hono.ts` - OpenAPIHono factory with default validation hook
   - `database.ts` - Drizzle client + Supabase client exports
   - `time-utils.ts` - Date/time utility functions

4. **Auth - Authentication** (`src/lib/auth/`)
   - `user-middleware.ts` - JWT validation middleware, sets `c.get("user")`

5. **Error - Error Handling** (`src/lib/error/`)
   - `api-error.ts` - Typed HTTP exception helpers (badRequest, notFound, etc.)
   - `schema.ts` - ErrorModel and ErrorDetail Zod schemas

### Key Design Patterns

- **OpenAPI-First**: All routes defined with `createRoute()` and Zod schemas
- **Service Pattern**: Each resource gets its own service file with `openAPIHono(basePath)`
- **Middleware Composition**: Auth middleware injected per-route via `middleware` option
- **Typed Errors**: Error helpers return `never` type, throw HTTPException
- **DTO Registration**: Schemas registered in OpenAPI registry for proper references
- **Path Aliases**: Use `@/` prefix for imports from `src/`

### Database Integration

- **Drizzle ORM**: Type-safe queries using shared schema from `@feelwell/database`
- **Supabase Client**: Used for auth operations (JWT validation)
- **Connection**: PostgreSQL via `SUPABASE_PG_URL`

## Important Notes

### OpenAPI Routes

- Always use `createRoute()` from `@hono/zod-openapi`
- Register DTOs with `service.openAPIRegistry.register("Name", Schema)`
- Wrap response data in objects: `{ users: data }` not `data`

### Authentication

- Apply `authUserMiddleware` to protected routes
- Access user via `c.get("user")` after middleware runs
- User object is Supabase `User` type

### Error Handling

- Use typed helpers from `@/lib/error/api-error`
- All helpers throw and have return type `never`
- Errors follow RFC 7807 Problem Details format

## Documentation Workflow

```text
Code Change → Read Folder-Level Docs → Read Function-Level Docs → Modify Code → Run Type Check → Update Both Doc Types → Commit
```

**Example:**

1. Want to modify `src/app/users/service.ts`
2. Read `../docs/backend/app-docs.md` first (folder-level, detailed architecture)
3. Read `../docs/backend/app/users/service.md` second (function-level, concise: 1-3 sentences)
4. Make changes to `src/app/users/service.ts`
5. Run: `bunx tsc --noEmit`
6. Update `../docs/backend/app/users/service.md` with changes (keep concise: 1-3 sentences)
7. Update `../docs/backend/app-docs.md` if architecture changed (keep detailed)
8. Verify all files under 250 lines (code only, docs exempt)
9. Commit all files together

## See Also

- **`README.md`** - User-facing documentation
- **`../docs/backend/`** - Per-file code documentation
