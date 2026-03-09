import { notFound } from "next/navigation";
import { OrgDetailClient } from "./~lib/org-detail-client";
import { getOrgDetail } from "./~lib/org-detail-queries";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgDetailPage({ params }: Props) {
  const { orgId } = await params;
  const org = await getOrgDetail(orgId);
  if (!org) notFound();
  return <OrgDetailClient org={org} />;
}
