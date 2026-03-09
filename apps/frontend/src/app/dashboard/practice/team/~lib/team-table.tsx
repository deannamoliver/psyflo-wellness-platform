"use client";

import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  UserMinus,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import type { TeamMemberRow } from "../page";

type SortKey = "name" | "role" | "patientCount" | "status" | "joinedAt";
type SortDir = "asc" | "desc";

export function TeamTable({ members }: { members: TeamMemberRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "therapist">("all");

  const pageSize = 10;

  // Filter
  let filtered = members;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }
  if (roleFilter !== "all") {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      therapist: "Therapist",
    };
    filtered = filtered.filter((m) => m.role === roleMap[roleFilter]);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else if (sortKey === "role") cmp = a.role.localeCompare(b.role);
    else if (sortKey === "patientCount") cmp = a.patientCount - b.patientCount;
    else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    else if (sortKey === "joinedAt") cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paginated = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-violet-50 text-violet-700";
      case "Therapist":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700";
      case "inactive":
        return "bg-gray-100 text-gray-500";
      case "pending":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const activeProviders = members.filter((m) => m.role === "Therapist" && m.status === "active").length;
  const totalPatients = members.reduce((sum, m) => sum + m.patientCount, 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Total Team Members</p>
          <p className="text-2xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Active Providers</p>
          <p className="text-2xl font-bold text-blue-600">{activeProviders}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Total Patients Assigned</p>
          <p className="text-2xl font-bold text-teal-600">{totalPatients}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Team Members <span className="ml-1 text-gray-500">({members.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Invite Member
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {(["all", "therapist", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r);
                    setPage(0);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    roleFilter === r
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {r === "all" ? "All" : r === "admin" ? "Admin" : "Providers"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("name")}
                >
                  Member {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("role")}
                >
                  Role {sortKey === "role" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("patientCount")}
                >
                  Patients {sortKey === "patientCount" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("status")}
                >
                  Status {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  onClick={() => toggleSort("joinedAt")}
                >
                  Joined {sortKey === "joinedAt" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No team members found.
                  </td>
                </tr>
              ) : (
                paginated.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
                          {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                          <p className="text-gray-500 text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", getRoleBadgeColor(member.role))}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {member.patientCount > 0 ? member.patientCount : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize", getStatusBadgeColor(member.status))}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(member.joinedAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Change role"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Deactivate"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
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

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowInviteModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select className="w-full rounded-lg border px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400">
                    <option value="therapist">Provider / Therapist</option>
                    <option value="admin">Practice Admin</option>
                  </select>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="flex items-center gap-2 text-blue-700 text-sm">
                    <Mail className="size-4" />
                    An invitation email will be sent to this address.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
