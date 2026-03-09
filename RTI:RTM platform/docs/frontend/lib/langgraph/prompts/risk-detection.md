# prompts/risk-detection.ts

Prompts for risk analysis. Exports `RISK_DETECTION_PROMPT` which instructs the LLM to analyze messages for suicide risk indicators and return structured JSON with `riskDetected`, `riskType`, `riskSubtype`, and `triggeringStatement`. Also exports `getConversationSummaryPrompt()` for generating counselor-friendly summaries.

**Used by:** `main-graph.ts` (`analyzeRiskNode`, `generateConversationSummaryNode`)
