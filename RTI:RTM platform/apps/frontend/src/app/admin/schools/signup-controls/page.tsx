import { schools } from "@feelwell/database";
import { isNull } from "drizzle-orm";
import { serverDrizzle } from "@/lib/database/drizzle";
import { SchoolsManager } from "./schools-manager";

export default async function SchoolsAdminPage() {
  const db = await serverDrizzle();

  const schoolsList = await db.admin.query.schools.findMany({
    where: isNull(schools.deletedAt),
    orderBy: (schools, { asc }) => [asc(schools.name)],
  });

  if (schoolsList.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No schools found</p>
      </div>
    );
  }

  return <SchoolsManager schools={schoolsList} />;
}
