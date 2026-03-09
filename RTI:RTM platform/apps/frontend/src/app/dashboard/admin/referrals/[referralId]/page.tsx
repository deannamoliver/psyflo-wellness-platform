import { notFound } from "next/navigation";
import { ReferralDetailClient } from "./~lib/referral-detail-client";
import { fetchReferralDetail } from "./~lib/referral-detail-queries";

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ referralId: string }>;
}) {
  const { referralId } = await params;
  const data = await fetchReferralDetail(referralId);
  if (!data) notFound();
  return <ReferralDetailClient data={data} />;
}
