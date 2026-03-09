"use client";

import { ChevronDownIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { cn } from "@/lib/tailwind-utils";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function OrganizationsPagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const start = (currentPage - 1) * perPage + 1;

  function getPageNumbers(): { key: string; value: number | null }[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => ({
        key: String(i + 1),
        value: i + 1,
      }));
    }
    const pages: { key: string; value: number | null }[] = [
      { key: "1", value: 1 },
    ];
    if (currentPage > 3) pages.push({ key: "start-ellipsis", value: null });
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push({ key: String(i), value: i });
    }
    if (currentPage < totalPages - 2)
      pages.push({ key: "end-ellipsis", value: null });
    pages.push({ key: String(totalPages), value: totalPages });
    return pages;
  }

  return (
    <div className="flex items-center justify-between font-dm">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm">
          Showing {start} of {totalItems} organizations
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 gap-2 border-gray-200 bg-white font-dm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            >
              {perPage} per page
              <ChevronDownIcon className="size-3.5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-white font-dm [&_[data-slot=dropdown-menu-radio-item]]:py-2.5 [&_[data-slot=dropdown-menu-radio-item]]:pr-4 [&_[data-slot=dropdown-menu-radio-item]]:pl-9 [&_[data-slot=dropdown-menu-radio-item]]:text-gray-900"
          >
            <DropdownMenuRadioGroup
              value={perPage.toString()}
              onValueChange={(v) => onPerPageChange(Number(v))}
            >
              {[10, 20, 50, 100].map((n) => (
                <DropdownMenuRadioItem key={n} value={n.toString()}>
                  {n} per page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm transition-colors",
            currentPage === 1
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>

        {getPageNumbers().map((item) =>
          item.value === null ? (
            <span key={item.key} className="px-2 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={item.key}
              type="button"
              onClick={() => onPageChange(item.value as number)}
              className={cn(
                "flex size-9 items-center justify-center rounded-md font-medium text-sm transition-colors",
                currentPage === item.value
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50",
              )}
            >
              {item.value}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-9 items-center gap-1 rounded-md border border-gray-200 px-3 font-medium text-sm transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed text-gray-300"
              : "text-gray-700 hover:bg-gray-50",
          )}
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
