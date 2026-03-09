"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminReferralModal } from "./admin-referral-modal";
import type { AdminReferral, ReferralsPageData } from "./referrals-data";
import { ReferralsFilters } from "./referrals-filters";
import { ReferralsPagination } from "./referrals-pagination";
import { ReferralsStatCards } from "./referrals-stat-cards";
import { ReferralsTable } from "./referrals-table";

type Props = { data: ReferralsPageData };

export function ReferralsClient({ data }: Props) {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    let result: AdminReferral[] = data.referrals;
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }
    if (orgFilter !== "all") {
      result = result.filter((r) => r.organization === orgFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (urgencyFilter !== "all") {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }
    return result;
  }, [search, orgFilter, statusFilter, urgencyFilter, data.referrals]);

  const totalItems = filtered.length;
  const paginatedRows = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  function handleReset() {
    setSearch("");
    setOrgFilter("all");
    setStatusFilter("all");
    setUrgencyFilter("all");
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-dm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">Referrals</h1>
          <p className="mt-1 text-gray-500">
            Monitor and manage all therapy referrals submitted to the care
            coordination team
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReferralModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="size-4" />
          New Referral
        </button>
      </div>

      <ReferralsStatCards stats={data.stats} />

      <ReferralsFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        orgFilter={orgFilter}
        onOrgFilterChange={(v) => {
          setOrgFilter(v);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={(v) => {
          setUrgencyFilter(v);
          setCurrentPage(1);
        }}
        onReset={handleReset}
        orgs={data.orgs}
      />

      <ReferralsTable rows={paginatedRows} />

      <ReferralsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={setCurrentPage}
      />

      <AdminReferralModal
        open={referralModalOpen}
        onOpenChange={setReferralModalOpen}
      />
    </div>
  );
}
