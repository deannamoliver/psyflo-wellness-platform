import Link from "next/link";
import { Button } from "@/lib/core-ui/button";
import { H3, H4, P } from "@/lib/core-ui/typography";
import { PageSubtitle, PageTitle } from "@/lib/extended-ui/page";
import * as Icons from "./icons";
import { ResourceCard } from "./resource-card";

export default function EmergencyResourcesSummary() {
  return (
    <div>
      <div>
        <PageTitle className="flex items-center gap-2">
          <Icons.EmergencyResources />
          Emergency Resources
        </PageTitle>
        <PageSubtitle>
          If you're in crisis or need immediate help, these resources are
          available 24/7.
        </PageSubtitle>
      </div>

      <div className="mt-6 mb-8 flex flex-col gap-3 rounded-lg border border-destructive/80 bg-destructive/10 p-5">
        <H3 className="flex items-center gap-2 font-semibold text-destructive">
          <Icons.GetHelpNow />
          Get Help Now
        </H3>
        <P className="text-muted-foreground">
          If you're in immediate danger or having thoughts of self-harm or
          suicide. Please reach out for immediate help. You're not alone, and
          support is available.
        </P>
        <div className="mt-2 flex gap-3">
          <Button asChild variant="destructive">
            <Link href="tel:988">Call 988 (US)</Link>
          </Button>
          <Button asChild variant="destructive">
            <Link href="tel:911">Call 911</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ResourceCard
          heading="Crisis Text Line"
          sidebarColor="#3B82F6"
          icon={<Icons.CrisisTextLine />}
          textColor="#2563EB"
          description="Confidential support via text from trained crisis counselors."
          websiteUrl="https://www.crisistextline.org"
        >
          <P className="font-bold text-[20px]">
            <span className="flex items-center gap-3">
              <Icons.SMSTextBubble />
              <span>
                Text HOME to
                <span className="text-[#2563EB]"> 741741</span>
              </span>
            </span>
          </P>
          <span className="mt-auto" />
        </ResourceCard>
        <ResourceCard
          heading="988 Suicide & Crisis Lifeline"
          sidebarColor="#EF4444"
          icon={<Icons.SuicideLifeline />}
          textColor="#EF4444"
          description="24/7 free support for anyone in emotional distress or suicidal crisis."
          websiteUrl="https://988lifeline.org"
        >
          <P className="font-bold text-[20px]">
            <span className="mb-1 flex items-center gap-3 text-[#EF4444]">
              <Icons.GrayPhone /> Call 988
            </span>
            <span className="flex items-center gap-3">
              <Icons.SMSTextBubble /> Text 988
            </span>
          </P>
        </ResourceCard>
      </div>

      <H4 className="mt-8 mb-4 font-semibold">Specific Support</H4>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <ResourceCard
          heading="LGBTQ+ Youth"
          sidebarColor="#A78BFA"
          icon={<Icons.LGBTQYouth />}
          subHeading="The Trevor Project"
          textColor="#9333EA"
          description="Support for LGBTQ+ young people."
          websiteUrl="https://www.thetrevorproject.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-866-488-7386
            </span>
            <span className="flex items-center gap-2">
              <Icons.SMSTextBubble /> Text START to 678678
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Gaming Support"
          sidebarColor="#4ADE80"
          icon={<Icons.GamingSupport />}
          subHeading="Pause Before You Play"
          textColor="#16A34A"
          description="Helps with screen time, gaming habits, and balance."
          websiteUrl="https://www.youngminds.org.uk/young-person/coping-with-life/gaming-and-mental-health/"
        >
          <span className="mt-auto" />
        </ResourceCard>
        <ResourceCard
          heading="Relationships"
          sidebarColor="#F472B6"
          icon={<Icons.Relationships />}
          subHeading="Love is Respect"
          textColor="#DB2777"
          description="Support for teens facing relationship conflict or abuse."
          websiteUrl="https://www.loveisrespect.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-866-331-9474
            </span>
            <span className="flex items-center gap-2">
              <Icons.SMSTextBubble /> Text LOVEIS to 22522
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Body Image"
          sidebarColor="#F97316"
          icon={<Icons.BodyImage />}
          subHeading="NEDA Helpline"
          textColor="#EA580C"
          description="Support for disordered eating and body image concerns."
          websiteUrl="https://www.nationaleatingdisorders.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-800-931-2237
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Substance Use"
          sidebarColor="#6366F1"
          icon={<Icons.SubstanceUse />}
          subHeading="SAMHSA Helpline"
          textColor="#4F46E5"
          description="Confidential support for youth dealing with drugs, alcohol, or mental health."
          websiteUrl="https://www.samhsa.gov/find-help/national-helpline"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-800-662-HELP (4357)
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Domestic Violence"
          sidebarColor="#EF4444"
          icon={<Icons.DomesticViolence />}
          subHeading="National Domestic Violence Hotline"
          textColor="#EF4444"
          description="For anyone feeling unsafe at home or in a relationship."
          websiteUrl="https://www.thehotline.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-800-799-SAFE (7233)
            </span>
            <span className="flex items-center gap-2">
              <Icons.SMSTextBubble /> Text START to 88788
            </span>
          </P>
        </ResourceCard>
      </div>

      <H4 className="mt-8 mb-4 font-semibold">Home & Safety</H4>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ResourceCard
          heading="Family Conflict"
          sidebarColor="#3B82F6"
          icon={<Icons.FamilyConflict />}
          subHeading="Boys Town National Hotline"
          textColor="#2563EB"
          description="For youth and families in conflict or crisis"
          websiteUrl="https://www.boystown.org/hotline"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-800-448-3000
            </span>
            <span className="flex items-center gap-2">
              <Icons.SMSTextBubble /> Text VOICE to 20121
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Unsafe at Home"
          sidebarColor="#FACC15"
          icon={<Icons.UnsafeAtHome />}
          subHeading="TXT 4 HELP (Safe Place)"
          textColor="#CA8A04"
          description="Find nearby Safe Place locations for immediate support."
          websiteUrl="https://www.nationalsafeplace.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="flex items-center gap-2">
              <Icons.SMSTextBubble /> Text SAFE and your location to 44357
            </span>
          </P>
        </ResourceCard>
        <ResourceCard
          heading="Runaway Youth"
          sidebarColor="#34D399"
          icon={<Icons.RunawayYouth />}
          subHeading="National Runaway Safeline"
          textColor="#0D9488"
          description="Help for youth thinking about running away or currently homeless."
          websiteUrl="https://www.1800runaway.org"
        >
          <P className="mt-auto font-normal text-[16px]">
            <span className="mb-1 flex items-center gap-2">
              <Icons.GrayPhone /> 1-800-RUNAWAY (786-2929)
            </span>
          </P>
        </ResourceCard>
      </div>

      <div className="mt-12 flex w-full flex-col items-center rounded-lg border border-border bg-gradient-to-r from-primary to-primary/80 p-12">
        <H3 className="mb-4 text-primary-foreground">Remember: You Matter</H3>
        <P className="mb-8 text-primary-foreground">
          These resources are here for you 24/7. Don't hesitate to reach out
          when you need support.
        </P>
        <div className="mt-2 flex gap-4">
          <Button asChild variant="secondary" size="lg">
            <Link href="tel:988">
              <Icons.PurplePhone /> Call 988 Now
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-primary text-primary-foreground"
          >
            <Link href="sms:988">
              <Icons.WhiteTextBubble /> Text for Help
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
