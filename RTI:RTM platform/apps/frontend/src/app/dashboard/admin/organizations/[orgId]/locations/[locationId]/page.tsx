import { notFound } from "next/navigation";
import { LocationDetailClient } from "./~lib/location-detail-client";
import { getLocationDetail } from "./~lib/location-detail-queries";

type Props = {
  params: Promise<{ orgId: string; locationId: string }>;
};

export default async function LocationDetailPage({ params }: Props) {
  const { orgId, locationId } = await params;
  const location = await getLocationDetail(orgId, locationId);
  if (!location) notFound();
  return <LocationDetailClient location={location} />;
}
