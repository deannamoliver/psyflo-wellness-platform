# checkpointer.ts

Manages PostgreSQL-based conversation state persistence using `@langchain/langgraph-checkpoint-postgres`. Exports `getCheckpointer()` singleton, `createThreadId(userId, sessionId)` for secure thread scoping, and `extractSessionId(threadId)` for parsing.

**Interacts with:** PostgreSQL via `pg` Pool, used by `main-graph.ts` for graph compilation
