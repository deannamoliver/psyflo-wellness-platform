import { serverDrizzle } from "@/lib/database/drizzle";
import PronounsForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => tx.query.profiles.findFirst());

  return (
    <PronounsForm
      defaultValue={{
        pronouns: data?.pronouns ?? "prefer_not_to_answer",
      }}
    />
  );
}
