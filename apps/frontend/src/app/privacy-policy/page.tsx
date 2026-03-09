import { PageContainer, PageContent } from "@/lib/extended-ui/page";
import PrivacyPolicyDetailed from "@/lib/privacy-policy/detailed";

export default function PrivacyPolicyPage() {
  return (
    <PageContainer>
      <PageContent size="medium">
        <PrivacyPolicyDetailed className="max-w-6xl" />
      </PageContent>
    </PageContainer>
  );
}
