"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/tailwind-utils";

type Props = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function PatientsPagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
}: Props) {
  const totalPages = Math.ceil(totalItems / perPage);
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <span>Show</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span>per page</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">
          {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "rounded-lg p-1.5",
              currentPage === 1
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "rounded-lg p-1.5",
              currentPage === totalPages
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
