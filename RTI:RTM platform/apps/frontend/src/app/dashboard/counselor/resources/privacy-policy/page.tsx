import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import PrivacyPolicySummary from "@/lib/privacy-policy/summary";

export default function PrivacyPolicyPage() {
  return (
    <PageContainer>
      <PageContent size="medium">
        <PrivacyPolicySummary />
      </PageContent>
    </PageContainer>
  );
}
