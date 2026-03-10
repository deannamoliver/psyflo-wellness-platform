"use server";

// Mock export function - replace with actual database query when schema is ready
export async function exportPatientsCsv(ids: string[]): Promise<string> {
  if (ids.length === 0) return "";

  const headers = ["ID", "Name", "Organization", "Status", "Added At"];
  
  // Mock data for export
  const mockData: Record<string, { name: string; organization: string; status: string; addedAt: string }> = {
    "1": { name: "John Smith", organization: "Downtown Mental Health", status: "Active", addedAt: "Jan 15, 2024" },
    "2": { name: "Sarah Johnson", organization: "Westside Behavioral", status: "Active", addedAt: "Jan 20, 2024" },
    "3": { name: "Michael Chen", organization: "Downtown Mental Health", status: "Inactive", addedAt: "Feb 1, 2024" },
    "4": { name: "Emily Davis", organization: "North County Wellness", status: "Active", addedAt: "Feb 10, 2024" },
    "5": { name: "Robert Wilson", organization: "Westside Behavioral", status: "Invite Sent", addedAt: "Feb 15, 2024" },
  };

  const csvRows = ids
    .filter((id) => mockData[id])
    .map((id) => {
      const row = mockData[id]!;
      return [id, row.name, row.organization, row.status, row.addedAt].join(",");
    });

  return [headers.join(","), ...csvRows].join("\n");
}
