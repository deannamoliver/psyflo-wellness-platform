# main-graph.ts

Main StateGraph orchestration for the AI conversation engine. Defines nodes for risk analysis, alert creation, protocol execution, and normal conversation handling. Exports `buildMainGraph()` to construct the graph and `getMainGraph()` singleton accessor.

**Key nodes:** `analyzeRiskNode`, `createAlertsNode`, `createSituationalAlertNode`, `generateConversationSummaryNode`, `persistAlertStateNode`, `handoverToCoachNode`, `informUserToWaitNode`

**Interacts with:** `base-agent.ts`, `risk-protocol/risk-router.ts`, `checkpointer.ts`, `prompts/`, `tools/alert-tools.ts`
