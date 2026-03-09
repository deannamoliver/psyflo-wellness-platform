import { BillingClient } from "../../../../counselor/students/[studentId]/billing/~lib/billing-client";

export default async function PatientBillingPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2 font-dm">
      <BillingClient studentId={patientId} />
    </div>
  );
}
