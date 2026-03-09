import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import TermsAndConditionsDetailed from "@/lib/terms-and-conditions/detailed";

export default function TermsAndConditionsPage() {
  return (
    <PageContainer>
      <PageContent size="medium">
        <TermsAndConditionsDetailed className="max-w-6xl" />
      </PageContent>
    </PageContainer>
  );
}
