"server-only";

import { userSettings } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { serverDrizzle } from "../database/drizzle";

/**
 * Get user's timezone from their profile
 * @returns User's timezone or 'UTC' as fallback
 */
export async function getUserTimezone(): Promise<string> {
  const db = await serverDrizzle();

  return await db.admin
    .select()
    .from(userSettings)
    .where(eq(userSettings.id, db.userId()))
    .limit(1)
    .then(([result]) => result?.timezone ?? "UTC");
}

/**
 * Get user's soli customization settings
 * @returns Object with soliColor and soliShape, or defaults
 */
export async function getUserSoliSettings(): Promise<{
  soliColor: string;
  soliShape: string;
}> {
  const db = await serverDrizzle();

  const settings = await db.admin
    .select()
    .from(userSettings)
    .where(eq(userSettings.id, db.userId()))
    .limit(1)
    .then(([result]) => result);

  return {
    soliColor: settings?.soliColor ?? "blue",
    soliShape: settings?.soliShape ?? "round",
  };
}
