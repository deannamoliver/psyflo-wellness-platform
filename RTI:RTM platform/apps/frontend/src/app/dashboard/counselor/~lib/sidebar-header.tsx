"use client";

import {
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/lib/core-ui/sidebar";
import { H2 } from "@/lib/core-ui/typography";

export default function CounselorSidebarHeader() {
  const { state } = useSidebar();

  if (state === "expanded") {
    return (
      <SidebarHeader className="pt-2 pb-4">
        <SidebarTrigger className="ml-auto p-4 text-sidebar-primary" />
        <H2 className="text-center text-accent">feelwell</H2>
      </SidebarHeader>
    );
  }

  return (
    <SidebarHeader>
      <SidebarTrigger className="ml-auto p-4 text-sidebar-primary" />
    </SidebarHeader>
  );
}
