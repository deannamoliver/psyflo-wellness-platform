import { schools, userSchools } from "@feelwell/database";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { H4 } from "@/lib/core-ui/typography";
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

// Inspirational quotes for therapists
const quotes = [
  {
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl Rogers",
  },
  {
    text: "Out of your vulnerabilities will come your strength.",
    author: "Sigmund Freud",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
  },
  {
    text: "The good life is a process, not a state of being.",
    author: "Carl Rogers",
  },
];

function getQuoteOfTheDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return quotes[dayOfYear % quotes.length];
}

/**
 * Legacy welcome header for wellness coaches - uses the original design
 */
export async function WelcomeHeaderLegacy({ name }: { name: string }) {
  const db = await serverDrizzle();
  const userId = db.userId();

  const school = await db.admin
    .select({
      schoolName: schools.name,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .where(
      and(
        eq(userSchools.userId, userId),
        eq(userSchools.role, "wellness_coach"),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (school == null) {
    notFound();
  }

  return (
    <div className="flex justify-between">
      <H4>
        WELCOME BACK, <span className="text-2xl text-blue-800">{name}</span>
      </H4>
      <div className="text-right font-medium">{school.schoolName}</div>
    </div>
  );
}

/**
 * New welcome header for counselors - includes quote, date/time, and school selector
 */
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
        inArray(userSchools.role, ["counselor", "wellness_coach"]),
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
  const quote = getQuoteOfTheDay();

  return (
    <div className="flex items-start justify-between">
      {/* Left side: Welcome message and quote — same spacing/typography as Safety Alerts title block */}
      <div className="flex flex-col">
        <h1 className="scroll-m-20 py-2 font-semibold text-3xl text-gray-900 tracking-tight first:mt-0">
          Welcome Back, {name}
        </h1>
        <p className="text-muted-foreground leading-5">
          "{quote?.text}" - {quote?.author}
        </p>
      </div>

      {/* Right side: Practice selector and date — match subtitle sizing */}
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
