"use client";

import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import type { SafetyStudentRow } from "@/lib/student-alerts/safety-types";
import { AddTaskModal } from "./add-task-modal";
import { TaskDetailModal } from "./task-detail-modal";
import type { Task, TaskPriority, TaskStatus, CreatedBy } from "./task-types";
import { TasksFilters } from "./tasks-filters";
import { TasksSummaryCards } from "./tasks-summary-cards";
import { TasksTable } from "./tasks-table";

type Props = {
  safetyRows: SafetyStudentRow[];
  safetySummary: {
    emergency: number;
    high: number;
    moderate: number;
    low: number;
  };
  tasks: Task[];
  patients?: Array<{ id: string; name: string; code?: string }>;
};

function convertAlertsToTasks(rows: SafetyStudentRow[]): Task[] {
  const tasks: Task[] = [];
  
  for (const row of rows) {
    for (const alert of row.alerts) {
      const priority: TaskPriority = 
        row.highestRiskLevel === "emergency" ? "urgent" :
        row.highestRiskLevel === "high" ? "high" :
        row.highestRiskLevel === "moderate" ? "medium" : "low";
      
      const status: TaskStatus = 
        row.status === "resolved" ? "done" : "todo";

      tasks.push({
        id: `alert-${alert.alertId}`,
        patientId: row.studentId,
        patientName: row.studentName,
        patientCode: row.studentCode ?? undefined,
        title: `Review Safety Alert`,
        description: `${alert.type.replace(/_/g, " ")} - ${row.highestRiskLevel} risk`,
        priority,
        status,
        createdBy: "system" as CreatedBy,
        sourceAlertId: alert.alertId,
        createdAt: row.latestAlertAt,
        updatedAt: row.latestAlertAt,
      });
    }
  }
  
  return tasks;
}

export function AlertsTasksClient({ safetyRows, tasks: manualTasks, patients = [] }: Props) {
  const [search] = useQueryState("search", { defaultValue: "" });
  const [priorityFilter] = useQueryState("priority", { defaultValue: "all" });
  const [statusFilter] = useQueryState("status", { defaultValue: "all" });
  const [createdByFilter] = useQueryState("createdBy", { defaultValue: "all" });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const alertTasks = useMemo(() => convertAlertsToTasks(safetyRows), [safetyRows]);
  
  const allTasks = useMemo(() => {
    return [...alertTasks, ...manualTasks].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [alertTasks, manualTasks]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase()) &&
          !task.patientName.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (createdByFilter !== "all" && task.createdBy !== createdByFilter) {
        return false;
      }
      return true;
    });
  }, [allTasks, search, priorityFilter, statusFilter, createdByFilter]);

  const tasksSummary = useMemo(() => {
    const activeTasks = allTasks.filter(t => t.status !== "done");
    return {
      total: activeTasks.length,
      urgent: activeTasks.filter(t => t.priority === "urgent").length,
      todo: activeTasks.filter(t => t.status === "todo").length,
      completed: allTasks.filter(t => t.status === "done").length,
    };
  }, [allTasks]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    console.log("Status change:", taskId, newStatus);
  };

  const handleAddTask = () => {
    setShowAddModal(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    console.log("Save task:", taskData);
  };

  // Mock assessment data for safety alert tasks (system-generated tasks with sourceAlertId)
  const getAssessmentData = (task: Task) => {
    if (task.createdBy !== "system" || !task.sourceAlertId) return undefined;
    
    return {
      type: "PHQ-9" as const,
      totalScore: 18,
      maxScore: 27,
      completionRate: 100,
      completedAt: task.createdAt,
      riskLevel: task.priority === "urgent" ? "emergency" as const : 
                 task.priority === "high" ? "high" as const : 
                 task.priority === "medium" ? "moderate" as const : "low" as const,
      questions: [
        { number: 1, text: "Little interest or pleasure in doing things", response: "More than half the days", score: 2 },
        { number: 2, text: "Feeling down, depressed, or hopeless", response: "More than half the days", score: 2 },
        { number: 3, text: "Trouble falling or staying asleep, or sleeping too much", response: "Several days", score: 1 },
        { number: 4, text: "Feeling tired or having little energy", response: "More than half the days", score: 2 },
        { number: 5, text: "Poor appetite or overeating", response: "Several days", score: 1 },
        { number: 6, text: "Feeling bad about yourself", response: "More than half the days", score: 2 },
        { number: 7, text: "Trouble concentrating on things", response: "Several days", score: 1 },
        { number: 8, text: "Moving or speaking slowly/being fidgety or restless", response: "Not at all", score: 0 },
        { number: 9, text: "Thoughts that you would be better off dead, or of hurting yourself", response: "More than half the days", score: 3, flagged: true },
      ],
    };
  };

  // Build patient list from tasks if not provided
  const patientList = patients.length > 0 ? patients : 
    [...new Map(allTasks.map(t => [t.patientId, { id: t.patientId, name: t.patientName, code: t.patientCode }])).values()];

  return (
    <div className="space-y-6">
      <TasksSummaryCards summary={tasksSummary} />
      <TasksFilters onAddTask={handleAddTask} />
      <TasksTable 
        tasks={filteredTasks} 
        onStatusChange={handleStatusChange}
        onTaskClick={handleTaskClick}
      />

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveTask}
        patients={patientList}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        assessmentData={selectedTask ? getAssessmentData(selectedTask) : undefined}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
