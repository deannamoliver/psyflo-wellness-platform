export type StudentStatus = "Active" | "Blocked" | "Archived";

export type Student = {
  id: string;
  studentId: string;
  name: string;
  school: string;
  district: string;
  grade: string;
  status: StudentStatus;
  createdDate: string;
};

export type BlockedStudent = {
  id: string;
  name: string;
  school: string;
  grade: string;
  blockedAgo: string;
  reason: string;
};

export type StudentStats = {
  total: number;
  active: number;
  blocked: number;
  archived: number;
};

export type StudentsPageData = {
  students: Student[];
  blockedStudents: BlockedStudent[];
  stats: StudentStats;
  schools: string[];
  districts: string[];
};

export const GRADE_OPTIONS = [
  "K",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

export const STATUS_OPTIONS: StudentStatus[] = [
  "Active",
  "Blocked",
  "Archived",
];

export type SortColumn =
  | "name"
  | "school"
  | "district"
  | "grade"
  | "status"
  | "createdDate";

export type SortDirection = "asc" | "desc";

export type SortState = { column: SortColumn; direction: SortDirection } | null;

export const SORT_OPTIONS = [
  { value: "recently-added", label: "Recently Added" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

export const STATUS_BADGE_COLORS: Record<
  StudentStatus,
  { bg: string; text: string }
> = {
  Active: { bg: "bg-green-100", text: "text-green-700" },
  Blocked: { bg: "bg-red-100", text: "text-red-600" },
  Archived: { bg: "bg-gray-100", text: "text-gray-600" },
};
