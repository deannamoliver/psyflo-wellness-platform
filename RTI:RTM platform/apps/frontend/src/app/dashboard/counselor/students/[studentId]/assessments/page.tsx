import { AssessmentManager } from "./~lib/assessment-manager";

export default async function StudentAssessmentsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <AssessmentManager patientId={studentId} />
    </div>
  );
}
