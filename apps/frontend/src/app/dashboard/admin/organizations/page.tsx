import { OrganizationsClient } from "./~lib/organizations-client";
import { getOrganizations } from "./~lib/organizations-data";

export default async function OrganizationsPage() {
  const organizations = await getOrganizations();
  return <OrganizationsClient organizations={organizations} />;
}
