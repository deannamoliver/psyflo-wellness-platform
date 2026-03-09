"use client";

import {
  BotIcon,
  Building2Icon,
  FileTextIcon,
  FlaskConicalIcon,
  MailCheckIcon,
  ScaleIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/lib/core-ui/sidebar";
import { P } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";

function AdminSidebarItem({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  const { state } = useSidebar();

  return (
    <SidebarMenuItem className={cn(state === "expanded" && "px-2")}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "h-10 rounded-lg px-4 transition-all",
          isActive
            ? "border border-gray-200 bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:bg-white hover:text-gray-900",
        )}
      >
        <Link href={href}>
          {icon}
          <P className="font-medium text-sm">{title}</P>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AdminSidebar({ className }: { className?: string }) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className={cn("border-gray-100 border-r bg-gray-50", className)}
    >
      <SidebarContent className="bg-gray-50">
        {/* Evals Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-400 text-xs uppercase tracking-wider">
            Evals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AdminSidebarItem
                href="/admin/evals/prompt"
                title="Prompt"
                icon={<FileTextIcon />}
              />
              <AdminSidebarItem
                href="/admin/evals/tests"
                title="Tests"
                icon={<FlaskConicalIcon />}
              />
              <AdminSidebarItem
                href="/admin/evals/evals"
                title="Evals"
                icon={<TargetIcon />}
              />
              <AdminSidebarItem
                href="/admin/evals/judge"
                title="Judge"
                icon={<ScaleIcon />}
              />
              <AdminSidebarItem
                href="/admin/agents"
                title="Agents"
                icon={<BotIcon />}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Schools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-400 text-xs uppercase tracking-wider">
            Schools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AdminSidebarItem
                href="/admin/schools/manage"
                title="Manage Schools"
                icon={<Building2Icon />}
              />
              <AdminSidebarItem
                href="/admin/schools/signup-controls"
                title="Signup Controls"
                icon={<MailCheckIcon />}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Screeners Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-400 text-xs uppercase tracking-wider">
            Screeners
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AdminSidebarItem
                href="/admin/screeners/frequency"
                title="Frequency Settings"
                icon={<SettingsIcon />}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
