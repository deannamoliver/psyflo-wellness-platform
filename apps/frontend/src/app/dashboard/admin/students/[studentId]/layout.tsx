import {
  alerts,
  chatSessions,
  moodCheckIns,
  profiles,
  schools,
  screeners,
  therapistReferrals,
  userSchools,
  users,
} from "@feelwell/database";
import { differenceInYears } from "date-fns";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import { H2, Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getUserFullName } from "@/lib/user/utils";
import { AlertIcon } from "../../../counselor/caseloads/~lib/icons";
import { BlockStudentButton } from "./~lib/block-student-button";
import { BlockedStatusSections } from "./~lib/blocked-status-sections";
import { StudentTabs } from "./tabs";

export default async function AdminStudentLayout({
  params,
  children,
}: {
  params: Promise<{ studentId: string }>;
  children: React.ReactNode;
}) {
  const { studentId } = await params;
  const db = await serverDrizzle();

  const studentRecord = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  if (!studentRecord) notFound();

  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  const schoolRecord = studentSchool
    ? await db.admin
        .select({ name: schools.name })
        .from(schools)
        .where(eq(schools.id, studentSchool.schoolId))
        .limit(1)
        .then((res) => res[0])
    : null;

  const activeAlertCount = await db.admin
    .select({ count: count() })
    .from(alerts)
    .where(
      and(
        eq(alerts.studentId, studentId),
        inArray(alerts.status, ["new", "in_progress"]),
        or(
          inArray(alerts.source, ["coach", "chat"]),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    )
    .then((res) => res[0]?.count ?? 0);

  const latestReferral = await db.admin
    .select({ status: therapistReferrals.status })
    .from(therapistReferrals)
    .where(eq(therapistReferrals.studentId, studentId))
    .orderBy(desc(therapistReferrals.createdAt))
    .limit(1)
    .then((res) => res[0] ?? null);

  const [lastCheckInRow, lastChatRow, lastScreenerRow] = await Promise.all([
    db.admin
      .select({ createdAt: moodCheckIns.createdAt })
      .from(moodCheckIns)
      .where(eq(moodCheckIns.userId, studentId))
      .orderBy(desc(moodCheckIns.createdAt))
      .limit(1)
      .then((res) => res[0]?.createdAt ?? null),
    db.admin
      .select({ updatedAt: chatSessions.updatedAt })
      .from(chatSessions)
      .where(eq(chatSessions.userId, studentId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1)
      .then((res) => res[0]?.updatedAt ?? null),
    db.admin
      .select({ updatedAt: screeners.updatedAt })
      .from(screeners)
      .where(eq(screeners.userId, studentId))
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

  const name = getUserFullName(studentRecord.user);
  const grade = studentRecord.profile.grade;
  const dob = studentRecord.profile.dateOfBirth;
  const age = dob ? differenceInYears(new Date(), new Date(dob)) : null;
  const schoolName = schoolRecord?.name ?? null;
  const isBlocked =
    studentRecord.profile.accountStatus === "blocked" &&
    (studentRecord.profile.blockedUntil === null ||
      studentRecord.profile.blockedUntil >= new Date());

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <Link
        href="/dashboard/admin/students"
        className="flex w-fit items-center gap-1 font-medium text-primary text-sm hover:text-primary/80"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span>Back to Students</span>
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <H2 className="font-dm font-semibold">{name}</H2>
          {activeAlertCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 font-medium text-red-600 text-xs">
              <AlertIcon className="h-4 w-4 shrink-0 text-red-600" />
              {activeAlertCount} Active Alert
              {activeAlertCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Suspense fallback={<Skeleton className="h-10 w-36" />}>
            <BlockStudentButton
              studentId={studentId}
              studentName={name}
              isBlocked={isBlocked}
            />
          </Suspense>
        </div>
      </div>

      {isBlocked && (
        <BlockedStatusSections
          studentId={studentId}
          studentName={name}
          blockedReason={studentRecord.profile.blockedReason}
          blockedExplanation={studentRecord.profile.blockedExplanation}
          blockedAt={studentRecord.profile.blockedAt}
          blockedDuration={studentRecord.profile.blockedDuration}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-6 text-gray-600 text-sm">
        <div className="flex flex-wrap items-center gap-x-6">
          {schoolName && (
            <span className="flex items-center gap-1.5">
              <span>&#127979;</span> {schoolName}
            </span>
          )}
          {grade && (
            <span className="flex items-center gap-1.5">
              <span>&#127891;</span> Grade {grade}
            </span>
          )}
          {age && (
            <span className="flex items-center gap-1.5">
              <span>&#128197;</span> Age {age}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6">
          {lastActive && (
            <Muted>Last Active: {formatRelativeTime(lastActive)}</Muted>
          )}
          <span className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">Referral Status:</span>
            {latestReferral ? (
              <ReferralStatusBadge status={latestReferral.status} />
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </span>
        </div>
      </div>

      <StudentTabs studentId={studentId} />
      <div className="pb-24">{children}</div>
    </div>
  );
}

const REFERRAL_STATUS: Record<string, { label: string; style: string }> = {
  submitted: { label: "Submitted", style: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", style: "bg-yellow-50 text-yellow-700" },
  matched: { label: "Matched", style: "bg-green-50 text-green-700" },
  completed: { label: "Completed", style: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-500" },
};

function ReferralStatusBadge({ status }: { status: string }) {
  const { label, style } = REFERRAL_STATUS[status] ?? {
    label: status,
    style: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-medium text-xs ${style}`}>
      {label}
    </span>
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
