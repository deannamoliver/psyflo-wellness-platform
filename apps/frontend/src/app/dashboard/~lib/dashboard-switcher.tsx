"use client";

import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type DashboardOption = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
};

const DASHBOARD_OPTIONS: DashboardOption[] = [
  {
    id: "admin",
    label: "Psyflo Admin",
    description: "Internal administration — no patient data",
    href: "/dashboard/admin",
    icon: Settings,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    id: "counselor",
    label: "Provider",
    description: "Clinical dashboard",
    href: "/dashboard/counselor/home",
    icon: Stethoscope,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "practice",
    label: "Practice Manager",
    description: "Practice management + clinical",
    href: "/dashboard/practice/home",
    icon: Building2,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  {
    id: "student",
    label: "Patient",
    description: "Patient portal",
    href: "/dashboard/student",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
];

export function DashboardSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Determine current dashboard based on pathname
  const getCurrentDashboard = () => {
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    if (pathname.startsWith("/dashboard/practice")) return "practice";
    if (pathname.startsWith("/dashboard/student")) return "student";
    if (pathname.startsWith("/dashboard/counselor")) return "counselor";
    return "counselor";
  };

  const currentId = getCurrentDashboard();
  // currentDashboard available for future use if needed
  const _currentDashboard = DASHBOARD_OPTIONS.find((d) => d.id === currentId) ?? DASHBOARD_OPTIONS[1];
  void _currentDashboard;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        <LayoutDashboard className="size-4 text-gray-500" />
        <span>Switch Dashboard</span>
        <svg
          className={cn("size-4 text-gray-400 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border bg-white p-2 shadow-lg">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Switch Dashboard View
            </p>
            <div className="space-y-1">
              {DASHBOARD_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.id === currentId;
                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-gray-100"
                        : "hover:bg-gray-50",
                    )}
                  >
                    <div className={cn("flex size-9 items-center justify-center rounded-lg", option.bgColor)}>
                      <Icon className={cn("size-5", option.color)} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", isActive ? "text-gray-900" : "text-gray-700")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    {isActive && (
                      <div className="size-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function FloatingDashboardSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentDashboard = () => {
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    if (pathname.startsWith("/dashboard/practice")) return "practice";
    if (pathname.startsWith("/dashboard/student")) return "student";
    if (pathname.startsWith("/dashboard/counselor")) return "counselor";
    return "counselor";
  };

  const currentId = getCurrentDashboard();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105"
        title="Switch Dashboard"
      >
        <LayoutDashboard className="size-6" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-16 right-0 z-50 w-72 rounded-xl border bg-white p-2 shadow-xl">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Switch Dashboard View
            </p>
            <div className="space-y-1">
              {DASHBOARD_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.id === currentId;
                return (
                  <Link
                    key={option.id}
                    href={option.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-gray-100"
                        : "hover:bg-gray-50",
                    )}
                  >
                    <div className={cn("flex size-9 items-center justify-center rounded-lg", option.bgColor)}>
                      <Icon className={cn("size-5", option.color)} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", isActive ? "text-gray-900" : "text-gray-700")}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    {isActive && (
                      <div className="size-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
