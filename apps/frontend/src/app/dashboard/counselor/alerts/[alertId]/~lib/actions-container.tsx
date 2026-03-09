import { alerts } from "@feelwell/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { serverDrizzle } from "@/lib/database/drizzle";
import Actions from "./actions";

export default async function ActionsContainer({
  alertId,
}: {
  alertId: string;
}) {
  const db = await serverDrizzle();

  const data = await db.admin.query.alerts.findFirst({
    where: eq(alerts.id, alertId),
  });

  if (!data) {
    notFound();
  }

  return <Actions data={data} />;
}
