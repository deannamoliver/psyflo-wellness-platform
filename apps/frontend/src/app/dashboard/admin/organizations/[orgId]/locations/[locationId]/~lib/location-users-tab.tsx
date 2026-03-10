"use client";

import { ChevronLeft, ChevronRight, Plus, SearchIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddUserModal } from "@/app/dashboard/admin/organizations/add-location/~lib/add-user-modal";
import type { StaffMember as ModalStaffMember } from "@/app/dashboard/admin/organizations/add-location/~lib/types";
import { Input } from "@/lib/core-ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { cn } from "@/lib/tailwind-utils";
import { FilterDropdown } from "./filter-dropdown";
import type { LocationDetail, StaffMember, StudentRecord } from "./location-detail-data";
import { updateStaffMember } from "./location-staff-actions";

const PER_PAGE = 10;

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

type UserRow = {
  id: string;
  name: string;
  email: string;
  userType: "Provider" | "Practice Management" | "Patient";
  status: "Active" | "Inactive";
  assignedPatients?: number;
  assignedPatientNames?: string[];
  assignedProvider?: string;
  assignedProviderId?: string;
  originalStaff?: StaffMember;
  originalPatient?: StudentRecord;
};

// Dynamically build provider-patient assignments based on actual data
function buildUserRows(staff: StaffMember[], patients: StudentRecord[]): UserRow[] {
  // Get providers (staff with wellness_coach role or provider-like roles)
  const providers = staff.filter(
    (s) => s.role.toLowerCase().includes("provider") || s.schoolRole === "wellness_coach"
  );
  
  // Dynamically assign patients to providers for demo purposes
  // Distribute patients evenly among providers
  const providerAssignments: Record<string, { patientIds: string[]; patientNames: string[] }> = {};
  const patientToProvider: Record<string, { name: string; id: string }> = {};
  
  if (providers.length > 0 && patients.length > 0) {
    // Initialize provider assignments
    providers.forEach((p) => {
      providerAssignments[p.id] = { patientIds: [], patientNames: [] };
    });
    
    // Distribute patients among providers
    patients.forEach((patient, index) => {
      const providerIndex = index % providers.length;
      const provider = providers[providerIndex];
      providerAssignments[provider.id].patientIds.push(patient.id);
      providerAssignments[provider.id].patientNames.push(patient.name);
      patientToProvider[patient.id] = { name: provider.name, id: provider.id };
    });
  }

  const staffRows: UserRow[] = staff.map((s) => {
    const isProvider = s.role.toLowerCase().includes("provider") || s.schoolRole === "wellness_coach";
    const assignments = providerAssignments[s.id] || { patientIds: [], patientNames: [] };
    // Don't set originalStaff for sample data (IDs starting with "sample-")
    const isSampleData = s.id.startsWith("sample-");
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      userType: isProvider ? "Provider" : "Practice Management",
      status: s.status,
      assignedPatients: assignments.patientNames.length,
      assignedPatientNames: assignments.patientNames,
      originalStaff: isSampleData ? undefined : s,
    };
  });

  const patientRows: UserRow[] = patients.map((p) => {
    // Don't set originalPatient for sample data (IDs starting with "sample-")
    const isSampleData = p.id.startsWith("sample-");
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      userType: "Patient",
      status: "Active",
      assignedProvider: patientToProvider[p.id]?.name,
      assignedProviderId: patientToProvider[p.id]?.id,
      originalPatient: isSampleData ? undefined : p,
    };
  });

  return [...staffRows, ...patientRows];
}

// Sample data for demonstration when no real data exists
const SAMPLE_STAFF: StaffMember[] = [
  {
    id: "sample-staff-1",
    name: "Dr. Jane Wilson",
    role: "Provider",
    locations: ["Main Location"],
    email: "jane.wilson@example.com",
    status: "Active",
    firstName: "Jane",
    lastName: "Wilson",
    roleTitle: "Licensed Clinical Psychologist",
    phone: "(555) 123-4567",
    notes: "",
    platformRole: "user",
    schoolRole: "wellness_coach",
  },
  {
    id: "sample-staff-2",
    name: "Dr. Robert Chen",
    role: "Provider",
    locations: ["Main Location"],
    email: "robert.chen@example.com",
    status: "Active",
    firstName: "Robert",
    lastName: "Chen",
    roleTitle: "Licensed Marriage & Family Therapist",
    phone: "(555) 234-5678",
    notes: "",
    platformRole: "user",
    schoolRole: "wellness_coach",
  },
  {
    id: "sample-staff-3",
    name: "Sarah Martinez",
    role: "Practice Management",
    locations: ["Main Location"],
    email: "sarah.martinez@example.com",
    status: "Active",
    firstName: "Sarah",
    lastName: "Martinez",
    roleTitle: "Office Manager",
    phone: "(555) 345-6789",
    notes: "",
    platformRole: "user",
    schoolRole: "site_staff",
  },
];

const SAMPLE_PATIENTS: StudentRecord[] = [
  { id: "sample-patient-1", name: "John Smith", email: "john.smith@email.com", studentId: "P001", grade: 0 },
  { id: "sample-patient-2", name: "Emily Davis", email: "emily.davis@email.com", studentId: "P002", grade: 0 },
  { id: "sample-patient-3", name: "Michael Brown", email: "michael.brown@email.com", studentId: "P003", grade: 0 },
  { id: "sample-patient-4", name: "Sarah Johnson", email: "sarah.johnson@email.com", studentId: "P004", grade: 0 },
  { id: "sample-patient-5", name: "David Wilson", email: "david.wilson@email.com", studentId: "P005", grade: 0 },
  { id: "sample-patient-6", name: "Jessica Lee", email: "jessica.lee@email.com", studentId: "P006", grade: 0 },
];

export function LocationUsersTab({ location }: { location: LocationDetail }) {
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // Use sample data if no real data exists
  const effectiveStaff = location.staff.length > 0 ? location.staff : SAMPLE_STAFF;
  const effectivePatients = location.patients.length > 0 ? location.patients : SAMPLE_PATIENTS;

  const allUsers = useMemo(
    () => buildUserRows(effectiveStaff, effectivePatients),
    [effectiveStaff, effectivePatients]
  );

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
    let result = allUsers;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (userTypeFilter !== "all") {
      result = result.filter((u) => u.userType === userTypeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [allUsers, search, userTypeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const start = filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const end = Math.min(page * PER_PAGE, filtered.length);

  const staffCount = location.staff.length;
  const patientCount = location.patients.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="font-bold text-2xl text-gray-900">{staffCount + patientCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Staff (Providers & Practice Mgmt)</p>
          <p className="font-bold text-2xl text-gray-900">{staffCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Patients</p>
          <p className="font-bold text-2xl text-gray-900">{patientCount}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Users & Permissions</h2>
            <p className="mt-1 text-gray-500 text-sm">
              All users associated with this location
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddPatientModal(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </button>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="relative max-w-lg flex-1">
            <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 border-gray-200 bg-white pl-10 font-dm"
            />
          </div>
          <FilterDropdown
            label="All User Types"
            value={userTypeFilter}
            options={[
              { value: "all", label: "All User Types" },
              { value: "Provider", label: "Provider" },
              { value: "Practice Management", label: "Practice Management" },
              { value: "Patient", label: "Patient" },
            ]}
            onChange={(v) => {
              setUserTypeFilter(v);
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

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 border-b bg-gray-50/50">
                <TableHead className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  User Type
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Assignments
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
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-gray-100 border-b transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          user.userType === "Provider" && "bg-blue-100 text-blue-700",
                          user.userType === "Practice Management" && "bg-purple-100 text-purple-700",
                          user.userType === "Patient" && "bg-green-100 text-green-700"
                        )}
                      >
                        {user.userType}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      {user.userType === "Provider" && user.assignedPatientNames && user.assignedPatientNames.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 text-xs">
                            {user.assignedPatients} patient{user.assignedPatients !== 1 ? "s" : ""}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {user.assignedPatientNames.slice(0, 3).map((name, idx) => (
                              <span key={idx} className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                                {name}
                              </span>
                            ))}
                            {user.assignedPatientNames.length > 3 && (
                              <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                                +{user.assignedPatientNames.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : user.userType === "Patient" && user.assignedProvider ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-500 text-[10px] uppercase">Assigned to:</span>
                          <Link 
                            href={`/dashboard/admin/users/${user.assignedProviderId}`}
                            className="text-blue-600 text-xs font-medium hover:text-blue-800"
                          >
                            {user.assignedProvider}
                          </Link>
                        </div>
                      ) : user.userType === "Patient" ? (
                        <span className="text-amber-600 text-xs italic">Unassigned</span>
                      ) : (
                        <span className="text-gray-400 text-xs">--</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* View Profile for real staff from database (providers and practice management) */}
                        {user.userType !== "Patient" && user.originalStaff && (
                          <Link
                            href={`/dashboard/admin/users/${user.id}`}
                            className="font-medium text-blue-600 text-sm hover:text-blue-800"
                          >
                            View
                          </Link>
                        )}
                        {/* Sample data indicator for non-real staff */}
                        {user.userType !== "Patient" && !user.originalStaff && (
                          <span className="text-gray-400 text-xs italic">Sample data</span>
                        )}
                        {/* View Patient Profile - redirects to patients page */}
                        {user.userType === "Patient" && user.originalPatient && (
                          <Link
                            href={`/dashboard/admin/patients/${user.id}`}
                            className="font-medium text-blue-600 text-sm hover:text-blue-800"
                          >
                            View
                          </Link>
                        )}
                        {/* Sample patient data indicator */}
                        {user.userType === "Patient" && !user.originalPatient && (
                          <span className="text-gray-400 text-xs italic">Sample data</span>
                        )}
                        {/* Edit button for real staff */}
                        {user.originalStaff && (
                          <button
                            type="button"
                            onClick={() => setEditingMember(user.originalStaff!)}
                            className="font-medium text-gray-500 text-sm hover:text-gray-700"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
                  : "text-gray-700 hover:bg-gray-50"
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
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {n}
                </button>
              )
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
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingMember && (
        <AddUserModal
          onClose={() => setEditingMember(null)}
          onSave={handleSave}
          initialData={toModalData(editingMember)}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSave={async (data) => {
            console.log("User added:", data);
            setShowAddUserModal(false);
          }}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowAddPatientModal(false)}
          onSave={async (data) => {
            console.log("Patient added:", data);
            setShowAddPatientModal(false);
          }}
          providers={effectiveStaff
            .filter((s) => s.role.toLowerCase().includes("provider") || s.schoolRole === "wellness_coach")
            .map((s) => ({ id: s.id, name: s.name }))}
        />
      )}
    </div>
  );
}

// Add Patient Modal - matches the caseload "Add Patient to Roster" modal
type AddPatientData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  assignedProviderId: string;
};

type ProviderOption = {
  id: string;
  name: string;
};

function AddPatientModal({
  onClose,
  onSave,
  providers,
}: {
  onClose: () => void;
  onSave: (data: AddPatientData) => Promise<void>;
  providers: ProviderOption[];
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [assignedProviderId, setAssignedProviderId] = useState("");
  const [saving, setSaving] = useState(false);

  const isValid = firstName.trim() && lastName.trim() && email.trim() && assignedProviderId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Patient to Roster</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isValid) return;
            setSaving(true);
            try {
              await onSave({ firstName, lastName, email, phone, dateOfBirth, assignedProviderId });
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="patient@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assign to Provider <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={assignedProviderId}
              onChange={(e) => setAssignedProviderId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Select a provider...</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select which provider this patient will be assigned to
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
