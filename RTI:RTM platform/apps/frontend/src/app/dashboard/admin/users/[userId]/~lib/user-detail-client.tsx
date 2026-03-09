"use client";

import {
  ArrowLeft,
  Building2,
  Calendar,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import { DeactivateUsersModal } from "../../~lib/deactivate-users-modal";
import {
  ROLE_BADGE_CONFIG,
  STATUS_BADGE_CONFIG,
  type UserRole,
  type UserStatus,
} from "../../~lib/users-data";
import { EditUserModal } from "./edit-user-modal";
import { ActionButton, InfoRow } from "./user-detail-components";
import type { UserDetail } from "./user-detail-queries";

type Props = { user: UserDetail };

export function UserDetailClient({ user }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const roleConfig = ROLE_BADGE_CONFIG[user.displayRole as UserRole];
  const statusConfig = STATUS_BADGE_CONFIG[user.displayStatus as UserStatus];

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Link
          href="/dashboard/admin/users"
          className="flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Users
        </Link>
        <span>/</span>
        <span className="text-gray-900">{user.name}</span>
      </div>

      {/* Profile Header */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 text-xl">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
          <div>
            <h1 className="font-bold text-2xl text-gray-900">{user.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {roleConfig && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs",
                    roleConfig.bg,
                    roleConfig.text,
                  )}
                >
                  {user.displayRole}
                </span>
              )}
              {statusConfig && (
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 font-semibold text-xs",
                    statusConfig.bg,
                    statusConfig.text,
                  )}
                >
                  {user.displayStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900 text-lg">
            Contact Information
          </h2>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phone} />
            <InfoRow
              icon={Building2}
              label="Organization"
              value={
                user.organizations.length > 0
                  ? user.organizations.map((o) => o.name).join(", ")
                  : user.locations.length > 0
                    ? user.locations.map((l) => l.name).join(", ")
                    : null
              }
            />
            <InfoRow
              icon={MapPin}
              label="Location(s)"
              value={
                user.locations.length > 0 ? (
                  <span className="flex flex-wrap gap-1.5">
                    {user.locations.map((l) => (
                      <span
                        key={l.id}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs"
                      >
                        {l.name}
                      </span>
                    ))}
                  </span>
                ) : null
              }
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900 text-lg">
            Account Information
          </h2>
          <div className="divide-y divide-gray-100">
            <InfoRow
              icon={Shield}
              label="Platform Role"
              value={user.displayRole}
            />
            <InfoRow
              icon={Shield}
              label="Account Status"
              value={user.displayStatus}
            />
            <InfoRow
              icon={Calendar}
              label="Date Added"
              value={user.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={user.updatedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoRow icon={Shield} label="Added By" value={user.addedByName} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900 text-lg">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            icon={Pencil}
            label="Edit User"
            variant="default"
            onClick={() => setEditOpen(true)}
          />
          <ActionButton
            icon={KeyRound}
            label="Reset Password"
            variant="default"
            disabled
          />
          {user.displayStatus !== "Inactive" && (
            <ActionButton
              icon={UserX}
              label="Deactivate User"
              variant="danger"
              onClick={() => setDeactivateOpen(true)}
            />
          )}
        </div>
      </div>

      <EditUserModal
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={user.id}
        initialData={user}
      />

      <DeactivateUsersModal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        userIds={[user.id]}
        onComplete={() => {}}
      />

      {/* Internal Notes */}
      {user.internalNotes && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-900 text-lg">
            Internal Notes
          </h2>
          <p className="whitespace-pre-wrap text-gray-600 text-sm">
            {user.internalNotes}
          </p>
        </div>
      )}
    </div>
  );
}
