import Link from "next/link";
import { H2, H3, P } from "@/lib/core-ui/typography";
import { Button } from "../core-ui/button";
import * as Icons from "./icons";
import { TermsAndConditionsCard } from "./terms-and-conditions-card";

export default function TermsAndConditionsSummary({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <H2 className="flex items-center gap-2">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <Icons.TermsConditions />
        </span>
        Terms and Conditions
      </H2>

      <div className="mt-4 h-16 rounded-lg border border-primary/40 bg-primary/10 px-6 py-4">
        <P className="font-normal text-base text-muted-foreground">
          This page offers a concise summary of our privacy policy. For the
          complete and exact language, please access them{" "}
          <Link href="/terms-and-conditions" className="text-primary">
            here
          </Link>
          .
        </P>
      </div>

      <div className="mt-4 text-right">
        <P className="font-normal text-base text-muted-foreground">
          Last Updated: June 12, 2025
        </P>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <TermsAndConditionsCard
          heading="1. Acceptance of Terms"
          description="By accessing and using FeelWell, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        />

        <TermsAndConditionsCard
          heading="2. Service Description"
          description="FeelWell is a mental wellness and social-emotional learning platform that provides tools, resources, and support for mental health and wellbeing. Our services include:"
        >
          <div className="mt-4 flex flex-col gap-2 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Icons.Checkmark /> Mood tracking and mental health check-ins
            </span>
            <span className="flex items-center gap-2">
              <Icons.Checkmark /> Wellness tools and coping strategies
            </span>
            <span className="flex items-center gap-2">
              <Icons.Checkmark /> Educational content and resources
            </span>
          </div>
        </TermsAndConditionsCard>

        <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-6">
          <div className="flex items-center gap-2">
            <Icons.MedicalDisclaimer />
            <H3 className="h-8 font-medium text-red-700 text-xl">
              3. Medical Disclaimer
            </H3>
          </div>
          <P className="font-normal text-base text-red-500 leading-6">
            FeelWell is not a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of your physician or
            other qualified health provider with any questions you may have
            regarding a medical condition. Never disregard professional medical
            advice or delay in seeking it because of something you have read on
            FeelWell.
          </P>
        </div>

        <TermsAndConditionsCard
          heading="4. User Responsibilities"
          description="You agree to:"
        >
          <div className="mt-4 flex flex-col gap-2 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Icons.BulletPoint /> Provide accurate and truthful information
            </span>
            <span className="flex items-center gap-2">
              <Icons.BulletPoint /> Use the service in a respectful and
              appropriate manner
            </span>
            <span className="flex items-center gap-2">
              <Icons.BulletPoint /> Maintain the confidentiality of your account
              credentials
            </span>
            <span className="flex items-center gap-2">
              <Icons.BulletPoint /> Not share harmful, offensive, or
              inappropriate content
            </span>
          </div>
        </TermsAndConditionsCard>

        <TermsAndConditionsCard
          heading="5. Privacy and Data Protection"
          description="Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy. By using FeelWell, you consent to the collection and use of information as outlined in our Privacy Policy."
        >
          <Button variant="link" asChild className="mt-2 px-0 text-base">
            <Link
              href="/privacy-policy"
              className="flex items-center gap-2 p-0"
            >
              Read Privacy Policy
              <span>
                <Icons.RightArrow />
              </span>
            </Link>
          </Button>
        </TermsAndConditionsCard>

        <TermsAndConditionsCard
          heading="6. Intellectual Property"
          description="All content, features, and functionality of FeelWell are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit permission."
        />

        <TermsAndConditionsCard
          heading="7. Limitation of Liability"
          description="FeelWell shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim service."
        />

        <TermsAndConditionsCard
          heading="8. Modifications to Terms"
          description="We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the app. Continued use of FeelWell after such modifications constitutes acceptance of the updated terms."
        />

        <div className="flex w-full flex-col items-start gap-2 rounded-lg border bg-primary/5 p-6">
          <H3 className="mb-2 font-medium text-xl">9. Contact Information</H3>
          <P className="font-normal text-base text-muted-foreground leading-6">
            If you have any questions about these Terms and Conditions, please
            contact us:
          </P>
          <div className="mt-2 flex items-center gap-2 font-semibold text-primary">
            <Icons.Email /> hello@psyflo.com
          </div>
        </div>
      </div>
    </div>
  );
}
