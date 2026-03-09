"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Filter,
  Info,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { OrgPatientRow } from "../page";

type MyCaseloadSortKey = "name" | "billableDays" | "providerMinutes" | "daysAgo";
type PracticeCaseloadSortKey = "name" | "assignedProvider" | "enrollmentDate" | "lastActivity" | "rtmStatus";
type SortDir = "asc" | "desc";
type ViewMode = "my-caseload" | "practice-caseload";

function getRtmStatusBadge(status: string) {
  switch (status) {
    case "Eligible":
      return "bg-emerald-50 text-emerald-700";
    case "At Risk":
      return "bg-amber-50 text-amber-700";
    case "Ineligible":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getBillingEligibilityBadge(eligible: boolean) {
  return eligible
    ? "bg-emerald-50 text-emerald-700"
    : "bg-gray-100 text-gray-500";
}

function getBillableDaysColor(days: number) {
  if (days >= 16) return "bg-emerald-50 text-emerald-700";
  if (days >= 2) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function getProviderTimeColor(minutes: number) {
  if (minutes >= 20) return "bg-emerald-50 text-emerald-700";
  if (minutes >= 10) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function getInviteStatusBadge(status: OrgPatientRow["inviteStatus"]) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "invite_sent":
      return "bg-amber-50 text-amber-700";
    case "deactivated":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getInviteStatusLabel(status: OrgPatientRow["inviteStatus"]) {
  switch (status) {
    case "active":
      return "Active";
    case "invite_sent":
      return "Invite Sent";
    case "deactivated":
      return "Deactivated";
    default:
      return status;
  }
}

// Invite Patient Modal Component
function InvitePatientModal({
  isOpen,
  onClose,
  providers,
  currentUserProvider,
  isPracticeManager,
}: {
  isOpen: boolean;
  onClose: () => void;
  providers: string[];
  currentUserProvider: string;
  isPracticeManager: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedProvider, setAssignedProvider] = useState(currentUserProvider);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    onClose();
    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAssignedProvider(currentUserProvider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Invite New Patient</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          {isPracticeManager && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Assign to Provider</label>
              <select
                value={assignedProvider}
                onChange={(e) => setAssignedProvider(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Patient Actions Menu Component
function PatientActionsMenu({
  patient,
  providers,
  currentUserProvider,
  isPracticeManager,
  isOnMyCaseload,
  onClose,
}: {
  patient: OrgPatientRow;
  providers: string[];
  currentUserProvider: string;
  isPracticeManager: boolean;
  isOnMyCaseload: boolean;
  onClose: () => void;
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Permissions:
  // - Providers (My Caseload): add to care team, transfer, deactivate
  // - Practice Managers (My Caseload): add to care team, transfer, deactivate
  // - Practice Managers (Practice Caseload, not their patient): transfer, deactivate only (no add to care team - HIPAA)
  const canAddToCareTeam = isOnMyCaseload;
  const canTransfer = true; // Both providers and practice managers can transfer
  const canDeactivate = true; // Both can deactivate (practice managers can deactivate any patient)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAddProvider = (provider: string) => {
    // Mock action - in production this would call an API
    console.log(`Adding ${provider} to ${patient.name}'s care team`);
    setShowAddProviderModal(false);
    onClose();
  };

  const handleTransferPatient = (provider: string) => {
    // Mock action - in production this would call an API
    console.log(`Transferring ${patient.name} to ${provider}`);
    setShowAssignModal(false);
    onClose();
  };

  const handleDeactivate = () => {
    // Mock action - in production this would call an API
    console.log(`Deactivating ${patient.name}'s account`);
    onClose();
  };

  const availableProviders = providers.filter(
    (p) => p !== patient.assignedProvider && !(patient.careTeam ?? []).includes(p)
  );

  return (
    <div ref={menuRef} className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border bg-white py-1 shadow-lg">
      {showAddProviderModal ? (
        <div className="p-2">
          <p className="mb-2 text-xs font-medium text-gray-700">Add provider to care team:</p>
          {availableProviders.length > 0 ? (
            availableProviders.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleAddProvider(p)}
                className="w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {p}
              </button>
            ))
          ) : (
            <p className="px-2 py-1.5 text-xs text-gray-500">All providers already added</p>
          )}
          <button
            type="button"
            onClick={() => setShowAddProviderModal(false)}
            className="mt-2 w-full rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      ) : showAssignModal ? (
        <div className="p-2">
          <p className="mb-2 text-xs font-medium text-gray-700">Transfer patient to:</p>
          {providers.filter((p) => p !== patient.assignedProvider).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleTransferPatient(p)}
              className="w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAssignModal(false)}
            className="mt-2 w-full rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            Back
          </button>
        </div>
      ) : (
        <>
          {canAddToCareTeam && (
            <button
              type="button"
              onClick={() => setShowAddProviderModal(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserPlus className="h-4 w-4" />
              Add provider to care team
            </button>
          )}
          {canTransfer && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              <Users className="h-4 w-4" />
              Transfer patient
            </button>
          )}
          {canDeactivate && (
            <>
              <hr className="my-1" />
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <UserMinus className="h-4 w-4" />
                Deactivate account
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function CaseloadsClient({
  patients,
  providers,
  currentUserProvider,
}: {
  patients: OrgPatientRow[];
  providers: string[];
  currentUserProvider: string;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("my-caseload");
  const [search, setSearch] = useState("");
  const [myCaseloadSortKey, setMyCaseloadSortKey] = useState<MyCaseloadSortKey>("name");
  const [practiceSortKey, setPracticeSortKey] = useState<PracticeCaseloadSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeActionsMenu, setActiveActionsMenu] = useState<string | null>(null);
  
  // For demo, practice managers see the practice caseload view
  // In production, this would come from user role data
  const isPracticeManager = viewMode === "practice-caseload";

  const pageSize = 15;

  // Get base patients based on view mode
  const myCaseloadPatients = patients.filter(p => p.assignedProvider === currentUserProvider);
  const basePatients = viewMode === "my-caseload" ? myCaseloadPatients : patients;

  // Filter
  let filtered = basePatients;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.assignedProvider.toLowerCase().includes(q),
    );
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter((p) => p.status === statusFilter);
  }
  if (providerFilter !== "all" && viewMode === "practice-caseload") {
    filtered = filtered.filter((p) => p.assignedProvider === providerFilter);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (viewMode === "my-caseload") {
      if (myCaseloadSortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (myCaseloadSortKey === "billableDays") cmp = a.billableDays - b.billableDays;
      else if (myCaseloadSortKey === "providerMinutes") cmp = a.providerMinutes - b.providerMinutes;
      else if (myCaseloadSortKey === "daysAgo") cmp = a.daysAgo - b.daysAgo;
    } else {
      if (practiceSortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (practiceSortKey === "assignedProvider") cmp = a.assignedProvider.localeCompare(b.assignedProvider);
      else if (practiceSortKey === "enrollmentDate") cmp = a.lastActivity.localeCompare(b.lastActivity);
      else if (practiceSortKey === "lastActivity") cmp = a.daysAgo - b.daysAgo;
      else if (practiceSortKey === "rtmStatus") cmp = (a.riskLevel ?? "").localeCompare(b.riskLevel ?? "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paginated = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const toggleMyCaseloadSort = (key: MyCaseloadSortKey) => {
    if (myCaseloadSortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setMyCaseloadSortKey(key);
      setSortDir("asc");
    }
  };

  const togglePracticeSort = (key: PracticeCaseloadSortKey) => {
    if (practiceSortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setPracticeSortKey(key);
      setSortDir("asc");
    }
  };

  const activeCount = basePatients.filter((p) => p.status === "active").length;
  const billingEligibleCount = basePatients.filter((p) => p.billableDays >= 16).length;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(0);
    setProviderFilter("all");
  };

  // Helper to get RTM status from risk level
  const getRtmStatus = (riskLevel: string | null): string => {
    if (!riskLevel || riskLevel === "low") return "Eligible";
    if (riskLevel === "moderate") return "At Risk";
    return "Ineligible";
  };

  // Helper to get billing eligibility
  const getBillingEligibility = (billableDays: number): boolean => {
    return billableDays >= 16;
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle + Invite Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleViewModeChange("my-caseload")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "my-caseload"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <User className="h-4 w-4" />
            My Caseload
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("practice-caseload")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "practice-caseload"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <Users className="h-4 w-4" />
            Practice Caseload
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Invite Patient
        </button>
      </div>

      {/* HIPAA Info Banner for Practice Caseload */}
      {viewMode === "practice-caseload" && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <p className="text-sm text-blue-700">
            Practice view shows operational data only. To view clinical details for a patient, they must be on your caseload.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/50 px-5 py-4">
          <div>
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-xl font-bold text-gray-900">{basePatients.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{viewMode === "my-caseload" ? "Your Patients" : "Providers"}</p>
            <p className="text-xl font-bold text-blue-600">
              {viewMode === "my-caseload" ? basePatients.length : providers.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Billing Eligible</p>
            <p className="text-xl font-bold text-teal-600">{billingEligibleCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {viewMode === "my-caseload" ? "My Patients" : "All Practice Patients"}{" "}
              <span className="ml-1 text-gray-500">({filtered.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                showFilters ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="h-9 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex items-center gap-4 border-b bg-gray-50/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <div className="flex items-center gap-1">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(0);
                    }}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      statusFilter === s
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {viewMode === "practice-caseload" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Provider:</span>
                <select
                  value={providerFilter}
                  onChange={(e) => {
                    setProviderFilter(e.target.value);
                    setPage(0);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-gray-400"
                >
                  <option value="all">All Providers</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Table - Different columns based on view mode */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {viewMode === "my-caseload" ? (
              /* MY CASELOAD TABLE - Clinical view with clickable names */
              <>
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th
                      className="cursor-pointer px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => toggleMyCaseloadSort("name")}
                    >
                      Patient {myCaseloadSortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => toggleMyCaseloadSort("billableDays")}
                    >
                      Data Days {myCaseloadSortKey === "billableDays" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => toggleMyCaseloadSort("providerMinutes")}
                    >
                      Provider Time {myCaseloadSortKey === "providerMinutes" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Treatment Plan
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => toggleMyCaseloadSort("daysAgo")}
                    >
                      Last Engagement {myCaseloadSortKey === "daysAgo" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((patient) => (
                      <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <Link
                            href={`/dashboard/practice/patients/${patient.id}/overview`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                          >
                            {patient.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getInviteStatusBadge(patient.inviteStatus))}>
                            {getInviteStatusLabel(patient.inviteStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getBillableDaysColor(patient.billableDays))}>
                            {patient.billableDays} / 30
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getProviderTimeColor(patient.providerMinutes))}>
                            {patient.providerMinutes} min
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {patient.treatmentPlan ? (
                            <span className="text-xs">{patient.treatmentPlan}</span>
                          ) : (
                            <span className="text-xs italic text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {patient.daysAgo === 0 ? "Today" : patient.daysAgo === 1 ? "1 day" : `${patient.daysAgo} days`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                              title="Call patient"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                              title="Message patient"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveActionsMenu(activeActionsMenu === patient.id ? null : patient.id)}
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {activeActionsMenu === patient.id && (
                              <PatientActionsMenu
                                patient={patient}
                                providers={providers}
                                currentUserProvider={currentUserProvider}
                                isPracticeManager={isPracticeManager}
                                isOnMyCaseload={true}
                                onClose={() => setActiveActionsMenu(null)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            ) : (
              /* PRACTICE CASELOAD TABLE - Operational view, NO clickable names (HIPAA boundary) */
              <>
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th
                      className="cursor-pointer px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => togglePracticeSort("name")}
                    >
                      Patient Name {practiceSortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => togglePracticeSort("assignedProvider")}
                    >
                      Assigned Provider {practiceSortKey === "assignedProvider" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => togglePracticeSort("enrollmentDate")}
                    >
                      Enrollment Date {practiceSortKey === "enrollmentDate" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => togglePracticeSort("lastActivity")}
                    >
                      Last Activity {practiceSortKey === "lastActivity" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={() => togglePracticeSort("rtmStatus")}
                    >
                      RTM Status {practiceSortKey === "rtmStatus" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Billing Eligibility
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((patient) => (
                      <tr key={patient.id} className="transition-colors hover:bg-gray-50/50">
                        {/* Patient name is NOT clickable - plain text only */}
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {patient.assignedProvider}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(patient.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {patient.daysAgo === 0 ? "Today" : patient.daysAgo === 1 ? "1 day ago" : `${patient.daysAgo} days ago`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getRtmStatusBadge(getRtmStatus(patient.riskLevel)))}>
                            {getRtmStatus(patient.riskLevel)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getBillingEligibilityBadge(getBillingEligibility(patient.billableDays)))}>
                            {getBillingEligibility(patient.billableDays) ? "Eligible" : "Not Eligible"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getInviteStatusBadge(patient.inviteStatus))}>
                            {getInviteStatusLabel(patient.inviteStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => setActiveActionsMenu(activeActionsMenu === patient.id ? null : patient.id)}
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {activeActionsMenu === patient.id && (
                              <PatientActionsMenu
                                patient={patient}
                                providers={providers}
                                currentUserProvider={currentUserProvider}
                                isPracticeManager={isPracticeManager}
                                isOnMyCaseload={patient.assignedProvider === currentUserProvider}
                                onClose={() => setActiveActionsMenu(null)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing {sorted.length > 0 ? safePage * pageSize + 1 : 0}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-gray-600">
              {safePage + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invite Patient Modal */}
      <InvitePatientModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        providers={providers}
        currentUserProvider={currentUserProvider}
        isPracticeManager={isPracticeManager}
      />
    </div>
  );
}
