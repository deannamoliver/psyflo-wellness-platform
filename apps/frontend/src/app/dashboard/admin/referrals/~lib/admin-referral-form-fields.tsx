import { CheckCircle2Icon, CircleHelpIcon, XCircleIcon } from "lucide-react";
import type { ReactNode, SVGProps } from "react";
import { Label } from "@/lib/core-ui/label";
import { cn } from "@/lib/tailwind-utils";

export const REASONS = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "trauma", label: "Trauma" },
  { value: "behavioral", label: "Behavioral" },
  { value: "family_issues", label: "Family Issues" },
  { value: "grief_loss", label: "Grief/Loss" },
  { value: "self_harm", label: "Self-Harm" },
  { value: "substance_use", label: "Substance Use" },
  { value: "other", label: "Other" },
];

export const SERVICES = [
  { value: "individual_therapy", label: "Individual Therapy" },
  { value: "family_therapy", label: "Family Therapy" },
  { value: "psychiatric_services", label: "Psychiatric Services" },
];

export const INSURANCE = [
  {
    value: "has_insurance",
    label: "Has Insurance",
    icon: CheckCircle2Icon,
    color: "text-blue-500",
  },
  {
    value: "uninsured",
    label: "Uninsured",
    icon: XCircleIcon,
    color: "text-gray-600",
  },
  {
    value: "unknown",
    label: "Unknown",
    icon: CircleHelpIcon,
    color: "text-gray-400",
  },
];

export const NEXT_STEPS = [
  "Psyflo care coordination team receives your referral immediately",
  "Family is contacted within the specified urgency timeline",
  "You\u2019ll receive email updates on referral status and provider matching",
  "Track progress in the Referrals section of your dashboard",
];

export function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className="font-semibold text-gray-900 text-sm">{value}</p>
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  haloClassName,
}: {
  icon: ReactNode;
  title: string;
  haloClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          haloClassName,
        )}
      >
        {icon}
      </span>
      <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}

export function FieldLabel({
  required,
  children,
}: {
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Label className="mb-1.5 font-semibold text-gray-700 text-sm">
      {children} {required && <span className="text-red-500">*</span>}
    </Label>
  );
}

export function ServiceTypeCard({
  value,
  selected,
  onSelect,
  label,
}: {
  value: string;
  selected: string;
  onSelect: (v: string) => void;
  label: string;
}) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left",
        active
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="font-medium text-gray-700 text-sm">{label}</span>
    </button>
  );
}

export function UrgencyCard({
  value,
  selected,
  onSelect,
  label,
  badge,
  badgeClass,
  desc,
}: {
  value: string;
  selected: string;
  onSelect: (v: string) => void;
  label: string;
  badge: string;
  badgeClass: string;
  desc: string;
}) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-left",
        active
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:bg-gray-50",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-primary bg-primary" : "border-gray-300",
        )}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-sm">{label}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium text-xs",
              badgeClass,
            )}
          >
            {badge}
          </span>
        </div>
        <span className="text-gray-500 text-xs">{desc}</span>
      </div>
    </button>
  );
}

export function ReferralInfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.99982 1C8.44357 1 8.85295 1.23437 9.07795 1.61875L15.8279 13.1187C16.0561 13.5062 16.0561 13.9844 15.8342 14.3719C15.6123 14.7594 15.1967 15 14.7498 15H1.24982C0.802948 15 0.387323 14.7594 0.165448 14.3719C-0.0564269 13.9844 -0.0533019 13.5031 0.171698 13.1187L6.9217 1.61875C7.1467 1.23437 7.55607 1 7.99982 1ZM7.99982 5C7.5842 5 7.24982 5.33437 7.24982 5.75V9.25C7.24982 9.66562 7.5842 10 7.99982 10C8.41545 10 8.74982 9.66562 8.74982 9.25V5.75C8.74982 5.33437 8.41545 5 7.99982 5ZM8.99982 12C8.99982 11.4481 8.55174 11 7.99982 11C7.44791 11 6.99982 11.4481 6.99982 12C6.99982 12.5519 7.44791 13 7.99982 13C8.55174 13 8.99982 12.5519 8.99982 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}
