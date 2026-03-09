"use client";

import {
  Crown,
  Headphones,
  Monitor,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

const PLATFORMS = [
  {
    value: "internal" as const,
    label: "PSYFLO Internal",
    description: "For internal team members (Super Admin, Clinical Supervisor)",
    icon: Settings,
    iconBg: "bg-blue-600",
  },
  {
    value: "client" as const,
    label: "Provider Platform",
    description: "For clinic providers (Provider, Therapist)",
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
  icon: typeof Shield;
};

const ROLE_CARDS: Record<string, RoleCard[]> = {
  internal: [
    {
      value: "Super Admin",
      label: "Super Admin",
      description:
        "Full platform access. Manages all organizations, users, patients, safety monitoring, conversations, and referrals across all locations.",
      idealFor: "Platform Managers, System Managers",
      colorClass: "text-red-500",
      iconColorClass: "bg-red-100 text-red-500",
      icon: Crown,
    },
    {
      value: "Clinical Supervisor",
      label: "Clinical Supervisor",
      description:
        "View-only access to organizations and users. Full patient, safety monitoring, conversation, and referral oversight. Can observe and take over therapist sessions when needed.",
      idealFor: "Clinical Directors, Licensed Supervisors",
      colorClass: "text-blue-600",
      iconColorClass: "bg-blue-100 text-blue-600",
      icon: Shield,
    },
  ],
  client: [
    {
      value: "Site Staff",
      label: "Provider",
      description:
        "Clinical oversight for all patients at location. Receives and resolves safety alerts. Views population data, patient profiles and assessments. Cannot access conversations.",
      idealFor: "Psychiatrists, Clinical Directors, Practice Managers",
      colorClass: "text-green-600",
      iconColorClass: "bg-green-100 text-green-600",
      icon: Users,
    },
    {
      value: "Coach",
      label: "Therapist",
      description:
        "Direct patient support for assigned caseload. Full conversation access with patients. Submits safety alerts and manages treatment plans.",
      idealFor: "Therapists, Counselors, Social Workers, Interns",
      colorClass: "text-orange-500",
      iconColorClass: "bg-orange-100 text-orange-500",
      icon: Headphones,
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
