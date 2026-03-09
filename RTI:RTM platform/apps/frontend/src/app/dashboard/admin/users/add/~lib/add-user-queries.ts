"server-only";

import { schools } from "@feelwell/database";
import { eq, isNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";

export type LocationOption = { id: string; name: string };

export type OrgOption = {
  id: string;
  name: string;
  locations: LocationOption[];
};

export async function fetchAddUserData() {
  const db = await serverDrizzle();

  const orgs = await db.admin
    .select({ id: schools.id, name: schools.name })
    .from(schools)
    .where(isNull(schools.organizationId))
    .orderBy(schools.name);

  const orgsWithLocations = await Promise.all(
    orgs.map(async (org) => {
      const locations = await db.admin
        .select({ id: schools.id, name: schools.name })
        .from(schools)
        .where(eq(schools.organizationId, org.id))
        .orderBy(schools.name);
      return { ...org, locations };
    }),
  );

  return { organizations: orgsWithLocations };
}
