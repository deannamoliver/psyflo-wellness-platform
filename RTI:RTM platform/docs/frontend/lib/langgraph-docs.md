# LangGraph AI System Documentation (`src/lib/langgraph/`)

This document provides detailed architecture documentation for the FeelWell AI conversation engine built with LangGraph.

## Overview

The LangGraph system orchestrates AI-powered conversations with students, including risk detection, safety protocols, and alert creation. It uses a StateGraph architecture with multiple subgraphs for different risk assessment paths.

## Architecture

### High-Level Flow

```text
User Message
     ↓
┌─────────────────────────────────┐
│         Main Graph              │
│  ┌─────────────────────────┐    │
│  │   analyze_risk (Gemini) │    │
│  └───────────┬─────────────┘    │
│              ↓                  │
│       [Risk Detected?]          │
│        /     |      \           │
│      No    Yes    Situational   │
│       ↓      ↓         ↓        │
│    base_  create_   create_     │
│    agent  alerts  situational_  │
│              ↓      alert       │
│       risk_protocol     ↓       │
│              ↓       base_      │
│  generate_summary    agent      │
│              ↓                  │
│    persist_state                │
│              ↓                  │
│   [shouldShutdown?]             │
│      Yes       No               │
│       ↓         ↓               │
│     END    base_agent           │
└─────────────────────────────────┘
```

### Risk Protocol Subgraph

```text
risk_protocol (Router)
       ↓
  [riskType?]
   /   |   \   \   \
direct indirect ambiguous abuse harm
   ↓      ↓       ↓        ↓      ↓
direct_ indirect_ ambiguous_ abuse_ harm_
risk    risk     risk      neglect others
   ↓      ↓       ↓          ↓      ↓
  END    END     [flags?]   END   END
                  /    \
              CSSR  indirect
                ↓       ↓
            indirect_  END
            risk
```

## Directory Structure

```text
src/lib/langgraph/
├── main-graph.ts              # Main StateGraph orchestration
├── base-agent.ts              # Normal conversation handling
├── memory.ts                  # Conversation history retrieval
├── checkpointer.ts            # PostgreSQL checkpoint management
├── checkpoint-storage.ts      # Low-level checkpoint operations
├── checkpoint-diff.ts         # Checkpoint diffing utilities
├── trace-history.ts           # Execution trace building
├── node-prompt-map.ts         # Node-to-prompt mapping for admin UI
├── prompts/                   # LLM prompt templates
├── risk-protocol/             # Risk assessment subgraphs
│   ├── conversation-state.ts  # Shared state annotation
│   ├── risk-router.ts         # Subgraph routing
│   ├── types.ts               # Type definitions
│   ├── constants.ts           # Risk protocol constants
│   ├── subgraphs/             # Risk-specific graphs
│   └── utils/                 # Shared utilities
├── tools/                     # Database tools for alerts
└── test-data/                 # Test scenarios for evaluation
```

## Core Components

### Main Graph (`main-graph.ts`)

The entry point for all conversations. Orchestrates:

1. **analyze_risk**: Uses Gemini 2.5 Flash to detect risk indicators
2. **create_alerts**: Creates alert records when risk detected
3. **create_situational_alert**: Creates awareness alerts (auto-resolved)
4. **risk_protocol**: Routes to appropriate risk subgraph
5. **generate_conversation_summary**: Creates counselor-friendly summary
6. **persist_alert_state**: Saves protocol data to database
7. **handover_to_coach**: Handles high-risk conversation termination
8. **base_agent**: Normal emotional support conversation

### Conversation State (`risk-protocol/conversation-state.ts`)

Shared state across all nodes/subgraphs using LangGraph's Annotation system:

```typescript
// Key state fields
ConversationState = {
  messages: BaseMessage[],        // Conversation history
  chatSessionId: string,          // Session identifier
  userId: string,                 // Student ID

  // Risk detection
  riskDetected: boolean,
  riskType: "direct" | "indirect" | "ambiguous" | null,
  riskDomain: "suicide" | "abuse_neglect" | "harm_to_others" | null,
  triggeringStatement: string | null,

  // Alert tracking
  alertId: string | null,
  chatAlertId: string | null,

  // Protocol control
  protocolComplete: boolean,
  shouldShutdown: boolean,

  // CSSR screening state
  cssrState: CSSRState | null,

  // Ambiguous clarification
  clarificationStep: "A" | "B" | "C" | "complete" | null,
  clarificationResponses: ClarificationResponses,
}
```

### Risk Types

| Type | Description | Subgraph | Example |
|------|-------------|----------|---------|
| `direct` | Explicit suicide statements | `direct-risk.ts` | "I want to end my life" |
| `indirect` | Concerning linguistic themes | `indirect-risk.ts` | "Nothing will get better" |
| `ambiguous` | Needs clarification | `ambiguous-risk.ts` | "I have access to medications" |
| `abuse_neglect` | Abuse/neglect indicators | `abuse-neglect.ts` | "My parents hit me" |
| `harm_to_others` | Violence concerns | `harm-others.ts` | "I want to hurt someone" |

### CSSR Screening

The Columbia Suicide Severity Rating Scale is implemented in `indirect-risk.ts`:

```text
Q1: Wish to be dead?
  ↓
Q2: Active suicidal thoughts?
  ↓ (if yes)
Q3-Q5: Intent, plan, preparation questions
  ↓
Q6: Past suicidal behavior?
  ↓ (if yes)
Q6Followup: How long ago?
```

## Prompts (`prompts/`)

| File | Purpose |
|------|---------|
| `index.ts` | Centralized exports |
| `system.ts` | Base agent system prompt |
| `risk-detection.ts` | Risk analysis prompt |
| `screening.ts` | Clarification question prompts |
| `handover.ts` | Conversation termination prompt |
| `abuse-protocol.ts` | Abuse assessment prompts |
| `harm-protocol.ts` | Harm to others prompts |
| `conversation-summary.ts` | Summary generation prompt |
| `utilities.ts` | Yes/no parsing utilities |

## Tools (`tools/`)

Database operations for alert management:

| Function | Purpose |
|----------|---------|
| `createRiskAlert()` | Create parent alert record |
| `createChatAlert()` | Create linked chat_alert |
| `updateChatAlert()` | Update protocol state |
| `updateAlertStatus()` | Change alert status |
| `createSituationalAlert()` | Auto-resolved awareness alert |
| `createLabileAlert()` | Fluctuating suicidality alert |

## Checkpointing

Conversation state is persisted to PostgreSQL via `@langchain/langgraph-checkpoint-postgres`:

```typescript
// checkpointer.ts
const checkpointer = new PostgresSaver(pool);
await checkpointer.setup(); // Creates checkpoint tables

// Thread IDs include user scoping for security
const threadId = `user_${userId}_${sessionId}`;
```

**Tables created:**
- `checkpoints` - State snapshots
- `checkpoint_blobs` - Large state data
- `checkpoint_writes` - Write operations

## Testing

Tests are in `langgraph.test.ts` and `langgraph_risk_detector.test.ts`:

```bash
# Run all LangGraph tests
bun run test langgraph

# Run specific test file
bunx vitest src/lib/langgraph/langgraph.test.ts

# Use LangSmith for visual debugging
bun run langsmith
```

Test data is in `test-data/`:
- `scenarios.csv` - General test cases
- `scenarios_risk_detection.csv` - Risk detection cases
- `scenarios_edge_cases.csv` - Edge cases

## Common Tasks

### Adding a New Node

1. Define node function in appropriate file:
```typescript
async function myNewNode(state: typeof ConversationState.State) {
  // Process state
  return { /* state updates */ };
}
```

2. Add to graph:
```typescript
.addNode("my_new_node", myNewNode)
.addEdge("previous_node", "my_new_node")
```

3. Add prompt to `prompts/` if LLM is used

4. Update `node-prompt-map.ts` for admin UI

5. Add tests

### Adding a New Risk Type

1. Create subgraph in `risk-protocol/subgraphs/`
2. Add routing in `risk-router.ts`
3. Update `ConversationState` if new fields needed
4. Add prompt in `prompts/`
5. Add test cases

### Modifying Risk Detection

1. Edit `RISK_DETECTION_PROMPT` in `prompts/risk-detection.ts`
2. Update JSON parsing in `analyzeRiskNode` if structure changes
3. Run risk detection tests: `bunx vitest langgraph_risk_detector`

## Debugging

### LangSmith Integration

```bash
# Start LangSmith dev server
bun run langsmith
```

This provides:
- Visual graph execution traces
- State inspection at each node
- LLM call debugging

### Execution Trace

The admin UI at `/admin/agents/[sessionId]` shows:
- Node execution order
- State changes
- LLM prompts and responses
- Routing decisions

### Common Issues

**Empty responses:**
- Check if `base_agent` is returning properly
- Verify `shouldShutdown` isn't incorrectly set

**Protocol loops:**
- Check `protocolComplete` flag
- Verify `riskAlertCreated` prevents re-triggering

**Checkpoint errors:**
- Verify PostgreSQL connection
- Check SSL configuration in production

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Google AI API key for Gemini |
| `POSTGRES_URL` | PostgreSQL connection string |
| `RISK_PROTOCOL` | `"true"` to enable full protocol |
| `LANGCHAIN_API_KEY` | LangSmith API key (optional) |
| `LANGCHAIN_TRACING_V2` | `"true"` to enable LangSmith tracing |

## See Also

- **`../lib-docs.md`** - Library overview
- **Function-level docs in `langgraph/`** - Individual file documentation
- **`../../packages/database/src/schema/`** - Alert and chat tables
- **LangGraph docs:** https://langchain-ai.github.io/langgraphjs/
