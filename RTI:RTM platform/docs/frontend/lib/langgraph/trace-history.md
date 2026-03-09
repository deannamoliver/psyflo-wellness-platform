# trace-history.ts

Builds execution traces for the admin UI visualization. Exports `buildExecutionTrace(threadId, sessionId)` which reconstructs the sequence of node executions, state changes, and LLM calls for debugging.

**Interacts with:** `checkpointer.ts`, `checkpoint-storage.ts`, `checkpoint-diff.ts`, `node-prompt-map.ts`
