import { CheckIcon, ClockIcon, LockIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/lib/core-ui/card";
import { Progress } from "@/lib/core-ui/progress";
import { Muted } from "@/lib/core-ui/typography";
import { Timestamp } from "@/lib/extended-ui/timestamp";
import { cn } from "@/lib/tailwind-utils";
import { getCurrentDomain } from "./data";

function StatusTag({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "locked":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "locked":
        return "Locked";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "absolute top-4 right-4 rounded-md px-2 py-1 font-medium text-xs",
        getStatusStyles(),
      )}
    >
      {getStatusText()}
    </div>
  );
}

interface SkillCardProps {
  skill: {
    name: string;
    description: string;
    status: string;
    progress: number;
    completedDate?: Date;
  };
}

function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="relative bg-background shadow-none">
      <StatusTag status={skill.status} />
      <CardHeader>
        <CardTitle>{skill.name}</CardTitle>
        <CardDescription>{skill.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {skill.status !== "locked" && (
            <Progress
              value={skill.progress}
              className={
                skill.status === "completed"
                  ? "[&>div]:bg-success"
                  : "[&>div]:bg-primary"
              }
            />
          )}
          {skill.status === "completed" && skill.completedDate && (
            <Muted>
              Completed on{" "}
              <Timestamp value={skill.completedDate} format="MMM d, yyyy" />
            </Muted>
          )}
          {skill.status === "locked" && (
            <Muted>Complete previous skill to unlock</Muted>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  const getIconStyles = () => {
    switch (status) {
      case "locked":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-primary/40 text-primary";
      case "completed":
        return "bg-success/40 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "locked":
        return <LockIcon className="h-5 w-5" />;
      case "in-progress":
        return <ClockIcon className="h-5 w-5" />;
      case "completed":
        return <CheckIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        getIconStyles(),
      )}
    >
      {getIcon()}
    </div>
  );
}

export function SkillCards() {
  const domain = getCurrentDomain();
  return (
    <div>
      <div className="relative">
        <div className="absolute top-5 bottom-0 left-4 w-0.5 bg-muted" />
        <div className="flex flex-col gap-6 pl-12">
          {domain.skills.map((skill) => (
            <div key={skill.id} className="relative">
              <div className="-left-12 absolute top-4">
                <StatusIcon status={skill.status} />
              </div>
              <SkillCard skill={skill} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
