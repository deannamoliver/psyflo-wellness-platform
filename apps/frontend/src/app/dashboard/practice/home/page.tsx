import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { PracticeDashboard } from "./~lib/practice-dashboard";

// Mock data for demo purposes
const MOCK_PROVIDER_COUNT = 4;
const MOCK_PATIENT_COUNT = 95;
const MOCK_ACTIVE_PATIENT_COUNT = 81;

export default function PracticeHomePage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Practice Overview</PageTitle>
          <PageSubtitle>
            Monitor your practice's operational health, provider roster, and patient census.
          </PageSubtitle>
        </div>
        <PracticeDashboard
          providerCount={MOCK_PROVIDER_COUNT}
          patientCount={MOCK_PATIENT_COUNT}
          activePatientCount={MOCK_ACTIVE_PATIENT_COUNT}
        />
      </PageContent>
    </PageContainer>
  );
}
