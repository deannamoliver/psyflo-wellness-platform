# subgraphs/direct-risk.ts

Handles explicit suicide statements (direct risk type). Immediately displays crisis resources, creates high-priority alert, and triggers conversation shutdown with handover to wellness coach. No clarification questions needed.

**Exports:** `buildDirectRiskGraph()`

**Sets:** `shouldShutdown: true`, `protocolComplete: true`, `resourcesDisplayed: true`
