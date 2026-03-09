import { notFound } from "next/navigation";
import { PatientDetailClient } from "./~lib/patient-detail-client";
import { fetchPatientDetail } from "./~lib/patient-detail-queries";

type Props = { params: Promise<{ patientId: string }> };

export default async function PatientDetailPage({ params }: Props) {
  const { patientId } = await params;
  const patient = await fetchPatientDetail(patientId);
  if (!patient) notFound();
  return <PatientDetailClient patient={patient} />;
}
