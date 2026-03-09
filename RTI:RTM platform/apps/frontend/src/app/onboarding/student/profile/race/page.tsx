import { serverDrizzle } from "@/lib/database/drizzle";
import RaceForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => tx.query.profiles.findFirst());

  return (
    <RaceForm
      defaultValue={{
        ethnicity: data?.ethnicity ?? "prefer_not_to_answer",
      }}
    />
  );
}
