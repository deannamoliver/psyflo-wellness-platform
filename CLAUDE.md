# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Read App-Specific Docs First

**Before modifying code, read the relevant CLAUDE.md:**

- **Frontend changes:** Read `apps/frontend/CLAUDE.md`
- **Backend changes:** Read `apps/backend/CLAUDE.md`
- **Database schema:** Read files in `packages/database/src/schema/`

## Project Overview

FeelWell is a student mental wellness platform with an AI chatbot that supports students while alerting counselors to concerning situations.

## Monorepo Structure

```text
apps/
  frontend/     # Next.js 15 (React 19, App Router, Tailwind v4)
  backend/      # Hono API server (Bun runtime)
packages/
  database/     # Drizzle ORM schema, migrations, seeds
```

## Quick Commands

```bash
bun install --frozen-lockfile  # Install dependencies
bun run dev                     # Start all apps
bun run build                   # Build all apps
bun run lint                    # Lint code
bun run format                  # Format code
```

### Database

```bash
bun run db:start     # Start local Supabase
bun run db:generate  # Generate migrations after schema changes
bun run db:migrate   # Apply migrations
```

### Testing

```bash
cd apps/frontend && bun run test  # Run tests
```

## Conventions

### Naming

- Files/folders: `kebab-case`
- Variables/functions: `camelCase`
- Types/Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Git Commits

Format: `tag: Short summary`
Tags: `fix`, `feat`, `docs`, `chore`, `build`, `refactor`, `test`, `ci`, `perf`

## Environment Variables

Run `bun run scripts/setup-env.ts` to create `.env` files.
