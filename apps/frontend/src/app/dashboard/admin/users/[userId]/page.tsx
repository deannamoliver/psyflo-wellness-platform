import { notFound } from "next/navigation";
import { UserDetailClient } from "./~lib/user-detail-client";
import { fetchUserDetail } from "./~lib/user-detail-queries";

type Props = { params: Promise<{ userId: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params;
  const user = await fetchUserDetail(userId);
  if (!user) notFound();
  return <UserDetailClient user={user} />;
}
