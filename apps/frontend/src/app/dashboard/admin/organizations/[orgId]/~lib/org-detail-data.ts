export type OrgContact = {
  role: string;
  name: string;
  title: string;
  email: string;
  phone: string;
};

export type OrgDocument = {
  name: string;
  type: string;
  uploadedAt: string;
};

export type OrgDetail = {
  id: string;
  name: string;
  legalName?: string;
  dba?: string;
  code: string;
  createdAt: string;
  status: "Active" | "Inactive" | "Onboarding";
  type: string;
  specialty?: string;
  taxId?: string;
  npi?: string;
  districtCode: string;
  timeZone: string;
  phone: string;
  website: string;
  domain: string;
  address: string[];
  ratePerPatient?: number;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string[];
  internalNotes?: string;
  documents?: OrgDocument[];
  adminContact?: OrgContact;
  billingContact?: OrgContact;
  technicalContact?: OrgContact;
  contacts: OrgContact[];
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
