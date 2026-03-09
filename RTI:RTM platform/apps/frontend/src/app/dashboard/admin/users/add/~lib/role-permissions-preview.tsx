"use client";

import { Check, CircleHelp, UserCog, X } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";
import { ROLE_PERMS } from "./role-permissions-data";

export function RolePermissionsPreview({ role }: { role: string }) {
  const config = ROLE_PERMS[role];

  if (!config) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <CircleHelp className="size-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">
            Role Permissions Preview
          </h3>
        </div>
        <p className="text-gray-500 text-sm">
          Select a role above to preview permissions
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CircleHelp className="size-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900">
          Role Permissions Preview
        </h3>
      </div>

      <div
        className={cn(
          "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5",
          config.badgeBg,
        )}
      >
        <UserCog className={cn("size-4", config.badgeText)} />
        <span className={cn("font-semibold text-sm", config.badgeText)}>
          {config.label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {config.permissions.map((perm) => (
          <div
            key={perm.label}
            className={cn(
              "rounded-lg border p-3",
              perm.allowed
                ? cn(config.allowedBg, config.allowedBorder)
                : cn(config.deniedBg, config.deniedBorder),
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  perm.allowed ? config.allowedIconBg : "bg-red-500",
                )}
              >
                {perm.allowed ? (
                  <Check className="size-3 text-white" />
                ) : (
                  <X className="size-3 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {perm.label}
                </p>
                <p className="text-gray-500 text-xs">{perm.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
