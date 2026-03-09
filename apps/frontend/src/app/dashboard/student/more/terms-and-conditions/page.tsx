import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import TermsAndConditionsSummary from "@/lib/terms-and-conditions/summary";

export default function TermsAndConditionsPage() {
  return (
    <PageContainer>
      <PageContent size="medium">
        <TermsAndConditionsSummary />
      </PageContent>
    </PageContainer>
  );
}
