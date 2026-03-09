import { serverDrizzle } from "@/lib/database/drizzle";
import PersonalGoalsForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => {
    return tx.query.profiles.findFirst();
  });

  return (
    <PersonalGoalsForm
      defaultValue={{
        personalGoals: data?.goals ?? [],
      }}
    />
  );
}
