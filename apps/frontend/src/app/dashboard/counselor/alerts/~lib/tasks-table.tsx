"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  MoreHorizontal,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/lib/core-ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/core-ui/table";
import { Muted } from "@/lib/core-ui/typography";
import { cn } from "@/lib/tailwind-utils";
import {
  CREATED_BY_CONFIG,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  type CreatedBy,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./task-types";

const TABLE_HEADERS = [
  "Task",
  "Patient",
  "Priority",
  "Created By",
  "Created At",
  "Due Date",
  "Status",
  "Actions",
];

export function TasksTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            {TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i} className="border-gray-100 border-b">
              <TableCell className="px-4">
                <Skeleton className="h-4 w-48 bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-28 bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
              </TableCell>
              <TableCell className="px-4">
                <Skeleton className="h-4 w-16 bg-gray-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
        c.bg,
        c.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
        c.bg,
        c.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function CreatedByBadge({ createdBy }: { createdBy: CreatedBy }) {
  const config = CREATED_BY_CONFIG[createdBy];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
}

type TaskRowProps = {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
};

function TaskRow({ task, onStatusChange, onTaskClick }: TaskRowProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <TableRow 
      className="border-gray-100 border-b transition-colors hover:bg-gray-50 cursor-pointer"
      onClick={() => onTaskClick?.(task)}
    >
      <TableCell className="px-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-900 text-sm">{task.title}</span>
          {task.description && (
            <span className="text-gray-500 text-xs line-clamp-1">
              {task.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm">
            {task.patientName}
          </span>
          {task.patientCode && (
            <span className="text-gray-500 text-xs">ID: {task.patientCode}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="px-4">
        <PriorityBadge priority={task.priority} />
      </TableCell>
      <TableCell className="px-4">
        <CreatedByBadge createdBy={task.createdBy} />
      </TableCell>
      <TableCell className="px-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-900 text-sm">
            {format(task.createdAt, "MMM d, yyyy")}
          </span>
          <span className="text-gray-500 text-xs">
            {format(task.createdAt, "h:mm a")}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4">
        {task.dueDate ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-900 text-sm">
              {formatDistanceToNow(task.dueDate, { addSuffix: true })}
            </span>
            <span className="text-gray-500 text-xs">
              {format(task.dueDate, "MMM d, yyyy")}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">No due date</span>
        )}
      </TableCell>
      <TableCell className="px-4">
        <StatusBadge status={task.status} />
      </TableCell>
      <TableCell className="px-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/counselor/students/${task.patientId}`}
            className="inline-flex items-center gap-1 font-medium text-blue-600 text-sm hover:text-blue-800"
          >
            View
            <UserIcon className="size-3.5" />
          </Link>
          {task.status !== "done" && onStatusChange && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, "done"); }}
              className="inline-flex items-center gap-1 font-medium text-green-600 text-sm hover:text-green-800"
            >
              <CheckCircle2 className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

type TasksTableProps = {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
};

export function TasksTable({ tasks, onStatusChange, onTaskClick }: TasksTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 border-b bg-gray-50/50">
              {TABLE_HEADERS.map((h) => (
                <TableHead
                  key={h}
                  className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="h-32">
                <div className="flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="size-8 text-green-300" />
                  <Muted>No tasks. You're all caught up!</Muted>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white font-dm shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b bg-gray-50/50">
            {TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className="px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onStatusChange={onStatusChange} onTaskClick={onTaskClick} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
