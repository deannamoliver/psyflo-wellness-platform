"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type School = { id: string; name: string };

type SchoolSelectorProps = {
  schools: School[];
  currentSchoolId: string;
};

export function SchoolSelector({
  schools,
  currentSchoolId,
}: SchoolSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentSchool = schools.find((s) => s.id === currentSchoolId);
  const schoolName = currentSchool?.name ?? "";
  const showCaret = schools.length > 1;

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => showCaret && setIsOpen((v) => !v)}
        className="flex items-center gap-1 font-medium text-gray-700 text-sm transition-colors hover:text-gray-900"
      >
        <span>{schoolName}</span>
        {showCaret && (
          <ChevronDown className="size-4 text-gray-400" aria-hidden />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-[100] w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
          style={{ top: position.top, left: position.left }}
          data-school-selector-menu
        >
          <div className="mb-2 font-medium text-gray-500 text-xs uppercase tracking-wide">
            Switch practice
          </div>
          <div className="space-y-0.5">
            {schools.map((school) => (
              <button
                key={school.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push(
                    `/dashboard/counselor/home?schoolId=${school.id}`,
                  );
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  school.id === currentSchoolId
                    ? "bg-gray-100 font-medium text-gray-900"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {school.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
