"use client";

import { ChevronDown } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "@/lib/core-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/core-ui/dropdown-menu";
import { cn } from "@/lib/tailwind-utils";
import { searchParamsParsers } from "./parsers";

function Dropdown({
  title,
  value,
  options,
  onChange,
  className,
}: {
  title: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("border-gray-200 bg-white", className)}
        >
          {title} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={value ?? undefined}
          onValueChange={onChange}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Filters({ className }: { className?: string }) {
  const [filters, setFilters] = useQueryStates(searchParamsParsers);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Dropdown
        title="Sort by"
        value={filters.sortBy ?? "newest-first"}
        options={[
          { value: "newest-first", label: "Newest First" },
          { value: "oldest-first", label: "Oldest First" },
          { value: "student-name-a-z", label: "Patient Name (A-Z)" },
        ]}
        onChange={(value) =>
          setFilters(
            {
              sortBy: searchParamsParsers.sortBy.parse(value),
            },
            { shallow: false },
          )
        }
      />
    </div>
  );
}
