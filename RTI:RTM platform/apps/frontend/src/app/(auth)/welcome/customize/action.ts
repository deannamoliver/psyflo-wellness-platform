"use server";

import { userSettings } from "@feelwell/database";
import { serverDrizzle } from "@/lib/database/drizzle";
import { isValidSoliColor, isValidSoliShape } from "./validation";

export async function saveSoliCustomization(
  color: string,
  shape: string,
): Promise<void> {
  if (!isValidSoliColor(color)) {
    throw new Error(`Invalid soli color: ${color}`);
  }
  if (!isValidSoliShape(shape)) {
    throw new Error(`Invalid soli shape: ${shape}`);
  }

  const db = await serverDrizzle();

  await db.admin
    .insert(userSettings)
    .values({
      id: db.userId(),
      soliColor: color,
      soliShape: shape,
    })
    .onConflictDoUpdate({
      target: [userSettings.id],
      set: {
        soliColor: color,
        soliShape: shape,
      },
    });
}
