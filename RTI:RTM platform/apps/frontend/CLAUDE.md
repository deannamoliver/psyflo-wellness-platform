# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Read This BEFORE Any Work

**BEFORE modifying ANY code file:**

1. **Read the relevant folder-level docs for the task** (e.g., `../docs/frontend/app-docs.md`)
2. **Read the relevant function-level docs for the task** (e.g., `../docs/frontend/lib/langgraph/main-graph.md`)
3. **Understand how it interacts with other files**
4. **Follow the patterns documented there**

**BEFORE committing ANY code:**

1. **Lint the project:** `bun run lint`
2. **Build the project:** `bun run build`
3. **Run tests if modified:** `bun run test`
4. **ALL must pass - no exceptions**
5. **Update function-level docs** (keep concise: 1-3 sentences)
6. **Update folder-level docs if architecture changed** (keep detailed)
7. **Verify all code files under 250 lines**

## 🛑 MANDATORY PRE-COMMIT CHECKLIST

**Run these commands after ANY code change:**

```bash
bun run lint
bun run build
```

**If working on LangGraph or tests:**

```bash
bun run test
```

**What these do:**

- `lint` - Checks code style with Biome
- `build` - Verifies Next.js builds without errors
- `test` - Runs Vitest tests

**If any command fails:**

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

- `../docs/frontend/app-docs.md` → Architecture overview for `src/app/` folder
- `../docs/frontend/lib-docs.md` → Architecture overview for `src/lib/` folder
- `../docs/frontend/lib/langgraph-docs.md` → Architecture overview for LangGraph system

**Function-Level (Concise: 1-3 sentences):**

- `../docs/frontend/lib/langgraph/main-graph.md` → Documents `src/lib/langgraph/main-graph.ts`
- `../docs/frontend/lib/database/drizzle.md` → Documents `src/lib/database/drizzle.ts`

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
4. Create corresponding `../docs/frontend/**/*.md` files

### Rule 3: Build-Driven Completion

**A feature is NOT complete until:**

1. ✅ All code written (under 250 lines per file)
2. ✅ `bun run lint` passes
3. ✅ `bun run build` passes
4. ✅ `bun run test` passes (if tests exist)
5. ✅ `../docs/frontend/**/*.md` updated

### Rule 4: Colocated ~lib/ Convention

**Page-specific components live in `~lib/` folders next to the page:**

```text
app/dashboard/student/home/
  page.tsx           # Server component, minimal logic
  ~lib/
    dashboard-client.tsx    # Client component with state
    chat-history-sidebar.tsx
    main-chat-area.tsx
```

**Rules:**

- `~lib/` folders are for page-specific code only
- Shared code goes in `src/lib/`
- Name files descriptively for their purpose

### Rule 5: Minimal, High-Level Logging

**DO Log (high-level, critical):**

- ✅ Authentication failures
- ✅ LangGraph node transitions (for debugging)
- ✅ Risk detection results
- ✅ External API failures
- ✅ Unhandled exceptions

**DO NOT Log (low-level, verbose):**

- ❌ Function entry/exit
- ❌ Variable values during processing
- ❌ User data content (privacy risk)
- ❌ Every HTTP request/response

## Documentation Structure

### Two-Tier System

Folder-level (detailed) + Function-level (concise)

### Folder-Level Docs (Detailed)

**Format:** `../docs/frontend/<foldername>-docs.md`

**Examples:**

- `../docs/frontend/app-docs.md` → Architecture overview for `src/app/`
- `../docs/frontend/lib-docs.md` → Architecture overview for `src/lib/`
- `../docs/frontend/lib/langgraph-docs.md` → Architecture for `src/lib/langgraph/`

**Content (Detailed):**

- Design patterns and architectural decisions
- Common tasks and how to approach them
- How files in the folder work together
- When to add new files vs modify existing ones
- Dependencies and integration points

**Purpose:** Read BEFORE working in that folder to understand the big picture

### Function-Level Docs (Concise)

**Location:** `../docs/frontend/**/*.md` mirroring code structure (1:1 mapping)

**Examples:**

- `../docs/frontend/lib/langgraph/main-graph.md` → Documents `src/lib/langgraph/main-graph.ts`
- `../docs/frontend/lib/database/drizzle.md` → Documents `src/lib/database/drizzle.ts`

**Content (Concise: 1-3 sentences):**

- What the file/function does
- Key interactions with other files
- Public functions/types overview

**Purpose:** Read BEFORE modifying specific files

## Project Overview

**@feelwell/frontend** is a Next.js 15 application (React 19, App Router) that provides the student and counselor interfaces for the FeelWell mental wellness platform.

**Database Schema:** See `packages/database/src/schema/` for all table definitions (profile, school, chat-sessions, wellness-coach, alert, checkin, screener, admin tables).

**Key Technologies:**

- Next.js 15 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- LangGraph for AI conversation orchestration
- Drizzle ORM with PostgreSQL
- Supabase for authentication
- Vitest for testing

**Core Components:**

1. **App Router** (`src/app/`) - Pages, layouts, and API routes
2. **Lib** (`src/lib/`) - Shared utilities, components, and services
3. **LangGraph** (`src/lib/langgraph/`) - AI conversation engine with risk detection
4. **Core UI** (`src/lib/core-ui/`) - shadcn/ui base components
5. **Extended UI** (`src/lib/extended-ui/`) - Custom components including AI chat

## Development Commands

### Running the Application

```bash
# Start dev server with Turbopack
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Linting and Formatting

```bash
# Lint code
bun run lint

# Format code (from root)
bun run format
```

### Testing

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# Single file
bunx vitest <file>
```

### OpenAPI Generation

```bash
# Generate types from backend OpenAPI spec
bun run gen-openapi
```

### LangGraph Development

```bash
# Start LangGraph dev server for debugging
bun run langsmith
```

## Code Organization

### App Router Structure

```text
src/app/
├── (auth)/              # Authentication routes (login, signup, welcome)
├── dashboard/
│   ├── student/         # Student dashboard (chat, check-ins, wellness)
│   └── counselor/        # Counselor dashboard (alerts, analytics)
├── admin/               # Admin tools (evals, prompt testing)
├── onboarding/
│   └── student/         # Student profile setup wizard
├── api/                 # API routes (chat, auth)
└── page.tsx             # Landing page
```

### Lib Organization

```text
src/lib/
├── core-ui/             # shadcn/ui base components (42 components)
├── extended-ui/         # Custom components
│   └── ai/              # AI chat UI (conversation, message, input, etc.)
├── langgraph/           # AI conversation engine
│   ├── prompts/         # System prompts
│   ├── risk-protocol/   # Risk assessment subgraphs
│   └── tools/           # LangGraph tools
├── database/            # Drizzle + Supabase clients
├── api/                 # HTTP clients and OpenAPI types
├── chat/                # Chat components and API
├── alerts/              # Alert components and actions
├── student-alerts/      # Student-grouped alert system
├── screener/            # Wellness assessment
├── check-in/            # Mood check-in utilities
├── auth/                # Authentication utilities
└── [utilities]          # Various utility files
```

### Adding New Pages

1. Read `../docs/frontend/app-docs.md` (folder-level, detailed)
2. Create folder: `src/app/<route>/`
3. Create files:
   - `page.tsx` - Server component (data fetching, layout)
   - `~lib/*.tsx` - Client components (interactivity)
4. Create function-level docs in `../docs/frontend/app/<route>/`
5. Run checklist: `bun run lint && bun run build`
6. Update `../docs/frontend/app-docs.md` if architecture changed

### Adding New Lib Modules

1. Read `../docs/frontend/lib-docs.md` (folder-level, detailed)
2. Create folder: `src/lib/<module>/`
3. Create files:
   - `index.ts` - Public exports
   - Feature-specific files
4. Create docs:
   - `../docs/frontend/lib/<module>-docs.md` (folder-level if complex)
   - `../docs/frontend/lib/<module>/*.md` (function-level for each file)
5. Run checklist
6. Update `../docs/frontend/lib-docs.md` if architecture changed

### Adding LangGraph Nodes

1. Read `../docs/frontend/lib/langgraph-docs.md` (folder-level, detailed)
2. Add node in appropriate location:
   - `main-graph.ts` - For main conversation flow
   - `risk-protocol/subgraphs/` - For risk-specific handling
3. Add prompts to `prompts/` folder
4. Update node-prompt mapping in `node-prompt-map.ts`
5. Add tests in `langgraph.test.ts` or `langgraph_risk_detector.test.ts`
6. Run: `bun run test`
7. Update docs

## LangGraph AI System

### Architecture Overview

The AI chatbot uses LangGraph for conversation flow with risk detection:

```text
User Message
     ↓
analyzeRiskNode (Gemini 2.5 Flash)
     ↓
[Risk Detected?]
  Yes → risk_protocol subgraph → createAlertsNode
  No  → base_agent (normal conversation)
     ↓
[Escalation Needed?]
  Yes → handoverToCoachNode
     ↓
Response to User
```

### Risk Types

| Type            | Description                                    | Subgraph           |
| --------------- | ---------------------------------------------- | ------------------ |
| `direct`        | Immediate safety concerns (suicide, self-harm) | `direct-risk.ts`   |
| `indirect`      | Concerning patterns (substance abuse)          | `indirect-risk.ts` |
| `ambiguous`     | Needs clarification                            | `ambiguous-risk.ts`|
| `abuse_neglect` | Abuse/neglect indicators                       | `abuse-neglect.ts` |
| `harm_to_others`| Violence concerns                              | `harm-others.ts`   |

### Key Files

| File                           | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `main-graph.ts`                | Main StateGraph orchestration        |
| `base-agent.ts`                | Normal conversation handling         |
| `risk-protocol/risk-router.ts` | Routes to appropriate risk subgraph  |
| `checkpointer.ts`              | PostgreSQL conversation persistence  |
| `prompts/`                     | System prompts for each node         |

### Testing LangGraph

```bash
# Run LangGraph tests
bun run test langgraph

# Use LangSmith for debugging
bun run langsmith
```

## Key Patterns

### Server vs Client Components

```tsx
// page.tsx - Server Component (default)
export default async function Page() {
  const data = await fetchData(); // Server-side data fetching
  return <ClientComponent initialData={data} />;
}

// ~lib/client-component.tsx - Client Component
"use client";
export function ClientComponent({ initialData }) {
  const [state, setState] = useState(initialData);
  // Interactive logic here
}
```

### Database Access

```typescript
import { db } from "@/lib/database/drizzle";

// With Row-Level Security
const result = await db.rls(async (tx) => {
  return tx.select().from(users).where(eq(users.id, userId));
});

// Get current user ID
const userId = db.userId();
```

### Server Actions

```typescript
"use server";

export async function updateAlert(alertId: string, data: UpdateData) {
  // Validate input
  // Update database
  // Revalidate cache
  revalidatePath("/dashboard/counselor/alerts");
}
```

### Form State

Use `nuqs` for URL-synchronized state:

```typescript
import { useQueryState } from "nuqs";

const [filter, setFilter] = useQueryState("filter");
```

## Environment Variables

| Variable                       | Description                         | Required |
| ------------------------------ | ----------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anonymous key              | Yes      |
| `SUPABASE_URL`                 | Supabase project URL                | Yes      |
| `POSTGRES_URL`                 | PostgreSQL connection string        | Yes      |
| `GOOGLE_API_KEY`               | Google AI API key                   | Yes      |
| `SIGNUP_COOKIE_SECRET`         | OTP cookie secret (64 hex chars)    | Yes      |

## Quick Reference

### Most Common Commands

```bash
# Development
bun run dev              # Start dev server

# Validation
bun run lint             # Lint code
bun run build            # Build project
bun run test             # Run tests

# Database
bun run db:start         # Start local Supabase
bun run db:migrate       # Apply migrations
```

### Before Every Commit

```bash
# 1. Run mandatory checks
bun run lint
bun run build

# 2. Run tests if modified test files or LangGraph
bun run test

# 3. Verify documentation updated
# Check that ../docs/frontend/**/*.md reflects code changes

# 4. Verify line counts
# All code files under 250 lines
```

### Feature Completion Checklist

- [ ] Code written and under 250 lines per file
- [ ] Read folder-level docs before working in folder
- [ ] Read function-level docs before modifying specific files
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] `bun run test` passes (if tests exist)
- [ ] Function-level docs updated (concise: 1-3 sentences)
- [ ] Folder-level docs updated if architecture changed (detailed)
- [ ] Logging is minimal and high-level only

## Documentation Workflow

```text
Code Change → Read Folder-Level Docs → Read Function-Level Docs → Modify Code → Run Checks → Update Both Doc Types → Commit
```

**Example:**

1. Want to modify `src/lib/langgraph/main-graph.ts`
2. Read `../docs/frontend/lib/langgraph-docs.md` first (folder-level, detailed)
3. Read `../docs/frontend/lib/langgraph/main-graph.md` second (function-level, concise)
4. Make changes to `src/lib/langgraph/main-graph.ts`
5. Run: `bun run lint && bun run build && bun run test`
6. Update `../docs/frontend/lib/langgraph/main-graph.md` with changes (keep concise)
7. Update `../docs/frontend/lib/langgraph-docs.md` if architecture changed (keep detailed)
8. Verify all files under 250 lines (code only, docs exempt)
9. Commit all files together

## See Also

- **`README.md`** - User-facing documentation
- **`../docs/frontend/`** - Per-file code documentation
- **`src/lib/student-alerts/README.md`** - Alert grouping system documentation
- **`src/app/admin/README.md`** - Admin evaluation framework documentation
