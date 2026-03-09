import type { Table } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/lib/core-ui/pagination";

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pages: (number | string)[] = [];
  const showEllipsisThreshold = 7;

  // Show all pages if total is small
  if (totalPages <= showEllipsisThreshold) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  if (currentPage <= 3) {
    // Show pages 1, 2, ..., lastPage
    pages.push(2);
    pages.push("ellipsis");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    // Show 1, ..., lastPage-1, lastPage
    pages.push("ellipsis");
    pages.push(totalPages - 1);
    pages.push(totalPages);
  } else {
    // Show 1, ..., currentPage-1, currentPage, currentPage+1, ..., lastPage
    pages.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}

interface BasePaginationProps<TData> {
  table: Table<TData>;
}

export function BasePagination<TData>({ table }: BasePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className="mx-0 w-auto justify-start">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.previousPage();
            }}
            className={
              !table.getCanPreviousPage()
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>

        {getVisiblePages(currentPage, totalPages).map((page, index) => {
          if (page === "ellipsis") {
            // Create unique key based on position in pagination
            const ellipsisKey = index < 3 ? "start-ellipsis" : "end-ellipsis";
            return (
              <PaginationItem key={ellipsisKey}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault();
                  table.setPageIndex((page as number) - 1);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.nextPage();
            }}
            className={
              !table.getCanNextPage() ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
