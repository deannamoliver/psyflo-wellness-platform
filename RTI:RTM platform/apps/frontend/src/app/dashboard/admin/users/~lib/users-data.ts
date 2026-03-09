export type UserRole =
  | "Super Admin"
  | "Clinical Supervisor"
  | "Provider"
  | "Therapist";

export type UserStatus = "Active" | "Inactive" | "Suspended";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string | null;
  locations: string[];
  status: UserStatus;
  createdAt: Date;
};

export type UserStats = {
  total: number;
  superAdmins: number;
  clinicalSupervisors: number;
  providers: number;
  therapists: number;
};

export type UsersPageData = {
  users: AdminUser[];
  orgs: string[];
  stats: UserStats;
};

export const ROLE_OPTIONS: UserRole[] = [
  "Super Admin",
  "Clinical Supervisor",
  "Provider",
  "Therapist",
];

export const STATUS_OPTIONS: UserStatus[] = ["Active", "Inactive", "Suspended"];

export const ROLE_BADGE_CONFIG: Record<
  UserRole,
  { bg: string; text: string; icon: string }
> = {
  "Super Admin": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: "shield",
  },
  "Clinical Supervisor": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "user-cog",
  },
  Provider: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    icon: "user",
  },
  Therapist: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "headphones",
  },
};

export const STATUS_BADGE_CONFIG: Record<
  UserStatus,
  { bg: string; text: string }
> = {
  Active: { bg: "bg-green-50", text: "text-green-600" },
  Inactive: { bg: "bg-gray-100", text: "text-gray-500" },
  Suspended: { bg: "bg-red-100", text: "text-red-600" },
};
