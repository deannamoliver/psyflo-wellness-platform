export type OrgType = "private_practice" | "group_practice" | "hospital_system" | "community_health" | "academic_medical" | "other";

export type OrgSpecialty = "mental_health" | "primary_care" | "pediatrics" | "substance_abuse" | "multi_specialty" | "other";

export type ContactInfo = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
};

let contactIdCounter = 0;
export function createContact(): ContactInfo {
  contactIdCounter += 1;
  return {
    id: `contact-${contactIdCounter}`,
    name: "",
    title: "",
    email: "",
    phone: "",
  };
}

export type OrgFormData = {
  type: OrgType | "";
  specialty: OrgSpecialty | "";
  legalName: string;
  dba: string;
  taxId: string;
  npi: string;
  ratePerPatient: number;
  streetAddress: string;
  streetAddress2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  timezone: string;
  website: string;
  phone: string;
  emailDomain: string;
  adminContact: ContactInfo;
  billingContact: ContactInfo;
  billingSameAsAdmin: boolean;
  technicalContact: ContactInfo;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingEmail: string;
  billingPhone: string;
  documents: { name: string; type: string; uploadedAt: string }[];
  status: "active" | "archived";
  internalNotes: string;
  additionalContacts: ContactInfo[];
};

export const EMPTY_CONTACT: ContactInfo = {
  id: "admin",
  name: "",
  title: "",
  email: "",
  phone: "",
};

export const INITIAL_FORM_DATA: OrgFormData = {
  type: "",
  specialty: "",
  legalName: "",
  dba: "",
  taxId: "",
  npi: "",
  ratePerPatient: 25,
  streetAddress: "",
  streetAddress2: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  timezone: "",
  website: "",
  phone: "",
  emailDomain: "",
  adminContact: { ...EMPTY_CONTACT, id: "admin" },
  billingContact: { ...EMPTY_CONTACT, id: "billing" },
  billingSameAsAdmin: false,
  technicalContact: { ...EMPTY_CONTACT, id: "technical" },
  billingAddress: "",
  billingCity: "",
  billingState: "",
  billingZipCode: "",
  billingEmail: "",
  billingPhone: "",
  documents: [],
  status: "active",
  internalNotes: "",
  additionalContacts: [createContact()],
};

export const TIMEZONE_OPTIONS = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT) – UTC-8" },
  { value: "America/Denver", label: "Mountain Time (MT) – UTC-7" },
  { value: "America/Chicago", label: "Central Time (CT) – UTC-6" },
  { value: "America/New_York", label: "Eastern Time (ET) – UTC-5" },
  { value: "America/Anchorage", label: "Alaska Time (AKT) – UTC-9" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT) – UTC-10" },
];

export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Inactive" },
];
