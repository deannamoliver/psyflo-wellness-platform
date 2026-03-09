"use client";

import {
  Activity,
  Baby,
  Brain,
  Building2,
  Check,
  Flower2,
  Heart,
  Laptop,
  Pill,
  Stethoscope,
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
    value: "mental_health",
    label: "Mental Health",
    subtitle: "Psychiatry, psychology, therapy",
    icon: Brain,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    value: "primary_care",
    label: "Primary Care",
    subtitle: "Family medicine, internal medicine",
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "pediatrics",
    label: "Pediatrics",
    subtitle: "Child and adolescent care",
    icon: Baby,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    value: "substance_abuse",
    label: "Substance Abuse",
    subtitle: "Addiction treatment, recovery",
    icon: Pill,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    value: "neurology",
    label: "Neurology",
    subtitle: "Brain and nervous system",
    icon: Activity,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    value: "geriatrics",
    label: "Geriatrics",
    subtitle: "Elderly care, aging services",
    icon: Users,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    value: "womens_health",
    label: "Women's Health",
    subtitle: "OB/GYN, reproductive health",
    icon: Heart,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    value: "integrative",
    label: "Integrative Medicine",
    subtitle: "Holistic, complementary care",
    icon: Flower2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    value: "telehealth",
    label: "Telehealth",
    subtitle: "Virtual care, remote services",
    icon: Laptop,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    value: "multi_specialty",
    label: "Multi-Specialty",
    subtitle: "Multiple specialties under one org",
    icon: Building2,
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
      <div className="mt-6 grid grid-cols-5 gap-4">
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
