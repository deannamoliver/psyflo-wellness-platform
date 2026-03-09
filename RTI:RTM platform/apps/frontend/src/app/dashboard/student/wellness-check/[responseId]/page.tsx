import { screenerSessionResponses } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import { getOngoingResponses } from "@/lib/screener/data";
import ResponseForm from "./~lib/form";

export default async function ResponsePage({
  params,
}: {
  params: Promise<{ responseId: string }>;
}) {
  const { responseId } = await params;

  const db = await serverDrizzle();
  const studentId = db.userId();

  const ongoing = await getOngoingResponses({
    studentId,
  });

  const currentResponse =
    await db.admin.query.screenerSessionResponses.findFirst({
      where: eq(screenerSessionResponses.id, responseId),
    });

  if (!currentResponse) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <ResponseForm
        currentResponse={currentResponse}
        responseIds={ongoing.map((r) => r.id)}
      />
    </div>
  );
}
