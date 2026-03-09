import { emergencyContacts, userSchools } from "@feelwell/database";
import { and, asc, desc, eq, isNull, or } from "drizzle-orm";
import { BuildingIcon, MailIcon, PhoneIcon } from "lucide-react";
import { Badge } from "@/lib/core-ui/badge";
import { Card, CardContent, CardHeader } from "@/lib/core-ui/card";
import { H3, Muted } from "@/lib/core-ui/typography";
import { serverDrizzle } from "@/lib/database/drizzle";

type ContactType = "school" | "home";

type ContactTag = "Primary Emergency Contact" | "Back Up #1" | "Back Up #2";

type EmergencyContact = {
  name: string;
  type: ContactType;
  tag: ContactTag | null;
  role: string;
  phone?: string;
  email?: string;
  workPhone?: string;
};

function mapTagToDisplay(
  tag: "primary" | "backup_1" | "backup_2" | null,
): ContactTag | null {
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

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const tagColor =
    contact.tag === "Primary Emergency Contact"
      ? "bg-green-100 text-green-700"
      : "bg-primary/10 text-primary";
  const typeColor =
    contact.type === "school"
      ? "bg-primary/10 text-primary"
      : "bg-orange-100 text-orange-700";

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 p-4 font-dm [&>*+*]:mt-1.5">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 text-sm">
          {contact.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          className={`rounded-full font-dm font-medium text-xs ${typeColor}`}
        >
          {contact.type === "school" ? "Clinic" : "Home"}
        </Badge>
        {contact.tag && (
          <Badge
            className={`rounded-full font-dm font-medium text-xs ${tagColor}`}
          >
            {contact.tag}
          </Badge>
        )}
      </div>
      <Muted className="text-xs">{contact.role}</Muted>
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
        {contact.workPhone && (
          <span className="flex items-center gap-1.5">
            <BuildingIcon className="h-3 w-3" /> Work: {contact.workPhone}
          </span>
        )}
      </div>
    </div>
  );
}

export async function EmergencyContacts({ studentId }: { studentId: string }) {
  const db = await serverDrizzle();

  // Get student's school ID
  const studentSchool = await db.admin
    .select({ schoolId: userSchools.schoolId })
    .from(userSchools)
    .where(
      and(eq(userSchools.userId, studentId), eq(userSchools.role, "student")),
    )
    .limit(1)
    .then((res) => res[0]);

  // Fetch emergency contacts:
  // 1. Home contacts specific to this student
  // 2. School contacts for the student's school (apply to all students)
  const contactRecords = await db.admin
    .select()
    .from(emergencyContacts)
    .where(
      and(
        isNull(emergencyContacts.deletedAt),
        or(
          // Home contacts for this specific student
          eq(emergencyContacts.studentId, studentId),
          // School contacts for the student's school
          studentSchool
            ? eq(emergencyContacts.schoolId, studentSchool.schoolId)
            : undefined,
        ),
      ),
    )
    .orderBy(
      desc(emergencyContacts.contactType), // school first, then home
      asc(emergencyContacts.tag), // primary, backup_1, backup_2
    );

  // Sort: school (primary → backup_1 → backup_2 → other) then home (same)
  const tagOrder: (ContactTag | null)[] = [
    "Primary Emergency Contact",
    "Back Up #1",
    "Back Up #2",
    null,
  ];
  const contacts: EmergencyContact[] = contactRecords
    .map((record) => ({
      name: record.name,
      type: record.contactType,
      tag: mapTagToDisplay(record.tag),
      role: record.relation,
      phone: record.primaryPhone ?? undefined,
      email: record.primaryEmail ?? undefined,
      workPhone: record.secondaryPhone ?? undefined,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "school" ? -1 : 1;
      const ai = tagOrder.indexOf(a.tag);
      const bi = tagOrder.indexOf(b.tag);
      return ai - bi;
    });

  return (
    <Card className="h-full gap-4 bg-white shadow-sm">
      <CardHeader>
        <H3 className="font-dm font-semibold text-lg">Emergency Contacts</H3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {contacts.length === 0 ? (
            <Muted>No emergency contacts on file.</Muted>
          ) : (
            <>
              {contacts
                .filter((c) => c.type === "school")
                .map((contact, idx) => (
                  <ContactCard key={`school-${idx}`} contact={contact} />
                ))}
              {contacts
                .filter((c) => c.type === "home")
                .map((contact, idx) => (
                  <ContactCard key={`home-${idx}`} contact={contact} />
                ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
