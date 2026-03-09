import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { ProvidersTable } from "./~lib/providers-table";

export type ProviderRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  patientCount: number;
  status: "active" | "inactive";
  joinedAt: string;
};

// Mock data for demo purposes
const MOCK_PROVIDERS: ProviderRow[] = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sarah.johnson@practice.com", role: "Therapist", patientCount: 24, status: "active", joinedAt: "2024-01-15T00:00:00Z" },
  { id: "2", name: "Dr. Michael Chen", email: "michael.chen@practice.com", role: "Therapist", patientCount: 18, status: "active", joinedAt: "2024-02-20T00:00:00Z" },
  { id: "3", name: "Lisa Martinez, LCSW", email: "lisa.martinez@practice.com", role: "Wellness Coach", patientCount: 31, status: "active", joinedAt: "2023-11-10T00:00:00Z" },
  { id: "4", name: "Dr. Emily Williams", email: "emily.williams@practice.com", role: "Therapist", patientCount: 22, status: "active", joinedAt: "2024-03-05T00:00:00Z" },
];

export default function ProvidersPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Provider Roster</PageTitle>
          <PageSubtitle>
            Manage your practice's clinicians and their patient assignments.
          </PageSubtitle>
        </div>
        <ProvidersTable providers={MOCK_PROVIDERS} />
      </PageContent>
    </PageContainer>
  );
}
