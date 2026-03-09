"use client";

import {
  Building2,
  Crown,
  Monitor,
  Settings,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

const PLATFORMS = [
  {
    value: "internal" as const,
    label: "PSYFLO Internal",
    description: "For Psyflo platform administrators",
    icon: Settings,
    iconBg: "bg-purple-600",
  },
  {
    value: "client" as const,
    label: "Organization Platform",
    description: "For providers and practice management staff",
    icon: Monitor,
    iconBg: "bg-blue-500",
  },
];

type RoleCard = {
  value: string;
  label: string;
  description: string;
  idealFor: string;
  colorClass: string;
  iconColorClass: string;
  icon: typeof Crown;
};

const ROLE_CARDS: Record<string, RoleCard[]> = {
  internal: [
    {
      value: "Admin (Psyflo)",
      label: "Admin (Psyflo)",
      description:
        "Full platform access. Manages all organizations, users, patients, safety monitoring, conversations, and referrals across all locations.",
      idealFor: "Platform Managers, System Administrators",
      colorClass: "text-purple-600",
      iconColorClass: "bg-purple-100 text-purple-600",
      icon: Crown,
    },
  ],
  client: [
    {
      value: "Provider",
      label: "Provider",
      description:
        "Patient care access. Views assigned patients, manages appointments, conducts sessions, and has full conversation access with patients.",
      idealFor: "Therapists, Counselors, Psychiatrists, Social Workers",
      colorClass: "text-blue-600",
      iconColorClass: "bg-blue-100 text-blue-600",
      icon: Stethoscope,
    },
    {
      value: "Practice Management",
      label: "Practice Management",
      description:
        "Practice administration access. Manages organization settings, views reports, oversees providers and patients. View-only access to conversations.",
      idealFor: "Practice Managers, Office Managers, Clinical Directors",
      colorClass: "text-teal-600",
      iconColorClass: "bg-teal-100 text-teal-600",
      icon: Building2,
    },
  ],
};

type Props = {
  platform: "internal" | "client" | "";
  role: string;
  onPlatformChange: (p: "internal" | "client") => void;
  onRoleChange: (r: string) => void;
};

export function RoleSelection({
  platform,
  role,
  onPlatformChange,
  onRoleChange,
}: Props) {
  const roles = platform ? (ROLE_CARDS[platform] ?? []) : [];

  return (
    <>
      {/* Platform Access */}
      <section>
        <h3 className="mb-3 font-semibold text-gray-900 text-sm">
          Platform Access <span className="text-red-500">*</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPlatformChange(p.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                platform === p.value
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  p.iconBg,
                )}
              >
                <p.icon className="size-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                <p className="text-gray-500 text-xs">{p.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Role Selection */}
      {platform && (
        <section>
          <h3 className="mb-3 font-semibold text-gray-900 text-sm">
            Role <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onRoleChange(r.value)}
                className={cn(
                  "flex flex-col rounded-xl border-2 p-4 text-left transition-all",
                  role === r.value
                    ? "border-blue-500 bg-blue-50/30"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                      role === r.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300",
                    )}
                  >
                    {role === r.value && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      r.iconColorClass,
                    )}
                  >
                    <r.icon className="size-3.5" />
                  </div>
                  <span className={cn("font-semibold text-sm", r.colorClass)}>
                    {r.label}
                  </span>
                </div>
                <p className="mb-3 text-gray-600 text-xs leading-relaxed">
                  {r.description}
                </p>
                <div className="mt-auto">
                  <p className="font-medium text-gray-500 text-xs">
                    Ideal for:
                  </p>
                  <p className="text-gray-500 text-xs">{r.idealFor}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
