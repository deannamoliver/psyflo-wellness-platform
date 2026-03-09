"use client";

import { ChevronLeft, ChevronRight, Plus, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { AddUserModal } from "@/app/dashboard/admin/organizations/add-location/~lib/add-user-modal";
import type { StaffMember as ModalStaffMember } from "@/app/dashboard/admin/organizations/add-location/~lib/types";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import { FilterDropdown } from "./filter-dropdown";
import type { LocationDetail, StaffMember } from "./location-detail-data";
import { updateStaffMember } from "./location-staff-actions";
import { StaffTable } from "./location-staff-table";

const PER_PAGE = 6;

type FormRole = ModalStaffMember["role"];

function toFormRole(platformRole: string, schoolRole: string): FormRole {
  if (platformRole === "admin") return "super_admin";
  if (platformRole === "clinical_supervisor") return "clinical_supervisor";
  if (schoolRole === "wellness_coach") return "coach";
  return "site_staff";
}

function toModalData(member: StaffMember): ModalStaffMember {
  const formRole = toFormRole(member.platformRole, member.schoolRole);
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email === "--" ? "" : member.email,
    phone: member.phone,
    roleTitle: member.roleTitle,
    role: formRole,
    notes: member.notes,
  };
}

export function LocationStaffTab({ location }: { location: LocationDetail }) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  async function handleSave(data: Omit<ModalStaffMember, "id">) {
    if (!editingMember) return;
    await updateStaffMember(editingMember.id, location.id, location.orgId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      roleTitle: data.roleTitle,
      phone: data.phone,
      notes: data.notes,
    });
    setEditingMember(null);
  }

  const filtered = useMemo(() => {
    let result: StaffMember[] = location.staff;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    return result;
  }, [location.staff, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, filtered.length);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Staff</h2>
          <p className="mt-1 text-gray-500 text-sm">
            All users associated with this organization
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-lg flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 border-gray-200 bg-white pl-10 font-dm"
          />
        </div>
        <FilterDropdown
          label="All Locations"
          value={locationFilter}
          options={[
            { value: "all", label: "All Locations" },
            { value: "current", label: location.locationName },
          ]}
          onChange={(v) => {
            setLocationFilter(v);
            setPage(1);
          }}
        />
        <FilterDropdown
          label="All Status"
          value={statusFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
      </div>

      <StaffTable rows={paged} onView={(member) => setEditingMember(member)} />

      {editingMember && (
        <AddUserModal
          onClose={() => setEditingMember(null)}
          onSave={handleSave}
          initialData={toModalData(editingMember)}
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-gray-500 text-sm">
          Showing {start} to {end} of {filtered.length} users
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn(
              "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm",
              page === 1
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-700 hover:bg-gray-50",
            )}
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(
            (n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md font-medium text-sm",
                  page === n
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                {n}
              </button>
            ),
          )}
          {totalPages > 3 && (
            <>
              <span className="px-2 text-gray-400 text-sm">...</span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md font-medium text-sm",
                  page === totalPages
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                )}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={cn(
              "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm",
              page === totalPages
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-700 hover:bg-gray-50",
            )}
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
