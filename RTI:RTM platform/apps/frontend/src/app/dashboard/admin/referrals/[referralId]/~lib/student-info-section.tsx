"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import type { ReferralDetail } from "./referral-detail-data";

type Props = {
  student: ReferralDetail["student"];
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-gray-900 text-sm">{value}</p>
    </div>
  );
}

export function StudentInfoSection({ student }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Student Information
          </h2>
        </div>
        <Link
          href={`/dashboard/admin/students/${student.id}`}
          className="font-medium text-blue-600 text-sm hover:text-blue-800"
        >
          View Profile
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
        <Field label="Full Name" value={student.fullName} />
        <Field label="Preferred Name" value={student.preferredName} />
        <Field label="Grade Level" value={String(student.gradeLevel)} />
        <Field label="Date of Birth" value={student.dateOfBirth} />
        <Field label="Gender" value={student.gender} />
        <Field label="Race/Ethnicity" value={student.ethnicity} />
        <Field label="Pronouns" value={student.pronouns} />
        <Field label="Home Language" value={student.homeLanguage} />
        <Field label="Email Address" value={student.email} />
        <Field label="Home Address" value={student.homeAddress} />
      </div>
    </div>
  );
}
