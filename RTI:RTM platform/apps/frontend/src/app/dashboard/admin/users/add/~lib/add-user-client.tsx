"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { type AddUserFormState, createUser } from "./add-user-actions";
import { AddUserForm } from "./add-user-form";
import type { OrgOption } from "./add-user-queries";
import { QuickGuide } from "./quick-guide";
import { RolePermissionsPreview } from "./role-permissions-preview";

type Props = {
  organizations: OrgOption[];
};

export function AddUserClient({ organizations }: Props) {
  const [role, setRole] = useState("");
  const [platform, setPlatform] = useState<"internal" | "client" | "">("");
  const [state, formAction, isPending] = useActionState<
    AddUserFormState,
    FormData
  >(createUser, {});

  function handlePlatformChange(p: "internal" | "client") {
    setPlatform(p);
    setRole("");
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      {/* Header */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/admin/users"
            className="text-gray-500 transition-colors hover:text-blue-600"
          >
            Providers
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="font-medium text-gray-700">Add New Provider</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/users"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="font-bold text-3xl text-gray-900">Add New Provider</h1>
            <p className="mt-1 text-gray-500">
              Create a new provider account and assign appropriate role and
              permissions
            </p>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* 2-column layout */}
      <form
        action={formAction}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px]"
      >
        {/* Left column - Form */}
        <AddUserForm
          organizations={organizations}
          role={role}
          platform={platform}
          onRoleChange={setRole}
          onPlatformChange={handlePlatformChange}
          isPending={isPending}
        />

        {/* Right column - Sidebar */}
        <div className="sticky top-8 flex flex-col gap-6">
          <QuickGuide />
          <RolePermissionsPreview role={role} />
        </div>
      </form>
    </div>
  );
}
