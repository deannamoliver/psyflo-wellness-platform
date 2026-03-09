export type OrgType = "Private Practice" | "Group Practice" | "Clinic" | "CBO";
export type OrgStatus = "Active" | "Suspended" | "Onboarding" | "Archived";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  location: string;
  locationCount: number;
  students: number;
  status: OrgStatus;
};

export const TYPE_OPTIONS: OrgType[] = ["Private Practice", "Group Practice", "Clinic", "CBO"];
export const STATUS_OPTIONS: OrgStatus[] = [
  "Active",
  "Suspended",
  "Onboarding",
  "Archived",
];

export const TYPE_BADGE_COLORS: Record<OrgType, { bg: string; text: string }> =
  {
    "Private Practice": { bg: "bg-green-100", text: "text-green-700" },
    "Group Practice": { bg: "bg-blue-100", text: "text-blue-700" },
    Clinic: { bg: "bg-teal-100", text: "text-teal-700" },
    CBO: { bg: "bg-amber-100", text: "text-amber-700" },
  };

export const STATUS_BADGE_COLORS: Record<
  OrgStatus,
  { bg: string; text: string }
> = {
  Active: { bg: "bg-green-100", text: "text-green-700" },
  Suspended: { bg: "bg-red-100", text: "text-red-600" },
  Onboarding: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Archived: { bg: "bg-gray-100", text: "text-gray-500" },
};
