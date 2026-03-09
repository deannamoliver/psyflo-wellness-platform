import {
  alerts,
  coachSafetyReports,
  emergencyContacts,
  profiles,
  screenerAlerts,
  screeners,
  users,
} from "@feelwell/database";
import { format } from "date-fns";
import { and, asc, eq, isNull, ne, or } from "drizzle-orm";
import { MailIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { serverDrizzle } from "@/lib/database/drizzle";
import { RISK_BADGE_CONFIG } from "@/lib/student-alerts/risk-level-badge";
import {
  determineRiskLevel,
  getHighestRiskLevel,
  type SafetyRiskLevel,
} from "@/lib/student-alerts/safety-types";
import { cn } from "@/lib/tailwind-utils";
import { getUserFullName } from "@/lib/user/utils";

type ContactTagDisplay =
  | "Primary Emergency Contact"
  | "Back Up #1"
  | "Back Up #2"
  | null;

type EmergencyContactDisplay = {
  name: string;
  relation: string;
  phone: string | null;
  email: string | null;
  tag: ContactTagDisplay;
};

function mapTagToDisplay(
  tag: "primary" | "backup_1" | "backup_2" | null,
): ContactTagDisplay {
  switch (tag) {
    case "primary":
      return "Primary Emergency Contact";
    case "backup_1":
      return "Back Up #1";
    case "backup_2":
      return "Back Up #2";
    default:
      return null;
  }
}

function EmergencyContactCard({
  contact,
}: {
  contact: EmergencyContactDisplay;
}) {
  const tagColor =
    contact.tag === "Primary Emergency Contact"
      ? "bg-green-100 text-green-700"
      : "bg-primary/10 text-primary";

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 p-4 font-dm [&>*+*]:mt-1.5">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 text-sm">
          {contact.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge className="rounded-full bg-orange-100 font-dm font-medium text-orange-700 text-xs">
          Home
        </Badge>
        {contact.tag && (
          <Badge
            className={cn("rounded-full font-dm font-medium text-xs", tagColor)}
          >
            {contact.tag}
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{contact.relation}</p>
      <div className="flex flex-col gap-1 text-gray-600 text-xs">
        {contact.phone && (
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="h-3 w-3" /> {contact.phone}
          </span>
        )}
        {contact.email && (
          <span className="flex items-center gap-1.5">
            <MailIcon className="h-3 w-3" /> {contact.email}
          </span>
        )}
      </div>
    </div>
  );
}

export async function StudentHeader({
  studentId,
  schoolId,
}: {
  studentId: string;
  schoolId: string;
}) {
  const db = await serverDrizzle();

  const record = await db.admin
    .select({ user: users, profile: profiles })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(users.id, studentId))
    .limit(1)
    .then((res) => res[0]);

  if (!record) return null;

  const { user, profile } = record;
  const fullName = getUserFullName(user);
  const age = profile.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(profile.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;
  const dob = profile.dateOfBirth
    ? format(new Date(profile.dateOfBirth), "MMMM d, yyyy")
    : null;

  // Query unresolved safety alerts with risk level data
  const unresolvedAlerts = await db.admin
    .select({
      alertSource: alerts.source,
      screenerType: screeners.type,
      coachRiskLevel: coachSafetyReports.riskLevel,
    })
    .from(alerts)
    .leftJoin(screenerAlerts, eq(alerts.id, screenerAlerts.alertId))
    .leftJoin(screeners, eq(screenerAlerts.screenerId, screeners.id))
    .leftJoin(coachSafetyReports, eq(alerts.id, coachSafetyReports.alertId))
    .where(
      and(
        eq(alerts.studentId, studentId),
        ne(alerts.status, "resolved"),
        or(
          eq(alerts.source, "coach"),
          and(eq(alerts.source, "screener"), eq(alerts.type, "safety")),
        ),
      ),
    );

  const highestRiskLevel: SafetyRiskLevel | null =
    unresolvedAlerts.length > 0
      ? getHighestRiskLevel(
          unresolvedAlerts.map((a) =>
            determineRiskLevel(
              a.alertSource,
              a.screenerType,
              a.coachRiskLevel as SafetyRiskLevel | null,
            ),
          ),
        )
      : null;
  const badge = highestRiskLevel ? RISK_BADGE_CONFIG[highestRiskLevel] : null;

  // Fetch home emergency contacts for this student
  const contactRecords = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        isNull(emergencyContacts.deletedAt),
        or(
          eq(emergencyContacts.studentId, studentId),
          eq(emergencyContacts.schoolId, schoolId),
        ),
      ),
    )
    .orderBy(asc(emergencyContacts.tag));

  const homeContacts: EmergencyContactDisplay[] = contactRecords
    .filter((c) => c.contactType === "home")
    .map((c) => ({
      name: c.name,
      relation: c.relation,
      phone: c.primaryPhone,
      email: c.primaryEmail,
      tag: mapTagToDisplay(c.tag),
    }));

  return (
    <Card className="bg-white">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl text-gray-900">{fullName}</h1>
            {badge && (
              <Badge
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 font-bold text-xs",
                  badge.bg,
                  badge.text,
                )}
              >
                {badge.label}
              </Badge>
            )}
          </div>
          <Link
            href={`/dashboard/counselor/students/${studentId}`}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
          >
            View Patient Profile
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 text-xs">DOB/Age</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {dob ? `${dob} (${age} years old)` : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Email</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {user.email ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Age</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {age ? `${age} years old` : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-4">
            <p className="text-gray-500 text-xs">HOME ADDRESS</p>
            <p className="mt-0.5 font-medium text-gray-900 text-sm">
              {profile.homeAddress ?? "-"}
            </p>
          </div>
        </div>
      </CardHeader>

      {homeContacts.length > 0 && (
        <CardContent className="border-gray-200 border-t pt-4">
          <p className="mb-3 font-semibold text-gray-900 text-sm">
            Home Emergency Contacts
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-gutter:stable]">
            {homeContacts.map((contact, idx) => (
              <div
                key={`home-${contact.name}-${contact.relation}-${idx}`}
                className="shrink-0"
              >
                <EmergencyContactCard contact={contact} />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
