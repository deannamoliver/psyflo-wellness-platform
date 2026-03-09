import ComingSoon from "@/lib/coming-soon";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";

export default function InboxPage() {
  return (
    <PageContainer className="h-full">
      <PageContent size="medium" className="flex flex-col justify-center">
        <ComingSoon />
      </PageContent>
    </PageContainer>
  );
}
