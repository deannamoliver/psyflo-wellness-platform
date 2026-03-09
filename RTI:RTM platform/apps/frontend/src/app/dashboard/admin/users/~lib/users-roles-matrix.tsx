"use client";

import {
  Check,
  Headphones,
  Info,
  Shield,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

function CheckIcon() {
  return <Check className="mx-auto size-5 text-gray-900" />;
}

function CrossIcon() {
  return <X className="mx-auto size-5 text-gray-400" />;
}

function ViewLabel() {
  return <span className="text-gray-500 text-sm">View</span>;
}

function RoleIcon({ icon, bg }: { icon: React.ReactNode; bg: string }) {
  return <span className={cn("inline-flex rounded-lg p-2", bg)}>{icon}</span>;
}

const PLATFORM_HEADERS = [
  "Role",
  "Practices",
  "Providers",
  "Clients",
  "Safety Monitor",
  "Conversations",
  "Referrals",
];

const SCHOOL_HEADERS = [
  "Role",
  "Home (Population Data)",
  "Risk Alerts & Summaries",
  "Client Profiles",
  "Conversations & Full Transcripts",
];

export function UsersRolesMatrix() {
  return (
    <div className="space-y-8 font-dm">
      {/* Platform Roles */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 rounded-t-lg border-gray-200 border-b bg-gray-900 px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="size-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">
            Internal & Platform Roles
          </h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-gray-200 border-b bg-gray-50/50">
              {PLATFORM_HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider first:text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-gray-100 border-b">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <RoleIcon
                    icon={<Shield className="size-4 text-purple-600" />}
                    bg="bg-purple-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Super Admin</p>
                    <p className="text-purple-600 text-xs">Internal Admin</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
            </tr>
            <tr className="border-gray-100 border-b">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <RoleIcon
                    icon={<UserCog className="size-4 text-blue-600" />}
                    bg="bg-blue-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      Clinical Supervisor
                    </p>
                    <p className="text-blue-600 text-xs">Internal Staff</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <ViewLabel />
              </td>
              <td className="px-4 py-4 text-center">
                <ViewLabel />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-center gap-2 border-gray-200 border-t bg-blue-50/50 px-6 py-3">
          <Info className="size-4 text-blue-600" />
          <p className="text-gray-600 text-sm">
            Functional permissions for each role across the platform
            level. Client-level data visibility is configured below in
            &apos;Client Data Access&apos;.
          </p>
        </div>
      </div>

      {/* School Dashboard Roles */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 rounded-t-lg border-gray-200 border-b bg-gray-900 px-6 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="size-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">
            Client Data Access (Provider Dashboard)
          </h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-gray-200 border-b bg-gray-50/50">
              {SCHOOL_HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider first:text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-gray-100 border-b">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <RoleIcon
                    icon={<UserRound className="size-4 text-teal-600" />}
                    bg="bg-teal-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Provider</p>
                    <p className="text-teal-600 text-xs">Clinical Oversight</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CrossIcon />
              </td>
            </tr>
            <tr className="border-gray-100 border-b">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <RoleIcon
                    icon={<Headphones className="size-4 text-green-600" />}
                    bg="bg-green-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Therapist</p>
                    <p className="text-green-600 text-xs">
                      Assigned Patients Only
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <CrossIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
              <td className="px-4 py-4 text-center">
                <CheckIcon />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
