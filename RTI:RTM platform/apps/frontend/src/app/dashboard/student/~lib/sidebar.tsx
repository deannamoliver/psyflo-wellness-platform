import {
  CheckCircleIcon,
  HomeIcon,
  LayersIcon,
  MessageCircleIcon,
  SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarSeparator,
} from "@/lib/core-ui/sidebar";
import SidebarItem from "@/lib/dashboard/sidebar-item";
import SignOutSidebarItem from "@/lib/dashboard/sign-out-sidebar-item";
import StudentSidebarHeader from "./sidebar-header";

function StudentSidebarItem(
  props: Omit<React.ComponentProps<typeof SidebarItem>, "baseUrl">,
) {
  return <SidebarItem baseUrl="/dashboard/student" {...props} />;
}

export default async function StudentSidebar({
  className,
}: {
  className?: string;
}) {
  return (
    <Sidebar variant="inset" collapsible="icon" className={className}>
      <StudentSidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudentSidebarItem
                relUrl="home"
                title="Home"
                icon={<HomeIcon />}
              />
              <StudentSidebarItem
                relUrl="check-in"
                title="Check-In"
                icon={<CheckCircleIcon />}
              />
              <StudentSidebarItem
                relUrl="chat"
                title="Chat"
                icon={<MessageCircleIcon />}
              />
              <StudentSidebarItem
                relUrl="more"
                title="Resources"
                icon={<LayersIcon />}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="px-2" />
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudentSidebarItem
                relUrl="settings"
                title="Settings"
                icon={<SettingsIcon />}
                href="/dashboard/student/settings?tab=account"
              />
              <SignOutSidebarItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
