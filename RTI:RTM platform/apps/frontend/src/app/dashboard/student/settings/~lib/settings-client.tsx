"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  FileText,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { SVGProps } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/tailwind-utils";
import AccountSection from "./account";
import { CrisisBanner } from "./emergency-resources/crisis-banner";
import { EmergencyResourcesSection } from "./emergency-resources/emergency-section";
import {
  RememberYouMatter,
  WarningSignsSection,
} from "./emergency-resources/footer-sections";
import { HomeSafetySection } from "./emergency-resources/home-safety";
import { SchoolSpecificResources } from "./emergency-resources/school-resources";
import { SpecializedSupportServices } from "./emergency-resources/specialized-support";
import Support from "./support";

type TabType = "resources" | "account" | "support" | "legal";

type SettingsClientProps = {
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    age: string | null;
    dateOfBirth: string | null;
  };
  basePath?: string;
};

function GreenCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.7066 0.292969C14.0973 0.683594 14.0973 1.31797 13.7066 1.70859L5.70664 9.70859C5.31602 10.0992 4.68164 10.0992 4.29102 9.70859L0.291016 5.70859C-0.0996094 5.31797 -0.0996094 4.68359 0.291016 4.29297C0.681641 3.90234 1.31602 3.90234 1.70664 4.29297L5.00039 7.58359L12.2941 0.292969C12.6848 -0.0976562 13.3191 -0.0976562 13.7098 0.292969H13.7066Z"
        fill="#22C55E"
      />
    </svg>
  );
}

export default function SettingsClient({
  userInfo,
  basePath = "/dashboard/student",
}: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const validTabs: TabType[] = ["resources", "account", "support", "legal"];
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam && validTabs.includes(tabParam) ? tabParam : "resources",
  );
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);

  // Sync activeTab with URL param
  useEffect(() => {
    const tab =
      tabParam && validTabs.includes(tabParam) ? tabParam : "resources";
    setActiveTab(tab);
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`${basePath}/settings?tab=${tab}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 md:flex-row">
      {/* Mobile: Fixed Top Navigation / Desktop: Fixed Sidebar */}
      <div className="fixed top-0 z-10 w-full border-b bg-white md:left-0 md:h-screen md:w-64 md:border-r md:border-b-0">
        <div className="flex flex-col p-4 md:h-full md:p-6">
          {/* Mobile: Back button and Settings title */}
          <div className="mb-4 flex items-center justify-between md:mb-6 md:block">
            <Link
              href={`${basePath}/home`}
              className="absolute left-4 flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 text-sm transition-colors hover:bg-gray-100 md:relative md:left-0 md:mb-6 md:w-full md:px-4 md:py-3 md:text-left"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Link>
            <h1 className="flex-1 text-center font-bold text-2xl text-gray-800 md:flex-none md:text-left">
              Settings
            </h1>
          </div>

          {/* Mobile: Pills Navigation / Desktop: Vertical Navigation */}
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:space-y-0 md:overflow-x-visible">
            <button
              onClick={() => handleTabChange("resources")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors md:w-full md:px-4 md:py-3 md:text-left ${
                activeTab === "resources"
                  ? "bg-gray-100 font-medium text-gray-800"
                  : "bg-white text-gray-600 hover:bg-gray-100 md:bg-transparent"
              }`}
            >
              <span className="md:hidden">Emergency</span>
              <span className="hidden md:inline">Emergency Resources</span>
            </button>
            <button
              onClick={() => handleTabChange("account")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors md:w-full md:px-4 md:py-3 md:text-left ${
                activeTab === "account"
                  ? "bg-gray-100 font-medium text-gray-800"
                  : "bg-white text-gray-600 hover:bg-gray-100 md:bg-transparent"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => handleTabChange("support")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors md:w-full md:px-4 md:py-3 md:text-left ${
                activeTab === "support"
                  ? "bg-gray-100 font-medium text-gray-800"
                  : "bg-white text-gray-600 hover:bg-gray-100 md:bg-transparent"
              }`}
            >
              Support
            </button>
            <button
              onClick={() => handleTabChange("legal")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors md:w-full md:px-4 md:py-3 md:text-left ${
                activeTab === "legal"
                  ? "bg-gray-100 font-medium text-gray-800"
                  : "bg-white text-gray-600 hover:bg-gray-100 md:bg-transparent"
              }`}
            >
              Legal
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="mt-[120px] w-full min-w-0 flex-1 overflow-y-auto md:mt-0 md:ml-64">
        <div className="w-full p-4 md:p-8">
          {activeTab === "resources" && (
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
          )}

          {activeTab === "account" && (
            <div className="w-full space-y-6">
              <AccountSection
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                email={userInfo.email}
                age={userInfo.age}
                dateOfBirth={userInfo.dateOfBirth}
              />
            </div>
          )}

          {activeTab === "support" && (
            <div className="w-full space-y-6">
              <Support basePath={basePath} />
            </div>
          )}

          {activeTab === "legal" && (
            <div className="w-full space-y-6">
              <div className="w-full rounded-2xl border border-gray-200 bg-white p-6">
                <p className="mb-6 text-gray-600 text-sm">
                  This page offers a concise summary of our terms and conditions
                  and privacy policy. For the complete and exact language,
                  please access them{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    here
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-600 hover:underline">
                    here
                  </Link>
                  , respectively.
                </p>

                {/* Terms and Conditions Summary Box */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                    className="w-full rounded-xl border border-gray-200 bg-blue-50 p-5 text-left transition-colors hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Terms and Conditions
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Last updated: January 2024
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-gray-400 transition-transform",
                          isTermsExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isTermsExpanded && (
                    <div className="mt-4 space-y-4">
                      {/* 1. Acceptance of Terms */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          1. Acceptance of Terms
                        </h4>
                        <p className="text-gray-600 text-sm">
                          By accessing and using FeelWell, you accept and agree
                          to be bound by the terms and provision of this
                          agreement. If you do not agree to abide by the above,
                          please do not use this service.
                        </p>
                      </div>

                      {/* 2. Service Description */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-3 font-semibold text-gray-900">
                          2. Service Description
                        </h4>
                        <p className="mb-3 text-gray-600 text-sm">
                          FeelWell is a mental wellness and social-emotional
                          learning platform that provides tools, resources, and
                          support for mental health and wellbeing. Our services
                          include:
                        </p>
                        <ul className="space-y-2 pl-6">
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <GreenCheck className="mt-0.5 shrink-0" />
                            <span>
                              Mood tracking and mental health check-ins
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <GreenCheck className="mt-0.5 shrink-0" />
                            <span>Wellness tools and coping strategies</span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <GreenCheck className="mt-0.5 shrink-0" />
                            <span>Educational content and resources</span>
                          </li>
                        </ul>
                      </div>

                      {/* 3. Medical Disclaimer */}
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-yellow-200 p-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-2 font-semibold text-yellow-800">
                              3. Medical Disclaimer
                            </h4>
                            <p className="text-gray-700 text-sm">
                              FeelWell is not a substitute for professional
                              medical advice, diagnosis, or treatment. Always
                              seek the advice of your physician or other
                              qualified health provider with any questions you
                              may have regarding a medical condition. Never
                              disregard professional medical advice or delay in
                              seeking it because of something you have read on
                              FeelWell.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 4. User Responsibilities */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-3 font-semibold text-gray-900">
                          4. User Responsibilities
                        </h4>
                        <p className="mb-3 text-gray-600 text-sm">
                          You agree to:
                        </p>
                        <ul className="space-y-2 pl-6">
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                            <span>
                              Provide accurate and truthful information
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                            <span>
                              Use the service in a respectful and appropriate
                              manner
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                            <span>
                              Maintain the confidentiality of your account
                              credentials
                            </span>
                          </li>
                          <li className="flex items-start gap-2 text-gray-600 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                            <span>
                              Not share harmful, offensive, or inappropriate
                              content
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* 5. Privacy and Data Protection */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          5. Privacy and Data Protection
                        </h4>
                        <p className="mb-3 text-gray-600 text-sm">
                          Your privacy is important to us. We collect and use
                          your information in accordance with our Privacy
                          Policy. By using FeelWell, you consent to the
                          collection and use of information as outlined in our
                          Privacy Policy.
                        </p>
                        <Link
                          href="#"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 text-sm hover:underline"
                        >
                          Read Privacy Policy →
                        </Link>
                      </div>

                      {/* 6. Intellectual Property */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          6. Intellectual Property
                        </h4>
                        <p className="text-gray-600 text-sm">
                          All content, features, and functionality of FeelWell
                          are owned by us and are protected by copyright,
                          trademark, and other intellectual property laws. You
                          may not reproduce, distribute, or create derivative
                          works from our content without explicit permission.
                        </p>
                      </div>

                      {/* 7. Limitation of Liability */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          7. Limitation of Liability
                        </h4>
                        <p className="text-gray-600 text-sm">
                          FeelWell shall not be liable for any indirect,
                          incidental, special, consequential, or punitive
                          damages resulting from your use or inability to use
                          the service. Our total liability shall not exceed the
                          amount paid by you for the service in the 12 months
                          preceding the claim.
                        </p>
                      </div>

                      {/* 8. Modifications to Terms */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          8. Modifications to Terms
                        </h4>
                        <p className="text-gray-600 text-sm">
                          We reserve the right to modify these terms at any
                          time. We will notify users of significant changes via
                          email or through the app. Continued use of FeelWell
                          after such modifications constitutes acceptance of the
                          updated terms.
                        </p>
                      </div>

                      {/* 9. Contact Information */}
                      <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          9. Contact Information
                        </h4>
                        <p className="mb-2 text-gray-600 text-sm">
                          If you have any questions about these Terms and
                          Conditions, please contact us:
                        </p>
                        <Link
                          href="mailto:hello@psyflo.com"
                          className="inline-flex items-center gap-2 font-semibold text-blue-600 text-sm hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          hello@psyflo.com
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
