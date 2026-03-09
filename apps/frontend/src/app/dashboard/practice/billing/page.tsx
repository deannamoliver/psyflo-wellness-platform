import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { PracticeBillingDashboard } from "./~lib/practice-billing-dashboard";

// Mock data for demo purposes
const MOCK_PATIENT_COUNT = 95;
const MOCK_PROVIDER_COUNT = 4;

export default function PracticeBillingPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Practice Billing</PageTitle>
          <PageSubtitle>
            Aggregate billing metrics and CPT code eligibility across your practice.
          </PageSubtitle>
        </div>
        <PracticeBillingDashboard
          patientCount={MOCK_PATIENT_COUNT}
          providerCount={MOCK_PROVIDER_COUNT}
        />
      </PageContent>
    </PageContainer>
  );
}
