"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/lib/core-ui/sidebar";
import { P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

export default function SidebarItem({
  baseUrl,
  relUrl,
  title,
  icon,
  className,
  disabled = false,
  comingSoon = false,
  href,
}: {
  baseUrl: string;
  relUrl: string;
  title: string;
  icon: ReactNode;
  className?: string;
  disabled?: boolean;
  comingSoon?: boolean;
  href?: string;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = segment === relUrl;

  const { state } = useSidebar();

  const isDisabled = disabled || comingSoon;
  const linkHref = href ?? `${baseUrl}/${relUrl}`;

  if (isDisabled) {
    return (
      <SidebarMenuItem
        className={cn(state === "expanded" && "px-2", className)}
      >
        <SidebarMenuButton
          disabled
          tooltip={comingSoon ? `${title} (Coming Soon)` : title}
          className={cn(
            "h-10 cursor-not-allowed px-4 opacity-50 transition-colors",
            "hover:bg-transparent",
          )}
        >
          {icon}
          <div className="flex flex-col">
            <P className="font-semibold">{title}</P>
            {comingSoon && state === "expanded" && (
              <span className="whitespace-nowrap text-muted-foreground text-xs">
                (Coming Soon)
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className={cn(state === "expanded" && "px-2", className)}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={title}
        className="h-10 px-4 transition-colors"
      >
        <Link href={linkHref}>
          {icon}
          <P className="font-semibold">{title}</P>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
