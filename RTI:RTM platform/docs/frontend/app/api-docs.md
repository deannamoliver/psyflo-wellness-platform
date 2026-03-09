# API Routes Documentation (`src/app/api/`)

This document provides architecture documentation for API routes in the FeelWell frontend.

## Overview

API routes handle server-side HTTP endpoints for authentication, chat, and other backend operations using Next.js Route Handlers.

## Directory Structure

```text
api/
├── auth/
│   └── logout/route.ts       # Logout endpoint
└── chat/
    ├── route.ts              # Main chat POST endpoint
    ├── stream/route.ts       # Streaming chat endpoint
    ├── sessions/
    │   ├── route.ts          # Session CRUD
    │   └── [sessionId]/
    │       ├── route.ts      # Individual session
    │       └── title/route.ts # Update title
    └── trace/
        └── [sessionId]/route.ts  # Execution trace
```

## Key Endpoints

### Chat Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Send message, get response |
| `/api/chat/stream` | POST | Streaming chat response |
| `/api/chat/sessions` | GET | List user's sessions |
| `/api/chat/sessions` | POST | Create new session |
| `/api/chat/sessions/[id]` | GET | Get session details |
| `/api/chat/sessions/[id]` | DELETE | Delete session |
| `/api/chat/sessions/[id]/title` | PATCH | Update title |
| `/api/chat/trace/[id]` | GET | Get execution trace |

### Auth Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/logout` | POST | Clear session, logout |

## Key Patterns

### Route Handler Structure

```typescript
// route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Authenticate
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process request
  const body = await request.json();

  // Return response
  return NextResponse.json({ data: result });
}
```

### Dynamic Route Parameters

```typescript
// [sessionId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;
  // Use sessionId...
}
```

### Streaming Responses

```typescript
// stream/route.ts
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of chatStream) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
```

## Chat Flow

1. Client sends message to `/api/chat`
2. Server authenticates user
3. Message processed by LangGraph
4. Response streamed back (if streaming)
5. Session and messages persisted

## Common Tasks

### Adding New API Route

1. Create folder: `api/<path>/`
2. Add `route.ts` with HTTP method handlers
3. Implement authentication check
4. Add proper error handling
5. Document endpoint in this file

### Modifying Chat Endpoint

1. Main logic: `api/chat/route.ts`
2. LangGraph integration: `lib/langgraph/`
3. Session management: `api/chat/sessions/`

## Error Handling

```typescript
try {
  // Operation
  return NextResponse.json({ data });
} catch (error) {
  console.error("API error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## See Also

- **`../lib/chat/api.md`** - Chat API utilities
- **`../lib/langgraph-docs.md`** - AI system documentation
- **`../lib/database/`** - Database access
