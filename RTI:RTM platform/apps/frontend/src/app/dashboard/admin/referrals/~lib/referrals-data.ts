export type ReferralUrgency = "Routine" | "Urgent";
export type ReferralStatus =
  | "Submitted"
  | "In Progress"
  | "Connected"
  | "Closed";

export type AdminReferral = {
  id: string;
  studentName: string;
  studentAge: number;
  studentGrade: number;
  organization: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  submittedAt: Date;
};

export type ReferralStats = {
  submitted: number;
  inProgress: number;
  connected: number;
  closed: number;
};

export type ReferralsPageData = {
  referrals: AdminReferral[];
  orgs: string[];
  stats: ReferralStats;
};

export const URGENCY_BADGE_CONFIG: Record<
  ReferralUrgency,
  { bg: string; text: string }
> = {
  Routine: { bg: "bg-blue-100", text: "text-blue-700" },
  Urgent: { bg: "bg-orange-100", text: "text-orange-700" },
};

export const STATUS_DOT_CONFIG: Record<
  ReferralStatus,
  { dot: string; bg: string; text: string }
> = {
  Submitted: {
    dot: "bg-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  "In Progress": {
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Connected: { dot: "bg-green-400", bg: "bg-green-50", text: "text-green-600" },
  Closed: { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-500" },
};

export const URGENCY_OPTIONS: ReferralUrgency[] = ["Routine", "Urgent"];
export const STATUS_OPTIONS: ReferralStatus[] = [
  "Submitted",
  "In Progress",
  "Connected",
  "Closed",
];

export function formatDate(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}
