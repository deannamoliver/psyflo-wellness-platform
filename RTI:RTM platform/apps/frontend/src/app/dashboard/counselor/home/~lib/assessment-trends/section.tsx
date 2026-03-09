import { AssessmentTrendsCard } from "./assessment-trends-card";
import { getAssessmentTableData, getAssessmentTrendsTimeSeries } from "./data";

export async function AssessmentTrendsSection({
  schoolId,
}: {
  schoolId: string;
}) {
  const [timeSeriesData, tableData] = await Promise.all([
    getAssessmentTrendsTimeSeries(schoolId),
    getAssessmentTableData(schoolId),
  ]);

  // Extract unique grades from table data
  const grades = [
    ...new Set(
      tableData.map((r) => r.grade).filter((g): g is number => g !== null),
    ),
  ].sort((a, b) => a - b);

  if (tableData.length === 0 && timeSeriesData.length === 0) {
    return null;
  }

  return (
    <AssessmentTrendsCard
      timeSeriesData={timeSeriesData}
      tableData={tableData}
      grades={grades}
    />
  );
}
