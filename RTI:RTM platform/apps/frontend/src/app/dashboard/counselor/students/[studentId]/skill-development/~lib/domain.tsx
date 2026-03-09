import { Progress } from "@/lib/core-ui/progress";
import { H4, P } from "@/lib/core-ui/typography";
import { getCurrentDomain } from "./data";
import { SkillCards } from "./skill-cards";

export function Domain() {
  const domain = getCurrentDomain();
  const completedSkills = domain.skills.filter(
    (skill) => skill.status === "completed",
  ).length;
  const totalSkills = domain.skills.length;
  const overallProgress =
    totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  return (
    <div className="flex flex-col gap-4">
      <H4 className="font-medium">{domain.name} Domain</H4>
      <P className="text-muted-foreground">{domain.description}</P>
      <Progress value={overallProgress} className="[&>div]:bg-orange-500" />
      <SkillCards />
    </div>
  );
}
