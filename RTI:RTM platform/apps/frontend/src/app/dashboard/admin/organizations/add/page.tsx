import { notFound } from "next/navigation";
import { getOrganizationForEdit } from "./~lib/add-org-actions";
import { AddOrgClient } from "./~lib/add-org-client";

type Props = {
  searchParams: Promise<{ orgId?: string }>;
};

export default async function AddOrganizationPage({ searchParams }: Props) {
  const { orgId } = await searchParams;

  let initialData = null;
  if (orgId) {
    initialData = await getOrganizationForEdit(orgId);
    if (!initialData) {
      notFound();
    }
  }

  return <AddOrgClient orgId={orgId || undefined} initialData={initialData} />;
}
