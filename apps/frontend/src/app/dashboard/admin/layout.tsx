import { Suspense } from "react";
import { AdminLayoutWrapper } from "./~lib/admin-layout-wrapper";

/**
 * Admin dashboard - demo mode with no auth checks
 */
export default function DashboardAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-50" />}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </Suspense>
  );
}
