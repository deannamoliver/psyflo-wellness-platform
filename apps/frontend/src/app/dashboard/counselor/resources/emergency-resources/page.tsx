import { CrisisBanner } from "@/app/dashboard/student/settings/~lib/emergency-resources/crisis-banner";
import { EmergencyResourcesSection } from "@/app/dashboard/student/settings/~lib/emergency-resources/emergency-section";
import {
  RememberYouMatter,
  WarningSignsSection,
} from "@/app/dashboard/student/settings/~lib/emergency-resources/footer-sections";
import { HomeSafetySection } from "@/app/dashboard/student/settings/~lib/emergency-resources/home-safety";
import { SchoolSpecificResources } from "@/app/dashboard/student/settings/~lib/emergency-resources/school-resources";
import { SpecializedSupportServices } from "@/app/dashboard/student/settings/~lib/emergency-resources/specialized-support";
import { PageContainer, PageContent } from "@/lib/extended-ui/page";

export default function EmergencyResourcesPage() {
  return (
    <PageContainer>
      <PageContent size="medium">
        <div className="w-full space-y-6 md:space-y-6">
          {/* 1. 24/7 Crisis Support Available Banner */}
          <CrisisBanner />

          {/* 2. Emergency Resources (General) */}
          <EmergencyResourcesSection />

          {/* 3. School-Specific Resources */}
          <SchoolSpecificResources />

          {/* 4. Specialized Support Services */}
          <SpecializedSupportServices />

          {/* 5. Home & Safety */}
          <HomeSafetySection />

          {/* 6. Remember: You Matter */}
          <RememberYouMatter />

          {/* 7. Recognizing Warning Signs */}
          <WarningSignsSection />
        </div>
      </PageContent>
    </PageContainer>
  );
}
