import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { TeamTable } from "./~lib/team-table";

export type TeamMemberRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  patientCount: number;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
};

// Mock data for demo purposes
const MOCK_TEAM: TeamMemberRow[] = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sarah.johnson@practice.com", role: "Therapist", patientCount: 24, status: "active", joinedAt: "2024-01-15T00:00:00Z" },
  { id: "2", name: "Dr. Michael Chen", email: "michael.chen@practice.com", role: "Therapist", patientCount: 18, status: "active", joinedAt: "2024-02-20T00:00:00Z" },
  { id: "3", name: "Lisa Martinez, LCSW", email: "lisa.martinez@practice.com", role: "Therapist", patientCount: 31, status: "active", joinedAt: "2023-11-10T00:00:00Z" },
  { id: "4", name: "Dr. Emily Williams", email: "emily.williams@practice.com", role: "Therapist", patientCount: 22, status: "active", joinedAt: "2024-03-05T00:00:00Z" },
  { id: "5", name: "Admin User", email: "admin@practice.com", role: "Admin", patientCount: 0, status: "active", joinedAt: "2023-06-01T00:00:00Z" },
];

export default function TeamPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Team</PageTitle>
          <PageSubtitle>
            Manage your practice's providers, staff, and their patient assignments.
          </PageSubtitle>
        </div>
        <TeamTable members={MOCK_TEAM} />
      </PageContent>
    </PageContainer>
  );
}
