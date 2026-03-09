"use client";

import { Loader2, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Input } from "@/lib/core-ui/input";
import { cn } from "@/lib/tailwind-utils";
import {
  type StudentSearchResult,
  searchStudentsForReferral,
} from "./admin-referral-actions";
import { AdminReferralForm } from "./admin-referral-form";
import type { ReferralStatus } from "./referrals-data";
import { STATUS_DOT_CONFIG } from "./referrals-data";

const DB_STATUS_LABEL: Record<string, ReferralStatus> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  matched: "Connected",
  completed: "Closed",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminReferralModal({ open, onOpenChange }: Props) {
  const [student, setStudent] = useState<StudentSearchResult | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStudent(null), 300);
  };

  if (student) {
    return (
      <AdminReferralForm
        open={open}
        onOpenChange={handleClose}
        student={student}
        onBack={() => setStudent(null)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto bg-white p-0 font-dm"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-bold font-dm text-xl">
            New Referral
          </DialogTitle>
          <DialogDescription className="font-dm text-gray-500 text-sm">
            Search for a student to create a therapist referral.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pt-4 pb-6">
          <StudentPicker onSelect={setStudent} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentPicker({
  onSelect,
}: {
  onSelect: (student: StudentSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const res = await searchStudentsForReferral(q);
    setResults(res);
    setSearched(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
        <Input
          placeholder="Search by student name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 border-gray-200 bg-white pl-10 font-dm"
          autoFocus
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="py-8 text-center text-gray-400 text-sm">
          No students found.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="flex max-h-[340px] flex-col gap-1 overflow-y-auto">
          {results.map((s) => {
            const hasActive = !!s.referralStatus;
            const label = s.referralStatus
              ? DB_STATUS_LABEL[s.referralStatus]
              : null;
            const pill = label ? STATUS_DOT_CONFIG[label] : null;

            return (
              <button
                key={s.studentId}
                type="button"
                onClick={() => !hasActive && onSelect(s)}
                disabled={hasActive}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                  hasActive
                    ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                    : "border-gray-200 hover:border-primary hover:bg-primary/5",
                )}
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs">
                    {s.schoolName}
                    {s.grade != null ? ` · Grade ${s.grade}` : ""}
                    {s.age != null ? ` · Age ${s.age}` : ""}
                  </p>
                </div>
                {pill && label && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs",
                      pill.bg,
                      pill.text,
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", pill.dot)}
                    />
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!loading && !searched && (
        <p className="py-8 text-center text-gray-400 text-sm">
          Type at least 2 characters to search.
        </p>
      )}
    </div>
  );
}
