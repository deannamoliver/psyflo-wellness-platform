import { AddUserClient } from "./~lib/add-user-client";
import { fetchAddUserData } from "./~lib/add-user-queries";

export default async function AddUserPage() {
  const data = await fetchAddUserData();
  return <AddUserClient organizations={data.organizations} />;
}
