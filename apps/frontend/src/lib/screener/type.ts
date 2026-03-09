export const riskLevels = [0, 1, 2, 3, 4, 5] as const;

export type RiskLevel = (typeof riskLevels)[number];
