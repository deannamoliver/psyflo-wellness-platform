import Link from "next/link";
import { H2, H3, P } from "@/lib/core-ui/typography";
import * as Icons from "./icons";
import { InformationCard } from "./information-card";
import { PrivacyPolicyCard } from "./privacy-policy-card";

export default function PrivacyPolicySummary({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <H2 className="flex items-center gap-2">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Icons.PrivacyPolicy />
        </span>
        Privacy Policy
      </H2>

      <div className="mt-4 h-16 rounded-lg border border-primary/40 bg-primary/10 px-6 py-4">
        <P className="font-normal text-base text-muted-foreground">
          This page offers a concise summary of our privacy policy. For the
          complete and exact language, please access them{" "}
          <Link href="/privacy-policy" className="text-primary">
            here
          </Link>
          .
        </P>
      </div>

      <div className="mt-4 text-right">
        <P className="font-normal text-base text-muted-foreground">
          Last updated: January 15, 2025
        </P>
      </div>

      <div className="mt-8 flex flex-col gap-2 rounded-xl border border-green-300/40 bg-green-300/10 p-6">
        <div className="flex flex-row items-center gap-3">
          <Icons.PrivacyOverview />
          <H3 className="font-semibold text-green-800 text-xl">
            Privacy Overview
          </H3>
        </div>
        <P className="text-base text-green-700">
          At FeelWell, we are committed to protecting your privacy and ensuring
          the security of your personal information. This policy explains how we
          collect, use, and safeguard your data when you use our
          social-emotional learning and mental wellness platform.
        </P>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <PrivacyPolicyCard heading="1. Information We Collect">
          <div className="flex flex-col gap-2">
            <P className="font-medium text-base leading-6">
              Personal Information
            </P>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#60A5FA" />
              <P>Name, email address, and profile information</P>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#60A5FA" />
              <P>Age, gender, and demographic information (optional)</P>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#60A5FA" />
              <P>Contact preferences and communication settings</P>
            </div>

            <P className="mt-2 font-medium text-base leading-6">
              Wellness Data
            </P>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#C084FC" />
              <P>Mood tracking entries and mental health check-ins</P>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#C084FC" />
              <P>Wellness goals and progress tracking</P>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.BulletPoint color="#C084FC" />
              <P>Usage patterns and app interaction data</P>
            </div>
          </div>
        </PrivacyPolicyCard>

        <PrivacyPolicyCard heading="2. How We Use Your Information">
          <div className="flex flex-row gap-4">
            <InformationCard
              icon={<Icons.ServiceProvision />}
              title="Service Provision"
              description="Personalize your wellness experience and provide tailored recommendations."
              className="bg-[#EFF6FF]"
              titleClassName="text-[#1E40AF]"
              descriptionClassName="text-[#1D4ED8]"
            />
            <InformationCard
              icon={<Icons.ProgressTracker />}
              title="Progress Tracking"
              description="Monitor your wellness journey and provide insights on your progress."
              className="bg-[#FAF5FF]"
              titleClassName="text-[#6B21A8]"
              descriptionClassName="text-[#7E22CE]"
            />
            <InformationCard
              icon={<Icons.Communication />}
              title="Communication"
              description="Send important updates, reminders, and wellness tips."
              className="bg-[#F0FDF4]"
              titleClassName="text-[#166534]"
              descriptionClassName="text-[#15803D]"
            />
            <InformationCard
              icon={<Icons.ServiceImprovement />}
              title="Service Improvement"
              description="Analyze usage patterns to enhance our platform and features."
              className="bg-[#FFF7ED]"
              titleClassName="text-[#9A3412]"
              descriptionClassName="text-[#C2410C]"
            />
          </div>
        </PrivacyPolicyCard>

        <PrivacyPolicyCard heading="3. Information Sharing">
          <div className="flex flex-col gap-2">
            <div className="flex h-16 w-full flex-row items-center gap-2 rounded-lg border border-destructive/10 bg-destructive/10 p-4 font-normal text-base text-destructive">
              <Icons.InformationSharing />
              <P>
                We do not sell, trade, or rent your personal information to
                third parties.
              </P>
            </div>
            <P className="mt-2 font-normal text-base text-muted-foreground">
              We may share your information only in these limited circumstances:
            </P>
            <span className="flex flex-row items-center gap-2 font-normal text-muted-foreground">
              <Icons.Checkmark /> With your explicit consent
            </span>
            <span className="flex flex-row items-center gap-2 font-normal text-muted-foreground">
              <Icons.Checkmark /> For legal compliance or safety purposes
            </span>
            <span className="flex flex-row items-center gap-2 font-normal text-muted-foreground">
              <Icons.Checkmark /> With trusted service providers under strict
              confidentiality agreements
            </span>
          </div>
        </PrivacyPolicyCard>

        <PrivacyPolicyCard heading="4. Data Security">
          <div className="flex w-full flex-row items-center gap-8">
            <div className="flex w-full flex-col items-center gap-px rounded-lg bg-muted-foreground/5 p-4">
              <Icons.Encryption />
              <P className="text-center text-sm">Encryption</P>
              <P className="text-center text-muted-foreground text-xs">
                End-to-end encryption
              </P>
            </div>
            <div className="flex w-full flex-col items-center gap-px rounded-lg bg-muted-foreground/5 p-4">
              <Icons.SecureStorage />
              <P className="text-center text-sm">Secure Storage</P>
              <P className="text-center text-muted-foreground text-xs">
                Protected Servers
              </P>
            </div>
            <div className="flex w-full flex-col items-center gap-px rounded-lg bg-muted-foreground/5 p-4">
              <Icons.AccessControl />
              <P className="text-center text-sm">Access Control</P>
              <P className="text-center text-muted-foreground text-xs">
                Limited authorized access
              </P>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center">
            <P className="text-center text-muted-foreground">
              We implement industry-standard security measures to protect your
              personal information against unauthorized
            </P>
            <P className="text-center text-muted-foreground">
              access, alteration, disclosure, or destruction.
            </P>
          </div>
        </PrivacyPolicyCard>

        <PrivacyPolicyCard heading="5. Your Rights">
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center gap-6 rounded-lg border bg-[#EFF6FF] p-3 px-6">
              <Icons.AccessYourData />
              <div className="flex flex-col">
                <P className="text-accent text-base">Access Your Data</P>
                <P className="text-accent text-sm">
                  Request a copy of all personal data we hold about you
                </P>
              </div>
            </div>

            <div className="flex w-full items-center gap-6 rounded-lg border bg-[#F0FDF4] p-3 px-6">
              <Icons.UpdateInformation />
              <div className="flex flex-col">
                <P className="text-[#166534] text-base">Update Information</P>
                <P className="text-[#15803D] text-sm">
                  Correct or update your personal information at any time
                </P>
              </div>
            </div>

            <div className="flex w-full items-center gap-6 rounded-lg border bg-[#FEF2F2] p-3 px-6">
              <Icons.DeleteYourData />
              <div className="flex flex-col">
                <P className="text-base text-destructive">Delete Your Data</P>
                <P className="text-destructive text-sm">
                  Request deletion of your personal information and account
                </P>
              </div>
            </div>
          </div>
        </PrivacyPolicyCard>

        <PrivacyPolicyCard heading="6. Contact Us">
          <div className="flex flex-col gap-2">
            <P className="text-base text-muted-foreground">
              If you have questions about this Privacy Policy or how we handle
              your data, please contact our Privacy Team:
            </P>
            <div className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
              <Icons.GrayEmail /> hello@psyflo.com
            </div>
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Icons.GrayPhone /> 1-816-352-2315
            </div>
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Icons.GrayLocation /> 11 E Loop Rd, New York, NY 10044
            </div>
          </div>
        </PrivacyPolicyCard>
      </div>
    </div>
  );
}
