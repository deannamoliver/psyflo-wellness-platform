type PermissionItem = {
  label: string;
  description: string;
  allowed: boolean;
};

export type RolePermConfig = {
  label: string;
  badgeBg: string;
  badgeText: string;
  allowedBg: string;
  allowedBorder: string;
  allowedIconBg: string;
  deniedBg: string;
  deniedBorder: string;
  permissions: PermissionItem[];
};

export const ROLE_PERMS: Record<string, RolePermConfig> = {
  "Super Admin": {
    label: "Super Admin Permissions",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    allowedBg: "bg-blue-50/60",
    allowedBorder: "border-blue-100",
    allowedIconBg: "bg-blue-500",
    deniedBg: "bg-red-50",
    deniedBorder: "border-red-100",
    permissions: [
      {
        label: "Full Platform Access",
        description: "Complete CRUD access to all system components",
        allowed: true,
      },
      {
        label: "Organization Management",
        description: "Full CRUD for all organizations and locations",
        allowed: true,
      },
      {
        label: "User Management",
        description: "Add, edit, deactivate users across all organizations",
        allowed: true,
      },
      {
        label: "Patient Management",
        description:
          "Add, edit, deactivate patient users across all organizations",
        allowed: true,
      },
      {
        label: "Safety Monitor & Conversations",
        description: "View all alerts and conversations, full access",
        allowed: true,
      },
      {
        label: "Referral Management",
        description: "View and edit all referral requests, full access",
        allowed: true,
      },
    ],
  },
  "Clinical Supervisor": {
    label: "Clinical Supervisor Permissions",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    allowedBg: "bg-blue-50/60",
    allowedBorder: "border-blue-100",
    allowedIconBg: "bg-blue-500",
    deniedBg: "bg-red-50",
    deniedBorder: "border-red-100",
    permissions: [
      {
        label: "View Organizations",
        description: "Read-only access to all organizations and locations",
        allowed: true,
      },
      {
        label: "View Users",
        description: "Read-only access to all user accounts",
        allowed: true,
      },
      {
        label: "Patient Management",
        description: "Update patient profile; no access to add or deactivate",
        allowed: true,
      },
      {
        label: "Safety Monitor & Conversations",
        description: "View all alerts and conversations, full access",
        allowed: true,
      },
      {
        label: "Referral Management",
        description: "View and edit all referral requests, full access",
        allowed: true,
      },
    ],
  },
  "Site Staff": {
    label: "Provider Permissions",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    allowedBg: "bg-green-50/60",
    allowedBorder: "border-green-100",
    allowedIconBg: "bg-green-500",
    deniedBg: "bg-red-50",
    deniedBorder: "border-red-100",
    permissions: [
      {
        label: "View All Patients",
        description: "Access to all patient profiles at assigned location(s)",
        allowed: true,
      },
      {
        label: "Safety Alert Management",
        description: "Receive, review, and resolve safety alerts",
        allowed: true,
      },
      {
        label: "Assessment Data",
        description: "View mental health assessments and trends",
        allowed: true,
      },
      {
        label: "Population Health Reports",
        description: "Access to aggregate data and analytics",
        allowed: true,
      },
      {
        label: "Conversation Access",
        description: "Cannot view or access patient-therapist conversations",
        allowed: false,
      },
    ],
  },
  Coach: {
    label: "Therapist Permissions",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    allowedBg: "bg-orange-50/60",
    allowedBorder: "border-orange-100",
    allowedIconBg: "bg-green-500",
    deniedBg: "bg-red-50",
    deniedBorder: "border-red-100",
    permissions: [
      {
        label: "Assigned Patient Access",
        description: "Full access to assigned patient caseload",
        allowed: true,
      },
      {
        label: "Safety Alert Submission",
        description: "Create and submit safety alerts to providers",
        allowed: true,
      },
      {
        label: "Conversation Management",
        description: "Chat with patients and manage conversations",
        allowed: true,
      },
      {
        label: "Treatment Plan & RTM Billing",
        description: "Manage treatment plans and review RTM billing reports",
        allowed: true,
      },
      {
        label: "Population Health Reports",
        description: "Access to aggregate data and analytics",
        allowed: false,
      },
    ],
  },
};
