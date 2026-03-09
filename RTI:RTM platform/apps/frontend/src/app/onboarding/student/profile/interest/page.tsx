import { serverDrizzle } from "@/lib/database/drizzle";
import InterestsForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => {
    return tx.query.profiles.findFirst();
  });

  return (
    <InterestsForm
      defaultValue={{
        interests: data?.interests ?? [],
      }}
    />
  );
}
