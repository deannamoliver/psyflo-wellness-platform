import { serverDrizzle } from "@/lib/database/drizzle";
import LearningStyleForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => {
    return tx.query.profiles.findFirst();
  });

  return (
    <LearningStyleForm
      defaultValue={{
        learningStyle: data?.learningStyles ?? [],
      }}
    />
  );
}
