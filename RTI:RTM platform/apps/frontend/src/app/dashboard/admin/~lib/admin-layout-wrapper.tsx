import { Suspense } from "react";
import { fetchLiveSessionCount } from "../conversations/~lib/data";
import { fetchActiveReferralCount } from "../referrals/~lib/referrals-queries";
import { getUrgentAlertCount } from "../safety-monitor/~lib/queries";
import AdminHeaderWrapper from "./admin-header-wrapper";
import AdminSidebar from "./admin-sidebar";

export async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [referralCount, urgentAlertCount, liveSessionCount] = await Promise.all(
    [
      fetchActiveReferralCount(),
      getUrgentAlertCount(),
      fetchLiveSessionCount(),
    ],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7F7]">
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <AdminHeaderWrapper />
      </Suspense>
      <div className="flex flex-1">
        <AdminSidebar
          referralCount={referralCount}
          urgentAlertCount={urgentAlertCount}
          liveSessionCount={liveSessionCount}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
