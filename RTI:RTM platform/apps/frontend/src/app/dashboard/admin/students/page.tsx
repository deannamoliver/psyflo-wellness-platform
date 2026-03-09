import { StudentsClient } from "./~lib/students-client";
import { fetchAdminStudents } from "./~lib/students-queries";

export default async function StudentsPage() {
  const data = await fetchAdminStudents();
  return <StudentsClient data={data} />;
}
