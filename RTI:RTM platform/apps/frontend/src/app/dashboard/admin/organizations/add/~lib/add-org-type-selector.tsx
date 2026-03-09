"use client";

import {
  Building2,
  Check,
  GraduationCap,
  HeartPulse,
  Users,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgType } from "./add-org-types";

const ORG_TYPES: {
  value: OrgType;
  label: string;
  subtitle: string;
  icon: typeof Building2;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    value: "k12",
    label: "K-12 District",
    subtitle: "Elementary, Middle, or High School",
    icon: Building2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "college",
    label: "College/University",
    subtitle: "Higher education institution",
    icon: GraduationCap,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "clinic",
    label: "Clinic",
    subtitle: "Mental health or medical clinic",
    icon: HeartPulse,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    value: "cbo",
    label: "Community Org",
    subtitle: "Community-based organization",
    icon: Users,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

type Props = {
  selected: OrgType | "";
  onSelect: (type: OrgType) => void;
};

export function AddOrgTypeSelector({ selected, onSelect }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 text-lg">
        Select Organization Type
      </h2>
      <p className="mt-1 text-gray-500 text-sm">
        Choose the type of organization you want to add
      </p>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {ORG_TYPES.map((org) => {
          const isSelected = selected === org.value;
          const Icon = org.icon;
          return (
            <button
              key={org.value}
              type="button"
              onClick={() => onSelect(org.value)}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-50/30 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <Check className="size-3 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl",
                  org.iconBg,
                )}
              >
                <Icon className={cn("size-7", org.iconColor)} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">
                  {org.label}
                </p>
                <p className="mt-0.5 text-gray-500 text-xs">{org.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
