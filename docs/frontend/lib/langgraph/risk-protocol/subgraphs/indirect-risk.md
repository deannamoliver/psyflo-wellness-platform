# subgraphs/indirect-risk.ts

Handles indirect linguistic risk themes (hopelessness, burden, finality, escape) via CSSR screening. Implements Columbia Suicide Severity Rating Scale questions Q1-Q6 with conditional follow-ups. Routes to shutdown or low-risk completion based on responses.

**Exports:** `buildIndirectRiskGraph()`

**Key nodes:** CSSR question nodes, yes/no parsing, risk level assessment, past-resolved handling

**Interacts with:** `prompts/utilities.ts` for response parsing, `utils/question-builder.ts`
