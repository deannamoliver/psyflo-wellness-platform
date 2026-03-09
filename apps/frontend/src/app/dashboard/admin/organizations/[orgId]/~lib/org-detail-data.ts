export type OrgDetail = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  status: "Active" | "Suspended" | "Onboarding" | "Archived";
  type: string;
  districtCode: string;
  timeZone: string;
  phone: string;
  website: string;
  domain: string;
  address: string[];
  contacts: {
    role: string;
    name: string;
    title: string;
    email: string;
    phone: string;
  }[];
  locations: Location[];
};

export type Location = {
  id: string;
  code: string;
  name: string;
  gradeLevels: string;
  students: number;
  status: "Active" | "Inactive";
  contactName: string;
  contactEmail: string;
};
