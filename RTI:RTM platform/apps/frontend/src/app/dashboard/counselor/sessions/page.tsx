import { Activity, Clock, TrendingUp, Users } from "lucide-react";
import {
  SUMMARY_CARDS_GRID_CLASS,
  SummaryCard,
} from "@/lib/core-ui/summary-card";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { SessionsClient } from "./~lib/sessions-client";

export default function SessionsPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Sessions</PageTitle>
          <PageSubtitle>
            Review patient session activities, summaries, and outcomes.
          </PageSubtitle>
        </div>

        <div className={SUMMARY_CARDS_GRID_CLASS}>
          <SummaryCard
            label="Total Sessions"
            value={60}
            sublabel="Last 30 days"
            iconBgColor="bg-blue-50"
            valueColor="text-blue-600"
            icon={<Activity className="size-5 text-blue-600" />}
          />
          <SummaryCard
            label="Avg Duration"
            value="32m"
            sublabel="Per session"
            iconBgColor="bg-emerald-50"
            valueColor="text-emerald-600"
            icon={<Clock className="size-5 text-emerald-600" />}
          />
          <SummaryCard
            label="Positive Sentiment"
            value="42%"
            sublabel="Of all sessions"
            iconBgColor="bg-amber-50"
            valueColor="text-amber-600"
            icon={<TrendingUp className="size-5 text-amber-600" />}
          />
          <SummaryCard
            label="Active Patients"
            value={20}
            sublabel="With sessions this month"
            iconBgColor="bg-purple-50"
            valueColor="text-purple-600"
            icon={<Users className="size-5 text-purple-600" />}
          />
        </div>

        <SessionsClient />
      </PageContent>
    </PageContainer>
  );
}
