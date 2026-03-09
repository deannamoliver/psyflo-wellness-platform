# subgraphs/ambiguous-risk.ts

Handles ambiguous risk patterns requiring clarification (medication access, place references, chemicals, firearms). Asks three clarification questions (A, B, C) to determine intent. May route to indirect-risk for CSSR screening or complete as low-risk.

**Exports:** `buildAmbiguousRiskGraph()`

**Pattern types:** medication, chemicals, place, firearms, rope, jumping, other

**Interacts with:** `prompts/screening.ts`, `utils/clarification-builder.ts`, may set `shouldInvokeCSSR` or `shouldInvokeIndirect` flags
