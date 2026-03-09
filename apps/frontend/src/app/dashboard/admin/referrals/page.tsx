import { ReferralsClient } from "./~lib/referrals-client";
import { fetchAdminReferrals } from "./~lib/referrals-queries";

export default async function ReferralsPage() {
  const data = await fetchAdminReferrals();
  return <ReferralsClient data={data} />;
}
