import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { UniversalEmotion } from "@/lib/check-in/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import { getInitials, titleCase } from "@/lib/string-utils";
import { cn } from "@/lib/tailwind-utils";
import type { Student } from "./type";

/** Normalize actionAt to a Date (handles serialized strings from server→client). */
function toActionDate(actionAt: Date | string | null | undefined): Date {
  if (actionAt == null) return new Date(0);
  return actionAt instanceof Date ? actionAt : new Date(actionAt);
}

function Item({
  student,
  showSeverity,
  showRelativeTime,
  showMood,
}: {
  student: Student & { universalEmotion?: UniversalEmotion | null };
  showSeverity?: boolean;
  showRelativeTime?: boolean;
  showMood?: boolean;
}) {
  const moodColor =
    showMood && student.universalEmotion
      ? {
          happy: "#FEC84B",
          sad: "#84CAFF",
          disgusted: "#039855", // calm
          angry: "#F04438",
          afraid: "#7A5AF8", // worried
          surprised: "#FD853A", // excited
          bad: "#DD2590", // lonely
        }[student.universalEmotion] || "#2563eb"
      : undefined;

  return (
    <Link
      href={`/dashboard/counselor/students/${student.id}`}
      className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={student.avatar ?? undefined} alt={student.name} />
        <AvatarFallback className="bg-green-500 font-semibold text-white text-xs">
          {getInitials(student.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className="truncate font-medium text-gray-900 text-sm"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {student.name}
          </p>
          {showRelativeTime && (
            <span className="ml-auto shrink-0 text-gray-400 text-xs">
              {formatDistanceToNow(toActionDate(student.actionAt), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        {showSeverity && student.severityLabel && (
          <p className="mt-0.5 font-medium text-primary text-sm">
            {student.severityLabel}
          </p>
        )}
        {showMood && student.universalEmotion && (
          <p
            className="mt-0.5 text-sm"
            style={{ color: moodColor, fontWeight: 500 }}
          >
            {titleCase(student.universalEmotion, { delimiter: "_" })}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function StudentList({
  students,
  className,
  title = "Patients",
  showSeverity,
  showRelativeTime,
  showMood,
}: {
  students: (Student & { universalEmotion?: UniversalEmotion | null })[];
  className?: string;
  title?: string;
  showSeverity?: boolean;
  showRelativeTime?: boolean;
  showMood?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden p-4",
        className,
      )}
    >
      <h4 className="mb-2 shrink-0 font-medium text-base text-gray-900">
        {title}
      </h4>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-6">
        {students.length > 0 ? (
          students.map((student) => (
            <Item
              key={`${student.id}-${toActionDate(student.actionAt).getTime()}`}
              student={student}
              showSeverity={showSeverity}
              showRelativeTime={showRelativeTime}
              showMood={showMood}
            />
          ))
        ) : (
          <div className="flex min-h-[200px] items-center justify-center px-4 py-8 text-center text-gray-500">
            No patients in this category
          </div>
        )}
      </div>
    </div>
  );
}
