import { schools, userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { SchoolSelector } from "./school-selector";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function WelcomeHeader({
  name,
  currentSchoolId,
}: {
  name: string;
  currentSchoolId: string;
}) {
  const db = await serverDrizzle();
  const userId = db.userId();

  const userSchoolsWithNames = await db.admin
    .select({
      schoolId: userSchools.schoolId,
      schoolName: schools.name,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        eq(userSchools.userId, userId),
        inArray(userSchools.role, ["practice_manager", "admin"]),
      ),
    );

  if (userSchoolsWithNames.length === 0) {
    notFound();
  }

  const schoolList = userSchoolsWithNames.map(
    (row: { schoolId: string; schoolName: string | null }) => ({
      id: row.schoolId,
      name: row.schoolName ?? "",
    }),
  );

  const now = new Date();

  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <h1 className="scroll-m-20 py-2 font-semibold text-3xl text-gray-900 tracking-tight first:mt-0">
          Welcome Back, {name}
        </h1>
        <p className="text-muted-foreground leading-5">
          Monitor your practice's operational health, provider roster, and patient census.
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 font-medium text-base text-muted-foreground leading-5">
          <SchoolSelector
            schools={schoolList}
            currentSchoolId={currentSchoolId}
          />
        </div>
        <p className="text-muted-foreground text-sm">{formatDate(now)}</p>
      </div>
    </div>
  );
}
