"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { InternalNotesSection } from "./internal-notes-section";
import type { ReferralDetail } from "./referral-detail-data";
import {
  InsuranceSection,
  ParentInfoSection,
  ReferralDetailsSection,
} from "./referral-info-sections";
import { StudentInfoSection } from "./student-info-section";

type Props = {
  data: ReferralDetail;
};

export function ReferralDetailClient({ data }: Props) {
  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/dashboard/admin/referrals"
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          Referrals
        </Link>
        <ChevronRight className="size-3.5 text-gray-400" />
        <span className="text-gray-500">
          {data.student.preferredName || data.student.fullName}
        </span>
      </nav>

      <StudentInfoSection student={data.student} />
      <ParentInfoSection parent={data.parent} />
      <ReferralDetailsSection referral={data.referral} referralId={data.id} />
      <InsuranceSection insurance={data.insurance} referralId={data.id} />
      <InternalNotesSection notes={data.notes} referralId={data.id} />
    </div>
  );
}
