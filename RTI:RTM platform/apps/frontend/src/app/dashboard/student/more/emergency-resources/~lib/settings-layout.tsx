"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/tailwind-utils";

const navItems = [
  {
    label: "Emergency Resources",
    href: "/dashboard/student/more/emergency-resources",
  },
  { label: "Account", href: "/dashboard/student/more/account" },
  { label: "Support", href: "/dashboard/student/more/support" },
  { label: "Legal", href: "/dashboard/student/more/legal" },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="fixed top-0 left-0 hidden h-full w-56 shrink-0 overflow-y-auto border-gray-200 border-r bg-gray-50 px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] md:block [&::-webkit-scrollbar]:hidden">
        <Link
          href="/dashboard/student/home"
          className="mb-6 flex w-full items-center gap-2 rounded-md px-3 py-2 text-gray-600 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="mb-4 font-semibold text-2xl text-gray-900">Settings</h1>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full rounded-lg px-4 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-gray-200 font-medium text-gray-900"
                    : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header - shown only on mobile */}
      <div className="fixed top-0 right-0 left-0 z-10 bg-gray-50 md:hidden">
        <div className="px-4 pt-4">
          <Link
            href="/dashboard/student/home"
            className="mb-3 flex items-center gap-2 text-gray-600 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="mb-4 text-center font-semibold text-2xl text-gray-900">
            Settings
          </h1>
        </div>
        <nav className="flex justify-center gap-2 overflow-x-auto border-gray-200 border-b px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            // Use "Emergency" for mobile instead of "Emergency Resources"
            const mobileLabel =
              item.label === "Emergency Resources" ? "Emergency" : item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-gray-200 font-medium text-gray-900"
                    : "text-gray-600",
                )}
              >
                {mobileLabel}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Scrollable main content */}
      <main className="w-full flex-1 overflow-y-auto px-4 pt-40 pb-12 md:ml-56 md:px-8 md:pt-6">
        {children}
      </main>
    </div>
  );
}
