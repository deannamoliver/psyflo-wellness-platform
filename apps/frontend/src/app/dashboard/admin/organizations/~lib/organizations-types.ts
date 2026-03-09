export type OrgType = "Private Practice" | "Group Practice" | "Hospital System" | "Community Health" | "Academic Medical" | "Other";
export type OrgStatus = "Active" | "Inactive" | "Onboarding";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  location: string;
  locationCount: number;
  students: number;
  status: OrgStatus;
  ratePerPatient?: number;
};

export const TYPE_OPTIONS: OrgType[] = ["Private Practice", "Group Practice", "Hospital System", "Community Health", "Academic Medical", "Other"];
export const STATUS_OPTIONS: OrgStatus[] = [
  "Active",
  "Inactive",
  "Onboarding",
];

export const TYPE_BADGE_COLORS: Record<OrgType, { bg: string; text: string }> =
  {
    "Private Practice": { bg: "bg-blue-100", text: "text-blue-700" },
    "Group Practice": { bg: "bg-purple-100", text: "text-purple-700" },
    "Hospital System": { bg: "bg-red-100", text: "text-red-700" },
    "Community Health": { bg: "bg-green-100", text: "text-green-700" },
    "Academic Medical": { bg: "bg-amber-100", text: "text-amber-700" },
    "Other": { bg: "bg-gray-100", text: "text-gray-700" },
  };

export const STATUS_BADGE_COLORS: Record<
  OrgStatus,
  { bg: string; text: string }
> = {
  Active: { bg: "bg-green-100", text: "text-green-700" },
  Inactive: { bg: "bg-gray-100", text: "text-gray-500" },
  Onboarding: { bg: "bg-yellow-100", text: "text-yellow-700" },
};
