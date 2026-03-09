/**
 * Scenario exports
 *
 * Central export point for all test scenarios.
 * Import this file to get all scenarios organized by category.
 */

export { activeWellnessConversationsScenarios } from "./active-wellness-conversations";
export { anxietyScenarios } from "./anxiety";
export { chatAlertsScenarios } from "./chat-alerts";
export { coachEscalationScenarios } from "./coach-escalations";
export { depressionScenarios } from "./depression";
export { multiAlertScenarios } from "./multi-alert";
export { noAlertsScenarios } from "./no-alerts";
export { progressionScenarios } from "./progression";
export { safetyScenarios } from "./safety";
export { skillDevelopmentScenarios } from "./skill-development";

import { activeWellnessConversationsScenarios } from "./active-wellness-conversations";
import { anxietyScenarios } from "./anxiety";
import { chatAlertsScenarios } from "./chat-alerts";
import { coachEscalationScenarios } from "./coach-escalations";
// Re-export all scenarios as a single array for convenience
import { depressionScenarios } from "./depression";
import { multiAlertScenarios } from "./multi-alert";
import { noAlertsScenarios } from "./no-alerts";
import { progressionScenarios } from "./progression";
import { safetyScenarios } from "./safety";
import { skillDevelopmentScenarios } from "./skill-development";

export const allScenarios = [
  ...depressionScenarios,
  ...anxietyScenarios,
  ...safetyScenarios,
  ...multiAlertScenarios,
  ...progressionScenarios,
  ...noAlertsScenarios,
  ...chatAlertsScenarios,
  ...coachEscalationScenarios,
  ...activeWellnessConversationsScenarios,
  ...skillDevelopmentScenarios,
];
