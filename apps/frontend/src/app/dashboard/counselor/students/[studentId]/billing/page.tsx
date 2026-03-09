import { BillingClient } from "./~lib/billing-client";

export default async function StudentBillingPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <BillingClient studentId={studentId} />
    </div>
  );
}
