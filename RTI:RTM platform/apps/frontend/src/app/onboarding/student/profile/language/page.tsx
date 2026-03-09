import { serverDrizzle } from "@/lib/database/drizzle";
import LanguageForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => tx.query.profiles.findFirst());

  return (
    <LanguageForm
      defaultValue={{
        language: data?.language ?? "english",
      }}
    />
  );
}
