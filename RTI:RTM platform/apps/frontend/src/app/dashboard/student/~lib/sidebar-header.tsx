"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/lib/core-ui/avatar";
import {
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/lib/core-ui/sidebar";
import { Small } from "@/lib/core-ui/typography";

export default function StudentSidebarHeader() {
  const { state } = useSidebar();

  if (state === "expanded") {
    return (
      <>
        <SidebarHeader className="space-y-4">
          <SidebarTrigger className="ml-auto p-4 text-sidebar-primary" />

          <div className="flex flex-col items-center gap-1">
            <Avatar className="size-16">
              <AvatarImage src="https://picsum.photos/100" />
              <AvatarFallback>FE</AvatarFallback>
            </Avatar>
            <Small className="text-sm">feelwell</Small>
            <Small className="text-sm">EXPLORER</Small>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="px-2" />
      </>
    );
  }

  return (
    <SidebarHeader>
      <SidebarTrigger className="ml-auto p-4 text-sidebar-primary" />
    </SidebarHeader>
  );
}
