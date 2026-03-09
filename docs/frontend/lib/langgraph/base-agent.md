# base-agent.ts

Handles normal emotional support conversations (non-risk scenarios). Uses Gemini 2.0 Flash with age-appropriate system prompts. Exports `buildBaseAgentGraph()` which creates a simple single-node subgraph.

**Interacts with:** `prompts/system.ts` for base agent prompt, `tools/student-context.ts` for student age lookup
