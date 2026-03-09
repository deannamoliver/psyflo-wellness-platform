import { ActionItemsClient } from "./~lib/action-items-client";

export default async function StudentActionItemsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-4 pt-2 font-dm">
      <ActionItemsClient patientId={studentId} />
    </div>
  );
}
