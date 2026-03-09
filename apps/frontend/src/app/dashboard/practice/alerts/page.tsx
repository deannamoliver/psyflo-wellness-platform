import { Suspense } from "react";
import {
  PageContainer,
  PageContent,
  PageSubtitle,
  PageTitle,
} from "@/lib/extended-ui/page";
import { AlertsTasksClient } from "@/app/dashboard/counselor/alerts/~lib/alerts-tasks-client";
import { TasksTableSkeleton } from "@/app/dashboard/counselor/alerts/~lib/tasks-table";
import type { Task } from "@/app/dashboard/counselor/alerts/~lib/task-types";
import type { SafetyStudentRow } from "@/lib/student-alerts/safety-types";

// Mock data for demo - in production this would come from the database
const MOCK_SAFETY_ROWS: SafetyStudentRow[] = [
  {
    studentId: "1",
    studentName: "Alex Morgan",
    studentCode: "AM001",
    grade: null,
    highestRiskLevel: "high",
    alertCount: 1,
    alerts: [{ alertId: "alert-1", type: "phq9_q9_endorsed", riskLevel: "high", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), status: "new" }],
    latestAlertAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionsTaken: ["notified_staff"],
    status: "new",
  },
  {
    studentId: "5",
    studentName: "Morgan Lee",
    studentCode: "ML005",
    grade: null,
    highestRiskLevel: "emergency",
    alertCount: 1,
    alerts: [{ alertId: "alert-5", type: "coach_escalation_report", riskLevel: "emergency", createdAt: new Date(Date.now() - 30 * 60 * 1000), status: "new" }],
    latestAlertAt: new Date(Date.now() - 30 * 60 * 1000),
    actionsTaken: [],
    status: "new",
  },
  {
    studentId: "7",
    studentName: "Jamie Chen",
    studentCode: "JC007",
    grade: null,
    highestRiskLevel: "high",
    alertCount: 1,
    alerts: [{ alertId: "alert-7", type: "phq9_q9_endorsed", riskLevel: "high", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), status: "new" }],
    latestAlertAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actionsTaken: [],
    status: "new",
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    patientId: "2",
    patientName: "Jordan Taylor",
    patientCode: "JT002",
    title: "Follow up on missed check-ins",
    description: "Patient has missed 5 consecutive check-ins",
    priority: "medium",
    status: "todo",
    createdBy: "you",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "task-2",
    patientId: "3",
    patientName: "Sam Rivera",
    patientCode: "SR003",
    title: "Review PHQ-9 score increase",
    description: "PHQ-9 score increased from 8 to 15",
    priority: "high",
    status: "todo",
    createdBy: "you",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_SUMMARY = {
  emergency: 1,
  high: 2,
  moderate: 0,
  low: 0,
};

export default function OrgAlertsPage() {
  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <div>
          <PageTitle className="font-semibold">Action Items</PageTitle>
          <PageSubtitle>
            Manage patient tasks and treatment follow-ups. Safety alerts automatically generate tasks for review.
          </PageSubtitle>
        </div>
        <Suspense fallback={<TasksTableSkeleton />}>
          <AlertsTasksClient
            safetyRows={MOCK_SAFETY_ROWS}
            safetySummary={MOCK_SUMMARY}
            tasks={MOCK_TASKS}
          />
        </Suspense>
      </PageContent>
    </PageContainer>
  );
}
