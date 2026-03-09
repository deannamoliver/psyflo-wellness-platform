import { Suspense } from "react";
import { FloatingDashboardSwitcher } from "../../~lib/dashboard-switcher";
import AdminHeaderWrapper from "./admin-header-wrapper";
import AdminSidebar from "./admin-sidebar";

export async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7F7]">
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <AdminHeaderWrapper />
      </Suspense>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <FloatingDashboardSwitcher />
    </div>
  );
}
