"use client";

import { Headphones, Shield, UserCog, UserRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import {
  type AdminUser,
  ROLE_BADGE_CONFIG,
  STATUS_BADGE_CONFIG,
  type UserRole,
} from "./users-data";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  "Super Admin": <Shield className="size-3.5" />,
  "Clinical Supervisor": <UserCog className="size-3.5" />,
  Provider: <UserRound className="size-3.5" />,
  Therapist: <Headphones className="size-3.5" />,
};

type Props = {
  rows: AdminUser[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onDeactivate: (userId: string) => void;
};

function RoleBadge({ role }: { role: UserRole }) {
  const config = ROLE_BADGE_CONFIG[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs",
        config.bg,
        config.text,
      )}
    >
      {ROLE_ICONS[role]}
      {role}
    </span>
  );
}

export function UsersTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onDeactivate,
}: Props) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white font-dm text-gray-500 shadow-sm">
        No providers found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            <TableHead className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="size-4 rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Provider
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Role
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Practice
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Location(s)
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user) => {
            const statusConfig = STATUS_BADGE_CONFIG[user.status];
            const locationExtra =
              user.locations.length > 1
                ? `+${user.locations.length - 1}`
                : null;

            return (
              <TableRow
                key={user.id}
                className="border-gray-100 border-b transition-colors hover:bg-gray-50"
              >
                <TableCell className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => onToggleSelect(user.id)}
                    className="size-4 rounded border-gray-300"
                  />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="px-4 py-4 text-gray-600 text-sm">
                  {user.organization ?? "-"}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">
                      {user.locations[0] ?? "-"}
                    </span>
                    {locationExtra && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-500 text-xs">
                        {locationExtra}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-full px-3 py-1 font-semibold text-xs",
                      statusConfig.bg,
                      statusConfig.text,
                    )}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/dashboard/admin/users/${user.id}`}
                      className="font-medium text-blue-600 text-sm hover:text-blue-800"
                    >
                      View
                    </a>
                    {user.status !== "Inactive" && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(user.id)}
                        className="font-medium text-red-600 text-sm hover:text-red-800"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
