import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import { MentalHealthContributorsChart } from "./mental-health-contributors-chart";

type ContributorData = {
  name: string;
  value: number;
  fill: string;
};

export function MentalHealthContributorsSection() {
  const contributorData: ContributorData[] = [
    { name: "Bullying", value: 35, fill: "#1E3A8A" },
    { name: "Academic Pressure", value: 25, fill: "#3B82F6" },
    { name: "Family Issues", value: 40, fill: "#93C5FD" },
  ];

  return (
    <Card className="overflow-clip p-0">
      <CardHeader className="rounded-t-xl bg-card px-6 py-2">
        <CardTitle className="mt-6 font-bold text-2xl">
          Mental Health Contributors
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-white p-6">
        <div className="grid h-[400px] grid-cols-1 gap-6 overflow-hidden lg:grid-cols-2">
          <div className="flex h-full flex-col items-center justify-center overflow-hidden">
            <div className="w-full rounded bg-white p-6">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0">
                  <MentalHealthContributorsChart data={contributorData} />
                </div>

                <div className="mt-6 text-center text-muted-foreground text-sm">
                  Based on Chat-based conversations
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center space-y-4 p-6">
            {contributorData.map((contributor) => (
              <div key={contributor.name} className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: contributor.fill }}
                />
                <span className="font-medium text-gray-700">
                  {contributor.name}
                </span>
                <span className="ml-auto text-gray-600">
                  {contributor.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
