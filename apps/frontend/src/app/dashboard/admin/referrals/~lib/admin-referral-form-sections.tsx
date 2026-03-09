import { Checkbox } from "@/lib/core-ui/checkbox";
import { Label } from "@/lib/core-ui/label";
import { cn } from "@/lib/tailwind-utils";
import type { StudentSearchResult } from "./admin-referral-actions";
import {
  INSURANCE,
  InfoField,
  NEXT_STEPS,
  ordinal,
  ReferralInfoIcon,
} from "./admin-referral-form-fields";

export function StudentInfoCard({ student }: { student: StudentSearchResult }) {
  const dobFmt = student.dob
    ? new Date(student.dob).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
          Student Information
        </span>
        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 font-medium text-gray-600 text-xs">
          Read-only
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <InfoField label="Name" value={student.name} />
        <InfoField
          label="DOB"
          value={
            dobFmt
              ? `${dobFmt}${student.age != null ? ` (Age ${student.age})` : ""}`
              : "-"
          }
        />
        <InfoField
          label="Grade"
          value={student.grade ? ordinal(student.grade) : "-"}
        />
        <InfoField label="Clinic" value={student.schoolName ?? "-"} />
      </div>
    </div>
  );
}

export function InsuranceSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="mb-1.5 font-medium text-gray-700 text-sm">
        Insurance Status
      </Label>
      <div className="grid grid-cols-3 gap-2">
        {INSURANCE.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? "" : opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 transition-colors",
              value === opt.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:bg-gray-50",
            )}
          >
            <opt.icon className={cn("h-5 w-5", opt.color)} />
            <span className="font-medium text-gray-700 text-xs">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfirmationBox({
  confirmed,
  onCheckedChange,
}: {
  confirmed: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={confirmed}
          onCheckedChange={(c) => onCheckedChange(!!c)}
          className="mt-0.5"
        />
        <div>
          <span className="font-medium text-gray-900 text-sm">
            I confirm that I have notified the parent/guardian that Feelwell
            will be reaching out to help coordinate mental health care for their
            child. <span className="text-red-500">*</span>
          </span>
          <p className="mt-1 text-green-700 text-xs">
            This confirmation ensures families are prepared for our outreach and
            helps maintain trust in the referral process.
          </p>
        </div>
      </label>
    </div>
  );
}

export function NextStepsBox() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ReferralInfoIcon className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            What happens next?
          </p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {NEXT_STEPS.map((t) => (
              <li
                key={t}
                className="flex items-start gap-2 text-gray-600 text-xs"
              >
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
