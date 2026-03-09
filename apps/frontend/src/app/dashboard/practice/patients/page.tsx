import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { PatientCensusTable } from "./~lib/patient-census-table";

export type PatientCensusRow = {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  assignedProvider: string;
  status: "active" | "inactive";
  billingEligible: boolean;
  dataDays: number;
  providerMinutes: number;
};

// Mock data for demo purposes
const MOCK_PROVIDERS = ["Dr. Sarah Johnson", "Dr. Michael Chen", "Lisa Martinez, LCSW", "Dr. Emily Williams"];

const MOCK_PATIENTS: PatientCensusRow[] = Array.from({ length: 95 }, (_, i) => {
  const names = ["James Wilson", "Emma Thompson", "Michael Brown", "Sarah Davis", "David Miller", "Jennifer Garcia", "Robert Martinez", "Lisa Anderson", "William Taylor", "Maria Rodriguez"];
  const name = names[i % names.length];
  const dataDays = Math.floor(Math.random() * 28) + 1;
  const providerMinutes = Math.floor(Math.random() * 40) + 5;
  const isActive = Math.random() > 0.15;
  return {
    id: `patient-${i + 1}`,
    name: `${name} ${i + 1}`,
    email: `${name.toLowerCase().replace(" ", ".")}${i + 1}@email.com`,
    enrolledAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    assignedProvider: MOCK_PROVIDERS[i % MOCK_PROVIDERS.length],
    status: isActive ? "active" : "inactive",
    billingEligible: dataDays >= 2 && providerMinutes >= 20,
    dataDays,
    providerMinutes,
  };
});

export default function PatientCensusPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Patient Census</PageTitle>
          <PageSubtitle>
            View all patients enrolled in your practice. No clinical data is displayed.
          </PageSubtitle>
        </div>
        <PatientCensusTable patients={MOCK_PATIENTS} providers={MOCK_PROVIDERS} />
      </PageContent>
    </PageContainer>
  );
}
