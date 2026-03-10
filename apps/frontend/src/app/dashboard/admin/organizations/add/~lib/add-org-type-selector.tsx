"use client";

import {
  Baby,
  Brain,
  Building,
  Building2,
  Check,
  Flower2,
  GraduationCap,
  Heart,
  HelpCircle,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgSpecialty, OrgType } from "./add-org-types";

const ORG_TYPES: {
  value: OrgType;
  label: string;
  subtitle: string;
  icon: typeof Building2;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    value: "private_practice",
    label: "Private Practice",
    subtitle: "Solo or small group practice",
    icon: Stethoscope,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "group_practice",
    label: "Group Practice",
    subtitle: "Multi-provider practice",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    value: "hospital_system",
    label: "Hospital System",
    subtitle: "Hospital or health system",
    icon: Building,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    value: "community_health",
    label: "Community Health",
    subtitle: "FQHC, community clinic",
    icon: Heart,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    value: "academic_medical",
    label: "Academic Medical",
    subtitle: "University or teaching hospital",
    icon: GraduationCap,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    value: "other",
    label: "Other",
    subtitle: "Other organization type",
    icon: HelpCircle,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
];

const SPECIALTIES: {
  value: OrgSpecialty;
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
    value: "multi_specialty",
    label: "Multi-Specialty",
    subtitle: "Multiple specialties under one org",
    icon: Building2,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    value: "other",
    label: "Other",
    subtitle: "Other specialty not listed",
    icon: HelpCircle,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
];

type Props = {
  selectedType: OrgType | "";
  selectedSpecialty: OrgSpecialty | "";
  onSelectType: (type: OrgType) => void;
  onSelectSpecialty: (specialty: OrgSpecialty) => void;
};

export function AddOrgTypeSelector({ selectedType, selectedSpecialty, onSelectType, onSelectSpecialty }: Props) {
  return (
    <div className="space-y-6">
      {/* Organization Type */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 text-lg">
          Organization Type
        </h2>
        <p className="mt-1 text-gray-500 text-sm">
          What type of organization is this?
        </p>
        <div className="mt-6 grid grid-cols-6 gap-3">
          {ORG_TYPES.map((org) => {
            const isSelected = selectedType === org.value;
            const Icon = org.icon;
            return (
              <button
                key={org.value}
                type="button"
                onClick={() => onSelectType(org.value)}
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

      {/* Specialty */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 text-lg">
          Specialty
        </h2>
        <p className="mt-1 text-gray-500 text-sm">
          What is the primary clinical specialty?
        </p>
        <div className="mt-6 grid grid-cols-6 gap-3">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.value;
            const Icon = spec.icon;
            return (
              <button
                key={spec.value}
                type="button"
                onClick={() => onSelectSpecialty(spec.value)}
                className={cn(
                  "relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                  isSelected
                    ? "border-teal-600 bg-teal-50/30 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600">
                    <Check className="size-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    spec.iconBg,
                  )}
                >
                  <Icon className={cn("size-6", spec.iconColor)} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-sm">
                    {spec.label}
                  </p>
                  <p className="mt-0.5 text-gray-500 text-xs">{spec.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
