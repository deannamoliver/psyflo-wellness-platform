import { redirect } from "next/navigation";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  redirect(`/dashboard/counselor/students/${studentId}/overview`);
}
