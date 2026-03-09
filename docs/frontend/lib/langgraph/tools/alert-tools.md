# tools/alert-tools.ts

Database operations for alert management during risk protocol execution. Contains async functions (not LangChain tools) called programmatically by graph nodes. Handles creating parent alerts, linked chat_alerts, and incremental state updates.

**Exports:** `createRiskAlert()`, `createChatAlert()`, `updateChatAlert()`, `updateAlertStatus()`, `createSituationalAlert()`, `createLabileAlert()`

**Interacts with:** `@feelwell/database` schema (`alerts`, `chatAlerts` tables), `lib/database/drizzle.ts`
