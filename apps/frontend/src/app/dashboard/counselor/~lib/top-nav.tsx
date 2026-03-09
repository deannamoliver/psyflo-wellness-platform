"use client";

import {
  DollarSign,
  LayoutDashboard,
  Settings as SettingsIcon,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { cn } from "@/lib/tailwind-utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  disabled?: boolean;
};

type TopNavProps = {
  userName: string;
  userRole: string;
  userInitials: string;
  userEmail?: string;
  unreadAlertCount?: number;
};

export default function TopNav({
  userName,
  userRole,
  userInitials,
  userEmail,
  unreadAlertCount = 0,
}: TopNavProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { href: "/dashboard/counselor/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/counselor/caseloads", label: "Caseloads", icon: UsersRound },
    {
      href: "/dashboard/counselor/alerts",
      label: "Action Items",
      icon: ShieldAlert,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    { href: "/dashboard/counselor/rtm", label: "Billing", icon: DollarSign },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/counselor/home") {
      return pathname === href || pathname === "/dashboard/counselor";
    }
    return pathname.startsWith(href);
  };

  // Close profile menu on outside click
  useEffect(() => {
    if (showProfileMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setShowProfileMenu(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex h-16 items-center justify-between overflow-visible border-b bg-white px-6"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {/* Left side: Logo, Badge & Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/counselor/home" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
              <UsersRound className="size-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Psyflo</span>
          </Link>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            Provider
          </span>

          {/* Separator */}
          <div className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />

          {/* Navigation - Left Justified */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side: User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
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
                    href="/dashboard/counselor/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <SettingsIcon className="size-4" />
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
      </nav>

      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
      />
    </>
  );
}
