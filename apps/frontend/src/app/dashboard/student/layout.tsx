import { FloatingDashboardSwitcher } from "../~lib/dashboard-switcher";
import BottomTabNav from "./~lib/bottom-tab-nav";

/**
 * Student dashboard - demo mode with no auth checks
 */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <div className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</div>
      <BottomTabNav />
      <FloatingDashboardSwitcher />
    </div>
  );
}
