# prompts/utilities.ts

Utility prompts for parsing LLM responses. Exports `getYesNoParserPrompt()` which extracts yes/no intent from student responses, handling variations like "yeah", "nah", "kind of", etc.

**Used by:** CSSR screening in `risk-protocol/subgraphs/indirect-risk.ts`, clarification parsing
