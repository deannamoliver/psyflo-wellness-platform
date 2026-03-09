"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  MessageSquare,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Building2;
  badge?: number;
  badgeColor?: string;
};

function buildNavItems(
  referralCount: number,
  urgentAlertCount: number,
  liveSessionCount: number,
): NavItem[] {
  return [
    {
      href: "/dashboard/admin/organizations",
      label: "Practices",
      icon: Building2,
    },
    { href: "/dashboard/admin/users", label: "Providers", icon: Users },
    {
      href: "/dashboard/admin/students",
      label: "Clients",
      icon: Heart,
    },
    {
      href: "/dashboard/admin/safety-monitor",
      label: "Safety Monitor",
      icon: Shield,
      badge: urgentAlertCount > 0 ? urgentAlertCount : undefined,
      badgeColor: "bg-[#0D6B6B]",
    },
    {
      href: "/dashboard/admin/conversations",
      label: "Messages",
      icon: MessageSquare,
      badge: liveSessionCount > 0 ? liveSessionCount : undefined,
      badgeColor: "bg-[#0D6B6B]",
    },
    {
      href: "/dashboard/admin/referrals",
      label: "Referrals",
      icon: FileText,
      badge: referralCount > 0 ? referralCount : undefined,
      badgeColor: "bg-[#0D6B6B]",
    },
  ];
}

export default function AdminSidebar({
  referralCount = 0,
  urgentAlertCount = 0,
  liveSessionCount = 0,
}: {
  referralCount?: number;
  urgentAlertCount?: number;
  liveSessionCount?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const NAV_ITEMS = buildNavItems(
    referralCount,
    urgentAlertCount,
    liveSessionCount,
  );

  const isActive = (href: string) => {
    if (href === "/dashboard/admin/organizations") {
      return pathname === href || pathname === "/dashboard/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-[#0F2020] font-dm text-white transition-all duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="-right-3 absolute top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 font-medium text-sm transition-colors",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-[#0D6B6B] text-white"
                  : "text-[#E2EAEA] hover:bg-[#1A9090]/20 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-semibold text-white text-xs",
                    item.badgeColor,
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="border-[#1A9090]/30 border-t px-3 py-4">
        {!collapsed && (
          <p className="mb-3 px-3 font-medium text-[#7A9696] text-xs uppercase tracking-wider">
            Quick Actions
          </p>
        )}
        <Link
          href="/dashboard/admin/users/add"
          title={collapsed ? "Add User" : undefined}
          className={cn(
            "flex w-full items-center justify-center rounded-lg bg-[#0D6B6B] py-2.5 font-medium text-sm text-white transition-colors hover:bg-[#1A9090]",
            collapsed ? "px-0" : "gap-2 px-4",
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && "Add Provider"}
        </Link>
      </div>
    </aside>
  );
}
