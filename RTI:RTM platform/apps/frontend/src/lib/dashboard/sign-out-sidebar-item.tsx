"use client";

import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/lib/core-ui/sidebar";
import { P } from "@/lib/core-ui/typography";
import { LogoutModal } from "@/lib/logout/logout-modal";
import { cn } from "@/lib/tailwind-utils";

export default function SignOutSidebarItem({
  className,
}: {
  className?: string;
}) {
  const { state } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SidebarMenuItem
        className={cn(state === "expanded" && "px-2", className)}
      >
        <SidebarMenuButton
          className="h-10 cursor-pointer px-4 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <LogOutIcon />
          <P className="font-semibold">Sign Out</P>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <LogoutModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
