# Admin Documentation (`src/app/admin/`)

This document provides architecture documentation for admin routes in the FeelWell frontend.

## Overview

The admin section provides tools for system administrators to manage schools, test AI agents, run evaluations, and configure the platform.

## Directory Structure

```text
admin/
├── page.tsx              # Admin home
├── layout.tsx            # Admin layout with sidebar
├── actions.ts            # Shared admin actions
├── README.md             # Admin documentation
├── agents/
│   ├── page.tsx          # Agent testing list
│   ├── layout.tsx
│   ├── actions.ts
│   └── [sessionId]/      # Individual agent test
│       ├── page.tsx
│       ├── actions.ts
│       ├── agent-chat-with-trace.tsx
│       ├── agent-execution-trace.tsx
│       ├── node-prompt-modal.tsx
│       └── debug-checkpoints/
├── evals/
│   ├── evals/            # Evaluation runs
│   │   ├── page.tsx
│   │   └── eval-manager.tsx
│   ├── judge/            # Judge model config
│   │   ├── page.tsx
│   │   └── judge-manager.tsx
│   ├── prompt/           # Prompt testing
│   │   ├── page.tsx
│   │   └── prompt-manager.tsx
│   └── tests/            # Test case management
│       ├── page.tsx
│       └── test-manager.tsx
├── schools/
│   ├── page.tsx
│   ├── manage/           # School CRUD
│   │   ├── page.tsx
│   │   ├── school-form.tsx
│   │   └── schools-list.tsx
│   └── signup-controls/  # School signup settings
│       ├── page.tsx
│       └── schools-manager.tsx
└── ~lib/
    └── sidebar.tsx
```

## Key Features

### Agent Testing

Interactive testing interface for the AI chatbot:
- Start new test sessions
- View conversation with execution trace
- Inspect node-by-node execution
- View prompts used at each step
- Debug checkpoint states

### Evaluation System

Systematic AI quality evaluation:
- **Evals:** Run batch evaluations against test cases
- **Judge:** Configure judge model for scoring
- **Prompt:** Test and iterate on prompts
- **Tests:** Manage test case datasets

### School Management

Multi-tenant school administration:
- Create and configure schools
- Manage signup controls
- View school-level statistics

## Key Patterns

### Execution Trace Display

The agent testing UI shows the full LangGraph execution:

```text
┌─────────────────────────────────────┐
│ Chat Interface  │ Execution Trace   │
│                 │                   │
│ User: Hello     │ → analyze_risk    │
│ AI: Hi there!   │ → base_agent      │
│                 │ → END             │
└─────────────────────────────────────┘
```

### Prompt Inspection

Click any node to view the exact prompt used:

```tsx
<NodePromptModal
  nodeName={selectedNode}
  prompt={getPromptForNode(selectedNode)}
/>
```

## Common Tasks

### Testing New LangGraph Changes

1. Go to `/admin/agents`
2. Start new test session
3. Send messages and observe trace
4. Click nodes to view prompts
5. Check checkpoint states if debugging

### Running Evaluations

1. Create test cases in `/admin/evals/tests`
2. Configure judge in `/admin/evals/judge`
3. Run evaluation in `/admin/evals/evals`
4. Review results and scores

### Adding New Admin Feature

1. Create route folder: `admin/<feature>/`
2. Add `page.tsx` and components
3. Update admin sidebar navigation
4. Add to admin README if significant

## See Also

- **`../../lib/langgraph-docs.md`** - AI system documentation
- **`../../lib/langgraph/node-prompt-map.md`** - Node-to-prompt mapping
- **Admin README:** `src/app/admin/README.md`
