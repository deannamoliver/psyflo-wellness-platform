import {
  ACCOUNT_STATUS_VALUES,
  CONTACT_FIELDS,
  CONTACT_PREFIXES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  GOAL_VALUES,
  type ImportRow,
  INTEREST_VALUES,
  LANGUAGE_VALUES,
  LEARNING_STYLE_VALUES,
  type ParseResult,
  PRONOUN_VALUES,
  REQUIRED_COLUMNS,
  type RowError,
} from "./import-csv-data";

export type { ImportRow, ParseResult, RowError } from "./import-csv-data";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else current += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else current += ch;
  }
  fields.push(current.trim());
  return fields;
}

function validateEnum(
  value: string,
  allowed: readonly string[],
  field: string,
  row: number,
  errors: RowError[],
): string | undefined {
  if (!value) return undefined;
  if (!allowed.includes(value)) {
    errors.push({ row, field, message: `Invalid value "${value}"` });
    return undefined;
  }
  return value;
}

function validateList(
  value: string,
  allowed: readonly string[],
  field: string,
  row: number,
  errors: RowError[],
): string[] | undefined {
  if (!value) return undefined;
  const items = value.split(",").map((s) => s.trim());
  const invalid = items.filter((i) => !allowed.includes(i));
  if (invalid.length > 0) {
    errors.push({ row, field, message: `Invalid: ${invalid.join(", ")}` });
    return undefined;
  }
  return items;
}

function validateRow(
  get: (col: string) => string,
  rowNum: number,
  rowErrors: RowError[],
) {
  const email = get("email").toLowerCase();
  const firstName = get("first_name");
  const lastName = get("last_name");
  if (!email)
    rowErrors.push({ row: rowNum, field: "email", message: "Required" });
  if (!firstName)
    rowErrors.push({ row: rowNum, field: "first_name", message: "Required" });
  if (!lastName)
    rowErrors.push({ row: rowNum, field: "last_name", message: "Required" });

  let grade: number | undefined;
  const gradeStr = get("grade");
  if (gradeStr) {
    const n = Number.parseInt(gradeStr, 10);
    if (Number.isNaN(n) || n < 0 || n > 12)
      rowErrors.push({ row: rowNum, field: "grade", message: "Must be 0-12" });
    else grade = n;
  }

  const dob = get("date_of_birth");
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob))
    rowErrors.push({
      row: rowNum,
      field: "date_of_birth",
      message: "Must be YYYY-MM-DD",
    });

  const v = (val: string, allowed: readonly string[], field: string) =>
    validateEnum(val, allowed, field, rowNum, rowErrors);
  const vl = (val: string, allowed: readonly string[], field: string) =>
    validateList(val, allowed, field, rowNum, rowErrors);

  return {
    email,
    first_name: firstName,
    last_name: lastName,
    grade,
    date_of_birth: dob || undefined,
    gender: v(get("gender"), GENDER_VALUES, "gender"),
    pronouns: v(get("pronouns"), PRONOUN_VALUES, "pronouns"),
    language: v(get("language"), LANGUAGE_VALUES, "language"),
    ethnicity: v(get("ethnicity"), ETHNICITY_VALUES, "ethnicity"),
    interests: vl(get("interests"), INTEREST_VALUES, "interests"),
    learning_styles: vl(
      get("learning_styles"),
      LEARNING_STYLE_VALUES,
      "learning_styles",
    ),
    goals: vl(get("goals"), GOAL_VALUES, "goals"),
    account_status: v(
      get("account_status"),
      ACCOUNT_STATUS_VALUES,
      "account_status",
    ),
  };
}

export function parseCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], errors: [] };

  const headerLine = lines[0];
  if (!headerLine) return { rows: [], errors: [] };
  const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase().trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        { row: 0, field: "headers", message: `Missing: ${missing.join(", ")}` },
      ],
    };
  }

  const rows: ImportRow[] = [];
  const errors: RowError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCsvLine(line);
    const get = (col: string) => values[headers.indexOf(col)] ?? "";
    const rowErrors: RowError[] = [];
    const validated = validateRow(get, i + 1, rowErrors);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    const contacts: Record<string, string> = {};
    for (const prefix of CONTACT_PREFIXES) {
      for (const field of CONTACT_FIELDS) {
        const key = `${prefix}_${field}`;
        const val = get(key);
        if (val) contacts[key] = val;
      }
    }

    const row: ImportRow = {
      ...validated,
      student_code: get("student_code") || undefined,
      phone: get("phone") || undefined,
      home_address: get("home_address") || undefined,
      internal_notes: get("internal_notes") || undefined,
      contacts,
    };

    rows.push(row);
  }

  return { rows, errors };
}
