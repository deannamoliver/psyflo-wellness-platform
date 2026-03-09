import ComingSoon from "@/lib/coming-soon";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";

export default function DiscoverPage() {
  return (
    <PageContainer className="h-full">
      <PageContent className="flex flex-col justify-center">
        <ComingSoon />
      </PageContent>
    </PageContainer>
  );
}
