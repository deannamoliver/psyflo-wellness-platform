import { getOrganizations } from "../~lib/organizations-data";
import { AddLocationClient } from "./~lib/add-location-client";
import {
  getOrgDomains,
  loadLocationFormData,
} from "./~lib/load-location-form-data";

type Props = {
  searchParams: Promise<{ orgId?: string; locationId?: string }>;
};

export default async function AddLocationPage({ searchParams }: Props) {
  const { orgId, locationId } = await searchParams;
  const orgs = await getOrganizations();
  const orgOptions = orgs.map((o) => ({ id: o.id, name: o.name }));

  const existingData = locationId
    ? await loadLocationFormData(locationId)
    : null;

  // For create mode, pre-fill with org's domains
  const defaultDomainsFromOrg =
    !locationId && orgId ? await getOrgDomains(orgId) : undefined;

  return (
    <AddLocationClient
      organizations={orgOptions}
      defaultOrgId={orgId ?? ""}
      editLocationId={locationId}
      existingData={existingData}
      defaultDomainsFromOrg={defaultDomainsFromOrg}
    />
  );
}
