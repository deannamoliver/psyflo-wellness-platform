import { getAdminSafetyAlerts } from "./queries";
import { SafetyMonitorClient } from "./safety-monitor-client";

/** Server component that fetches safety data and passes it to the client. */
export async function SafetyMonitorContent() {
  const { alerts, summary } = await getAdminSafetyAlerts();
  return <SafetyMonitorClient alerts={alerts} summary={summary} />;
}
