import {
  PageContainer,
  PageContent,
} from "@/lib/extended-ui/page";
import { PracticeDashboard } from "./~lib/practice-dashboard";
import { PracticeWelcomeHeader } from "./~lib/practice-welcome-header";

// Mock data for demo purposes
const MOCK_PROVIDER_COUNT = 4;
const MOCK_PATIENT_COUNT = 95;
const MOCK_ACTIVE_PATIENT_COUNT = 81;

// Mock school data for demo
const MOCK_SCHOOLS = [
  { id: "school-1", name: "Psyflo Academy" },
];

export default function PracticeHomePage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <PracticeWelcomeHeader
          name="Practice Manager"
          schools={MOCK_SCHOOLS}
          currentSchoolId="school-1"
        />
        <PracticeDashboard
          providerCount={MOCK_PROVIDER_COUNT}
          patientCount={MOCK_PATIENT_COUNT}
          activePatientCount={MOCK_ACTIVE_PATIENT_COUNT}
        />
      </PageContent>
    </PageContainer>
  );
}
