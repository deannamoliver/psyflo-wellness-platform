import type { inferParserType } from "nuqs";
import { Muted } from "@/lib/core-ui/typography";
import { Empty } from "@/lib/extended-ui/empty";
import { getStudentGroupedAlerts } from "@/lib/student-alerts/queries";
import { StudentAlertCard } from "@/lib/student-alerts/student-alert-card";
import type { searchParamsParsers } from "./parsers";

export async function AlertCards({
  schoolId,
  sParams,
}: {
  schoolId: string;
  sParams: inferParserType<typeof searchParamsParsers>;
}) {
  const studentGroupedData = await getStudentGroupedAlerts({
    schoolId,
    sParams,
  });

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {studentGroupedData.length === 0 && (
        <Empty className="col-span-full h-60">
          <Muted>No alerts found</Muted>
        </Empty>
      )}
      {studentGroupedData.map((studentData) => (
        <StudentAlertCard key={studentData.student.id} data={studentData} />
      ))}
    </div>
  );
}
