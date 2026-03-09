# api.ts

Server functions for chat session management. Exports `createChatSession()`, `getChatSessions()`, `updateSessionTitle()`, `getChatSession()`, `sendMessage()`, and `getExecutionTrace()`. Handles session ownership verification and integrates with LangGraph for message processing.

**Interacts with:** `lib/langgraph/main-graph.ts`, `lib/langgraph/checkpointer.ts`, `lib/langgraph/memory.ts`, `@feelwell/database` chat_sessions table
