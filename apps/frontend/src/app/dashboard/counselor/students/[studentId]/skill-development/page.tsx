import { Domain } from "./~lib/domain";
import SkillDevelopment from "./~lib/skill-dev";

export default async function StudentSkillDevelopmentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="flex flex-col gap-12">
      <Domain />
      <SkillDevelopment studentId={studentId} />
    </div>
  );
}
