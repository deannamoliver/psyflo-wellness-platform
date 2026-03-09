export const REQUIRED_COLUMNS = ["email", "first_name", "last_name"] as const;

export const GENDER_VALUES = [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_answer",
] as const;
export const PRONOUN_VALUES = [
  "he/him",
  "she/her",
  "they/them",
  "prefer_not_to_answer",
] as const;
export const LANGUAGE_VALUES = [
  "english",
  "spanish",
  "french",
  "chinese_simplified",
  "arabic",
  "haitian_creole",
  "bengali",
  "russian",
  "urdu",
  "vietnamese",
  "portuguese",
] as const;
export const ETHNICITY_VALUES = [
  "american_indian_or_alaska_native",
  "asian",
  "black_or_african_american",
  "hispanic_or_latino",
  "middle_eastern_or_north_african",
  "native_hawaiian_or_pacific_islander",
  "white",
  "prefer_not_to_answer",
] as const;
export const INTEREST_VALUES = [
  "gaming",
  "sports",
  "art",
  "music",
  "reading",
  "fashion",
  "social-media",
  "movies",
  "outdoors",
  "tech",
  "science",
  "travel",
  "chilling",
] as const;
export const LEARNING_STYLE_VALUES = [
  "reading",
  "watching-videos",
  "listening-audio",
  "taking-notes",
  "hands-on",
  "talking-through",
  "interactive-tools",
] as const;
export const GOAL_VALUES = [
  "school-performance",
  "making-friends",
  "emotional-wellbeing",
  "health-fitness",
  "confidence",
  "new-experiences",
  "life-balance",
  "something-else",
] as const;
export const ACCOUNT_STATUS_VALUES = ["active", "blocked", "archived"] as const;

export const CONTACT_PREFIXES = ["primary", "backup_1", "backup_2"] as const;
export const CONTACT_FIELDS = [
  "contact_name",
  "contact_relation",
  "contact_primary_phone",
  "contact_secondary_phone",
  "contact_primary_email",
  "contact_secondary_email",
] as const;

export type ImportContactData = Record<string, string>;

export type ImportRow = {
  email: string;
  first_name: string;
  last_name: string;
  student_code?: string;
  grade?: number;
  date_of_birth?: string;
  gender?: string;
  pronouns?: string;
  language?: string;
  ethnicity?: string;
  phone?: string;
  home_address?: string;
  internal_notes?: string;
  interests?: string[];
  learning_styles?: string[];
  goals?: string[];
  account_status?: string;
  contacts: ImportContactData;
};

export type RowError = { row: number; field: string; message: string };
export type ParseResult = { rows: ImportRow[]; errors: RowError[] };
