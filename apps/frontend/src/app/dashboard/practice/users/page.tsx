import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { UserManagementTable } from "./~lib/user-management-table";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
};

// Mock data for demo purposes
const MOCK_USERS: UserRow[] = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sarah.johnson@practice.com", role: "Therapist", status: "active", joinedAt: "2024-01-15T00:00:00Z" },
  { id: "2", name: "Dr. Michael Chen", email: "michael.chen@practice.com", role: "Therapist", status: "active", joinedAt: "2024-02-20T00:00:00Z" },
  { id: "3", name: "Lisa Martinez, LCSW", email: "lisa.martinez@practice.com", role: "Wellness Coach", status: "active", joinedAt: "2023-11-10T00:00:00Z" },
  { id: "4", name: "Dr. Emily Williams", email: "emily.williams@practice.com", role: "Therapist", status: "active", joinedAt: "2024-03-05T00:00:00Z" },
  { id: "5", name: "Admin User", email: "admin@practice.com", role: "Admin", status: "active", joinedAt: "2023-06-01T00:00:00Z" },
];

export default function UserManagementPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">User Management</PageTitle>
          <PageSubtitle>
            Invite new providers, manage access, and assign roles within your practice.
          </PageSubtitle>
        </div>
        <UserManagementTable users={MOCK_USERS} />
      </PageContent>
    </PageContainer>
  );
}
