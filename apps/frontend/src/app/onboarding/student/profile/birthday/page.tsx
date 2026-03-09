import { serverDrizzle } from "@/lib/database/drizzle";
import BirthdayForm from "./form";

export default async function Page() {
  const db = await serverDrizzle();
  const data = await db.rls(async (tx) => tx.query.profiles.findFirst());

  return (
    <BirthdayForm
      defaultValue={{
        birthday: data?.dateOfBirth ?? "",
      }}
    />
  );
}
