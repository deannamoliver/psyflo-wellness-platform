export type RiskAssessment = {
  id: string;
  riskValue: number;
  riskLevel: "low" | "medium" | "high";
  confidenceScore: number;
  keywords: string[];
};

export async function getRiskAssessment(): Promise<RiskAssessment> {
  return {
    id: "risk-assessment-1",
    riskValue: 80,
    riskLevel: "high",
    confidenceScore: 90,
    keywords: [
      "self-harm",
      "hopelessness",
      "isolation",
      "not wanting to be here",
    ],
  };
}
