import {
  alerts,
  chatSessions,
  moodCheckIns,
  profiles,
  screeners,
  userSchools,
  users,
} from "@feelwell/database";
import { differenceInYears } from "date-fns";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { H2 } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import { getUserFullName } from "@/lib/user/utils";
import * as Icons from "../../../counselor/caseloads/~lib/icons";
import { ChartViewTracker } from "../../../counselor/students/[studentId]/~lib/chart-view-tracker";
import { QuickActions } from "../../../counselor/students/[studentId]/~lib/quick-actions";
import { PatientTabs } from "./tabs";
import { AccessDenied } from "./~lib/access-denied";

// Mock: Provider assignments for demo purposes
// In production, this would come from patient_assignments table
const MOCK_PROVIDERS = ["Dr. Sarah Johnson", "Dr. Michael Chen", "Lisa Martinez, LCSW", "Dr. Emily Williams"];
const CURRENT_USER_PROVIDER = "Lisa Martinez, LCSW";

// Simple deterministic hash for consistent mock data
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Check if patient is on current user's caseload (mock implementation)
function isPatientOnMyCaseload(patientId: string): boolean {
  const assignedProviderIndex = hash(patientId) % MOCK_PROVIDERS.length;
  const assignedProvider = MOCK_PROVIDERS[assignedProviderIndex];
  return assignedProvider === CURRENT_USER_PROVIDER;
}

// Get assigned provider for a patient (mock implementation)
function getAssignedProvider(patientId: string): string {
  const assignedProviderIndex = hash(patientId) % MOCK_PROVIDERS.length;
  return MOCK_PROVIDERS[assignedProviderIndex] ?? "Unknown Provider";
}

export default async function PatientLayout({
  params,
  children,
}: {
  params: Promise<{ patientId: string }>;
  children: React.ReactNode;
}) {
  const { patientId } = await params;
  const db = await serverDrizzle();
  const userId = db.userId();

  // Check if patient is on user's caseload (HIPAA boundary)
  const hasAccess = isPatientOnMyCaseload(patientId);
  
  if (!hasAccess) {
    const assignedProvider = getAssignedProvider(patientId);
    return (
      <PageContainer>
        <PageContent>
          <AccessDenied assignedProvider={assignedProvider} />
        </PageContent>
      </PageContainer>
    );
  }

  // Get user's school (no role restriction for practice managers)
  const userSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(eq(userSchools.userId, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!userSchool) notFound();

  const patientSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, patientId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  if (patientSchool?.schoolId !== userSchool.schoolId) notFound();

  const patientRecord = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, patientId))
    .limit(1)
    .then((res) => res[0]);

  if (!patientRecord) notFound();

  const activeAlertCount = await db.admin
    .select({ count: count() })
    .from(alerts)
    .where(
      and(
        eq(alerts.studentId, patientId),
        inArray(alerts.status, ["new", "in_progress"]),
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    )
    .then((res) => res[0]?.count ?? 0);

  const [lastCheckInRow, lastChatRow, lastScreenerRow] = await Promise.all([
    db.admin
      .select({ createdAt: moodCheckIns.createdAt })
      .from(moodCheckIns)
      .where(eq(moodCheckIns.userId, patientId))
      .orderBy(desc(moodCheckIns.createdAt))
      .limit(1)
      .then((res) => res[0]?.createdAt ?? null),
    db.admin
      .select({ updatedAt: chatSessions.updatedAt })
      .from(chatSessions)
      .where(eq(chatSessions.userId, patientId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1)
      .then((res) => res[0]?.updatedAt ?? null),
    db.admin
      .select({ updatedAt: screeners.updatedAt })
      .from(screeners)
      .where(eq(screeners.userId, patientId))
      .orderBy(desc(screeners.updatedAt))
      .limit(1)
      .then((res) => res[0]?.updatedAt ?? null),
  ]);

  const lastActive = [lastCheckInRow, lastChatRow, lastScreenerRow]
    .filter((t): t is Date => t != null)
    .reduce<Date | null>(
      (latest, t) => (!latest || t.getTime() > latest.getTime() ? t : latest),
      null,
    );

  const name = getUserFullName(patientRecord.user);
  const dob = patientRecord.profile.dateOfBirth;
  const age = dob ? differenceInYears(new Date(), new Date(dob)) : null;
  const dobFormatted = dob ? new Date(dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  const email = patientRecord.user.email;
  const phone = patientRecord.profile.phone;

  return (
    <PageContainer>
      <PageContent className="flex flex-col">
        <Link
          href="/dashboard/practice/caseloads"
          className="mb-3 flex w-fit items-center gap-1 font-dm font-medium text-primary text-sm hover:text-primary/80"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Back to Caseloads</span>
        </Link>

        <div className="mb-1 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <H2 className="font-dm font-semibold">{name}</H2>
            {activeAlertCount > 0 && (
              <span
                className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 font-medium text-red-600 text-xs"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <Icons.AlertIcon className="h-4 w-4 shrink-0 text-red-600" />
                {activeAlertCount} Active Alert
                {activeAlertCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <QuickActions studentId={patientId} basePath="/dashboard/practice/patients" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 font-dm text-gray-500 text-sm">
          {dobFormatted && <span>DOB: {dobFormatted}</span>}
          {age && <span>Age {age}</span>}
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {lastActive && (
            <span className="text-gray-400">Last Engagement: {formatRelativeTime(lastActive)}</span>
          )}
        </div>

        <div className="mt-4">
          <PatientTabs patientId={patientId} />
        </div>
        <ChartViewTracker studentId={patientId} pageViewed="chart" />
        <div className="mt-6 pb-24">{children}</div>
      </PageContent>
    </PageContainer>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}
