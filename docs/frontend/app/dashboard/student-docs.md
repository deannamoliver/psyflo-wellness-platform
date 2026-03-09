# Student Dashboard Documentation (`src/app/dashboard/student/`)

This document provides architecture documentation for the student dashboard in the FeelWell frontend.

## Overview

The student dashboard is the main interface for students to interact with the FeelWell AI chatbot, track their wellness, and access resources.

## Directory Structure

```text
dashboard/student/
├── page.tsx              # Redirect to home
├── layout.tsx            # Student dashboard layout with sidebar
├── home/
│   ├── page.tsx          # Main dashboard page
│   └── ~lib/             # Page-specific components
│       ├── dashboard-client.tsx    # Main client component
│       ├── main-chat-area.tsx      # Chat interface
│       ├── chat-history-sidebar.tsx
│       ├── welcome-header.tsx
│       ├── right-sidebar.tsx
│       ├── chatbot-promo.tsx
│       ├── hitlist/      # Daily tasks
│       └── journey/      # Wellness journey cards
├── chat/
│   ├── page.tsx          # Chat redirect
│   ├── layout.tsx        # Chat layout
│   └── [sessionId]/      # Individual chat session
│       ├── page.tsx
│       └── actions.ts
├── check-in/
│   ├── page.tsx          # Daily mood check-in
│   ├── loading.tsx
│   ├── error.tsx
│   └── ~lib/
├── wellness-check/
│   ├── page.tsx          # Wellness screener
│   ├── [responseId]/     # Active screener response
│   └── completed/page.tsx
├── discover/page.tsx     # Resource discovery
├── quests/page.tsx       # Wellness quests
├── toolbox/page.tsx      # Coping tools
├── settings/
│   ├── page.tsx
│   ├── change-password/page.tsx
│   └── ~lib/
└── more/
    ├── page.tsx
    ├── emergency-resources/page.tsx
    ├── privacy-policy/page.tsx
    └── terms-and-conditions/page.tsx
```

## Key Features

### Home Dashboard

The home page provides:
- AI chat interface
- Daily hitlist (check-in, wellness check)
- Journey progress cards
- Chat history sidebar

### Chat System

Chat sessions are managed via:
- `/chat` - Lists all sessions
- `/chat/[sessionId]` - Individual conversation
- Real-time streaming via API routes

### Wellness Tracking

- **Check-in:** Daily mood logging with emotion picker
- **Wellness Check:** Periodic comprehensive screener
- **Quests:** Gamified wellness activities

## Key Patterns

### ~lib/ Colocation

All page-specific components live in `~lib/` folders:

```text
home/
├── page.tsx              # Server component (data fetch)
└── ~lib/
    ├── dashboard-client.tsx  # Client component (state)
    └── main-chat-area.tsx    # UI component
```

### Server Data Fetching

Pages fetch data server-side and pass to client components:

```tsx
// page.tsx
export default async function HomePage() {
  const sessions = await getChatSessions();
  return <DashboardClient initialSessions={sessions} />;
}
```

## Common Tasks

### Adding New Student Feature

1. Create route folder: `dashboard/student/<feature>/`
2. Add `page.tsx` (server component)
3. Add `~lib/` folder with client components
4. Update sidebar navigation in layout
5. Add docs in `docs/frontend/app/dashboard/student/`

### Modifying Chat Behavior

1. Chat UI: `home/~lib/main-chat-area.tsx`
2. Chat API: `api/chat/route.ts`
3. LangGraph: `lib/langgraph/`

## See Also

- **`../../lib/chat/`** - Chat module documentation
- **`../../lib/langgraph-docs.md`** - AI system documentation
- **`../../lib/check-in/`** - Check-in utilities
- **`../../lib/screener/`** - Wellness screener
