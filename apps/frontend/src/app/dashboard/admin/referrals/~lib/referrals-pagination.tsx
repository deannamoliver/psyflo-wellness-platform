"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
};

export function ReferralsPagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between font-dm">
      <span className="text-gray-500 text-sm">
        Showing{" "}
        <span className="font-medium">
          {start}-{end}
        </span>{" "}
        of {totalItems} referrals
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex size-9 items-center justify-center rounded-md border border-gray-200 transition-colors",
            currentPage === 1
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md font-medium text-sm transition-colors",
              currentPage === page
                ? "bg-blue-600 text-white"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex size-9 items-center justify-center rounded-md border border-gray-200 transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
