"use client";

import {
  Building2,
  DollarSign,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { cn } from "@/lib/tailwind-utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

type TopNavProps = {
  userName: string;
  userInitials: string;
  userEmail?: string;
  practiceName: string;
};

export default function TopNav({
  userName,
  userInitials,
  userEmail,
  practiceName,
}: TopNavProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Provider tabs (same as counselor dashboard)
  const providerNavItems: NavItem[] = [
    { href: "/dashboard/practice/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/practice/caseloads", label: "Caseloads", icon: UsersRound },
    { href: "/dashboard/practice/alerts", label: "Action Items", icon: ShieldAlert },
    { href: "/dashboard/practice/billing", label: "Billing", icon: DollarSign },
  ];

  // Organization-specific tabs
  const orgNavItems: NavItem[] = [
    { href: "/dashboard/practice/team", label: "Team", icon: Users },
  ];

  const navItems: NavItem[] = [...providerNavItems, ...orgNavItems];

  const isActive = (href: string) => {
    if (href === "/dashboard/practice/home") {
      return pathname === "/dashboard/practice/home" || pathname === "/dashboard/practice";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left side: Logo, Badge & Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/practice/home" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600">
                <Building2 className="size-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">{practiceName}</span>
            </Link>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              Practice Manager
            </span>

            {/* Separator */}
            <div className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />

            {/* Navigation - Left Justified */}
            <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {item.badge && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
                  {userInitials}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-white p-2 shadow-lg">
                  <div className="border-b px-3 py-2">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/practice/settings"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
      />
    </>
  );
}
