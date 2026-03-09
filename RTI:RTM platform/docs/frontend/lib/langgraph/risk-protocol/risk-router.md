# risk-protocol/risk-router.ts

Main router subgraph that orchestrates risk protocol execution. Routes to appropriate subgraph based on `riskType` and `riskDomain` (direct, indirect, ambiguous, abuse_neglect, harm_to_others). Handles transitions between subgraphs when ambiguous clarification triggers CSSR screening.

**Exports:** `buildMainRouterGraph()`

**Interacts with:** All subgraph files in `subgraphs/`, invoked by `main-graph.ts` as `risk_protocol` node
