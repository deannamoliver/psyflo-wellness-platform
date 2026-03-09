import { fmtUserName, getInitials } from "@/lib/string-utils";
import { getCurrentUserInfo } from "@/lib/user/info";
import AdminHeader from "./admin-header";

export default async function AdminHeaderWrapper() {
  const userInfo = await getCurrentUserInfo();
  const userName = fmtUserName(userInfo);
  const userInitials = getInitials(userName);
  const userEmail = userInfo.email;

  return (
    <AdminHeader
      userName={userName}
      userInitials={userInitials}
      userEmail={userEmail}
    />
  );
}
