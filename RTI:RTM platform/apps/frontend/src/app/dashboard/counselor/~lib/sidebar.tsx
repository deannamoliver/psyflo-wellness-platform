import {
  BarChart2,
  Contact,
  DollarSign,
  LayoutDashboard,
  ShieldAlert,
  UsersRound,
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
import CounselorSidebarHeader from "./sidebar-header";

function CounselorSidebarItem(
  props: Omit<React.ComponentProps<typeof SidebarItem>, "baseUrl">,
) {
  return <SidebarItem baseUrl="/dashboard/counselor" {...props} />;
}

export default function CounselorSidebar({
  className,
}: {
  className?: string;
}) {
  return (
    <Sidebar variant="inset" collapsible="icon" className={className}>
      <CounselorSidebarHeader />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CounselorSidebarItem
                relUrl="home"
                title="Home"
                icon={<LayoutDashboard />}
              />
              <CounselorSidebarItem
                relUrl="students"
                title="Caseload"
                icon={<UsersRound />}
              />
              <CounselorSidebarItem
                relUrl="alerts"
                title="Alerts"
                icon={<ShieldAlert />}
              />
              <CounselorSidebarItem
                relUrl="rtm"
                title="Billing"
                icon={<DollarSign />}
              />
              <CounselorSidebarItem
                relUrl="analytics"
                title="Insights"
                icon={<BarChart2 />}
              />
              <CounselorSidebarItem
                relUrl="team"
                title="Team"
                icon={<Contact />}
                comingSoon
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
              <SignOutSidebarItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
