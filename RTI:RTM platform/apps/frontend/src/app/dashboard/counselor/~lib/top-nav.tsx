"use client";

import {
  ArrowRight,
  BarChart2,
  Bell,
  Check,
  DollarSign,
  FolderOpen,
  LayoutDashboard,
  Settings as SettingsLucide,
  ShieldAlert,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { cn } from "@/lib/tailwind-utils";

function FeedbackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.28516 7.51758C2.99219 7.41211 2.66602 7.45703 2.41406 7.64258C2.25391 7.75977 1.97852 7.93164 1.64453 8.08594C1.75391 7.79883 1.83789 7.47461 1.86523 7.12109C1.88477 6.86914 1.80078 6.61914 1.63477 6.42773C1.17969 5.91406 0.9375 5.3125 0.9375 4.6875C0.9375 3.13477 2.56445 1.5625 5 1.5625C7.43555 1.5625 9.0625 3.13477 9.0625 4.6875C9.0625 4.6875 7.43555 7.8125 5 7.8125C4.38281 7.8125 3.80273 7.70508 3.28516 7.51758ZM0.513672 8.27734C0.482422 8.33008 0.449219 8.38281 0.414062 8.43555L0.408203 8.44531C0.376953 8.49023 0.345703 8.53516 0.314453 8.58008C0.246094 8.67188 0.171875 8.76172 0.09375 8.84375C0.00390625 8.93359 -0.0214844 9.06641 0.0273438 9.18359C0.0761719 9.30078 0.189453 9.37695 0.316406 9.37695C0.416016 9.37695 0.515625 9.37109 0.615234 9.36133L0.628906 9.35938C0.714844 9.34961 0.800781 9.33789 0.886719 9.32227C0.902344 9.32031 0.917969 9.31641 0.933594 9.3125C1.28125 9.24414 1.61523 9.12695 1.91211 8.99805C2.35938 8.80273 2.74023 8.57031 2.97266 8.40039C3.59375 8.625 4.28125 8.75 5.00586 8.75C7.76758 8.75 10.0059 6.93164 10.0059 4.6875C10.0059 2.44336 7.76172 0.625 5 0.625C5 0.625 0 2.44336 0 4.6875C0 5.56836 0.345703 6.38281 0.931641 7.04883C0.894531 7.52734 0.708984 7.95312 0.513672 8.27734ZM2.8125 5.3125C3.15745 5.3125 3.4375 5.03245 3.4375 4.6875C3.4375 4.34255 3.15745 4.0625 2.8125 4.0625C2.46755 4.0625 2.1875 4.34255 2.1875 4.6875C2.1875 5.03245 2.46755 5.3125 2.8125 5.3125ZM5.625 4.6875C5.625 4.34255 5.34495 4.0625 5 4.0625C4.65505 4.0625 4.375 4.34255 4.375 4.6875C4.375 5.03245 4.65505 5.3125 5 5.3125C5.34495 5.3125 5.625 5.03245 5.625 4.6875ZM7.1875 5.3125C7.53245 5.3125 7.8125 5.03245 7.8125 4.6875C7.8125 4.34255 7.53245 4.0625 7.1875 4.0625C6.84255 4.0625 6.5625 4.34255 6.5625 4.6875C6.5625 5.03245 6.84255 5.3125 7.1875 5.3125Z"
        fill="#4B5563"
      />
    </svg>
  );
}

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
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Mock notification data
  const [notifications, setNotifications] = useState([
    { id: "n1", label: "Check in with Sarah M. — Weekly mood review", time: "9:00 AM", type: "check-in" as const, actionLabel: "Start Check-in" },
    { id: "n2", label: "RTM Data Review — 5 patients due for data day count", time: "10:30 AM", type: "billing" as const, actionLabel: "Review Patients" },
    { id: "n3", label: "Treatment Plan Review — James K.", time: "1:00 PM", type: "review" as const, actionLabel: "Open Plan" },
    { id: "n4", label: "Billing Submission Deadline (CPT 98980)", time: "3:00 PM", type: "submission" as const, actionLabel: "Submit Claims" },
  ]);

  const NOTIF_COLORS: Record<string, { color: string; bg: string }> = {
    "check-in": { color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    billing: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    review: { color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
    submission: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const navItems: NavItem[] = [
    { href: "/dashboard/counselor/home", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/counselor/students", label: "Caseload", icon: UsersRound },
    {
      href: "/dashboard/counselor/alerts",
      label: "Alerts",
      icon: ShieldAlert,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    { href: "/dashboard/counselor/rtm", label: "Billing", icon: DollarSign },
    { href: "/dashboard/counselor/analytics", label: "Insights", icon: BarChart2 },
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

  // Close notifications on outside click
  useEffect(() => {
    if (showNotifications) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          notifRef.current &&
          !notifRef.current.contains(event.target as Node)
        ) {
          setShowNotifications(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex h-16 items-center justify-between overflow-visible border-b bg-white px-6"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {/* Left side: Nav items */}
        <div className="flex items-center gap-3">
          {/* Nav Items */}
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className="group relative flex items-center justify-center rounded-lg p-2.5 text-gray-300 cursor-not-allowed"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
                      {item.label} (Coming Soon)
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-center rounded-lg p-2.5 transition-colors",
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.badge !== undefined && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full border-transparent bg-red-500 px-1 text-[10px] text-white hover:bg-red-500/90">
                      {item.badge}
                    </Badge>
                  )}
                  <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side: Calendar + Settings + User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={cn(
              "group relative flex items-center justify-center rounded-lg p-2 transition-colors",
              showNotifications ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
            <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
              Notifications
            </span>
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/counselor/settings"
            className="group relative flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <SettingsLucide className="h-[18px] w-[18px]" />
            <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block">
              Settings
            </span>
          </Link>

          <div className="h-6 w-px shrink-0 bg-gray-200" aria-hidden />

          {/* User Profile */}
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-white text-xs"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {userInitials}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-medium text-gray-900 text-sm">
                {userName}
              </span>
              <span className="text-gray-500 text-xs">{userRole}</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50">
          <div
            ref={notifRef}
            className="fixed top-[68px] right-32 z-[101] w-[380px] max-h-[calc(100vh-80px)] overflow-hidden rounded-xl border bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
                <button type="button" onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-2 h-8 w-8 text-gray-200" />
                  <p className="text-sm text-gray-400">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {notifications.map((n) => {
                    const cfg = NOTIF_COLORS[n.type] ?? { color: "text-gray-600", bg: "bg-gray-50 border-gray-200" };
                    return (
                      <div key={n.id} className={cn("rounded-lg border p-3 transition-colors", cfg.bg)}>
                        <div className="flex items-start gap-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800">{n.label}</p>
                            <p className="mt-0.5 text-[10px] text-gray-400">{n.time}</p>
                          </div>
                          <button type="button" onClick={() => dismissNotification(n.id)} className="shrink-0 text-gray-300 hover:text-gray-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {n.actionLabel && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => dismissNotification(n.id)}
                              className={cn(
                                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:opacity-90",
                                cfg.color.replace("text-", "bg-"),
                              )}
                            >
                              <Check className="h-3 w-3" />
                              {n.actionLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => dismissNotification(n.id)}
                              className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Menu Modal */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50">
          <div
            ref={menuRef}
            data-profile-menu
            className="fixed top-[68px] right-4 z-[101] w-80 rounded-xl bg-white p-4 shadow-lg"
          >
            {/* User Info Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500 font-semibold text-sm text-white">
                  {userInitials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userName}</div>
                  {userEmail && (
                    <div className="text-gray-600 text-sm">{userEmail}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="mb-4 space-y-1">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push("/dashboard/counselor/resources");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-gray-100"
              >
                <FolderOpen className="h-5 w-5 text-gray-600" />
                Resources
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push("/dashboard/counselor/settings");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-gray-100"
              >
                <SettingsLucide className="h-5 w-5 text-gray-600" />
                Settings
              </button>
              <a
                href="https://forms.office.com/pages/responsepage.aspx?id=u4pbkScTuUK6RyHUfp2wu8dChQBBTjFLg9EndPNrRGVURFFGQzFEWklDOFdNMDZGRlNaSFM5VklCMCQlQCN0PWcu&route=shorturl"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowProfileMenu(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 text-sm transition-colors hover:bg-gray-100"
              >
                <FeedbackIcon className="h-5 w-5" />
                Send Feedback
              </a>
            </div>

            {/* Logout Button */}
            <div className="border-gray-200 border-t pt-4">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setIsLogoutModalOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-900 text-sm transition-colors hover:bg-gray-200"
              >
                <span>Log Out</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
      />
    </>
  );
}
