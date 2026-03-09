import { PatientsClient } from "./~lib/patients-client";
import { fetchAdminStudents } from "../students/~lib/students-queries";

export default async function PatientsPage() {
  const data = await fetchAdminStudents();
  return <PatientsClient data={data} />;
}
