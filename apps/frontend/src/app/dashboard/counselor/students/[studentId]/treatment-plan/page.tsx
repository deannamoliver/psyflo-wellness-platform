import { buildRTMPatients } from "@/app/dashboard/counselor/rtm/~lib/mock-data";
import PatientDetail from "@/app/dashboard/counselor/rtm/~lib/patient-detail";

export default async function TreatmentPlanPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  // Use mock data with the studentId - the layout already validates the student exists
  const realStudent = {
    id: studentId,
    name: "Patient", // Name is shown in the layout header, not needed here
  };

  const [patient] = buildRTMPatients([realStudent]);

  if (!patient) {
    // Fallback to a default patient structure
    const fallbackPatient = buildRTMPatients([{ id: studentId, name: "Patient" }])[0];
    return <PatientDetail patient={fallbackPatient!} showHeader={false} />;
  }

  return <PatientDetail patient={patient} showHeader={false} />;
}
