import { getSchoolsAction } from "../../actions";
import { SchoolsList } from "./schools-list";

export default async function ManageSchoolsPage() {
  const schools = await getSchoolsAction();

  return <SchoolsList schools={schools} />;
}
