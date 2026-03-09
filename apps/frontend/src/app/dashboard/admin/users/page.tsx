import { UsersClient } from "./~lib/users-client";
import { fetchAdminUsers } from "./~lib/users-queries";

export default async function UsersPage() {
  const data = await fetchAdminUsers();
  return <UsersClient data={data} />;
}
