import { PatientsClient } from "./~lib/patients-client";
import { fetchAdminPatients } from "./~lib/patients-queries";

export default async function PatientsPage() {
  const data = await fetchAdminPatients();
  return <PatientsClient data={data} />;
}
