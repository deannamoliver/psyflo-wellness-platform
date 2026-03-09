/**
 * Exercise System Types
 * Foundation types for all exercise configurations and responses.
 */

// ─── Intervention Types ──────────────────────────────────────────────

export type InterventionType = "checklist" | "tracker" | "exercise" | "worksheet" | "psychoed";

// ─── Base Config Fields ──────────────────────────────────────────────

export interface BaseExerciseConfig {
  id: string;
  type: InterventionType;
  title: string;
  subtitle?: string;
  description: string;
  estimatedMinutes?: number;
  completionMessage?: string;
  applicableCodes: string[]; // ICD-10 prefixes this exercise applies to
}

// ─── Checklist Types ─────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  helpText?: string;
}

export interface ChecklistConfig extends BaseExerciseConfig {
  type: "checklist";
  items: ChecklistItem[];
  requireAll?: boolean; // Must check all items to complete
  allowPartialSave?: boolean;
}

// ─── Tracker Types ───────────────────────────────────────────────────

export type TrackerFieldType = 
  | "likert" 
  | "number" 
  | "text" 
  | "select" 
  | "multiselect" 
  | "time" 
  | "duration";

export interface TrackerFieldOption {
  value: string;
  label: string;
}

export interface TrackerField {
  id: string;
  label: string;
  type: TrackerFieldType;
  required?: boolean;
  helpText?: string;
  // Likert-specific
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  // Number-specific
  unit?: string;
  step?: number;
  // Select/multiselect-specific
  options?: TrackerFieldOption[];
  // Validation
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface TrackerAlertRule {
  fieldId: string;
  condition: "gte" | "lte" | "eq" | "contains";
  value: number | string;
  severity: "warning" | "critical";
  message: string;
  notifyClinician?: boolean;
}

export interface TrackerConfig extends BaseExerciseConfig {
  type: "tracker";
  fields: TrackerField[];
  frequency: "daily" | "weekly" | "per-session" | "custom";
  showTrend?: boolean; // Display historical chart
  showStreak?: boolean; // Display streak counter
  alertRules?: TrackerAlertRule[];
  scoringFunction?: string; // Name of scoring function to apply (e.g., "phq9", "gad7")
}

// ─── Exercise Types (CBT/DBT structured exercises) ───────────────────

export type ExerciseStepType = 
  | "instruction" 
  | "text-input" 
  | "likert" 
  | "select" 
  | "reflection" 
  | "summary"
  | "breathing-pacer"
  | "timer"
  | "emotion-picker"
  | "suds";

export interface ExerciseStepBase {
  id: string;
  type: ExerciseStepType;
  label?: string;
  helpText?: string;
  required?: boolean;
}

export interface InstructionStep extends ExerciseStepBase {
  type: "instruction";
  content: string; // Markdown content
}

export interface TextInputStep extends ExerciseStepBase {
  type: "text-input";
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export interface LikertStep extends ExerciseStepBase {
  type: "likert";
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface SelectStep extends ExerciseStepBase {
  type: "select";
  options: TrackerFieldOption[];
  allowMultiple?: boolean;
}

export interface ReflectionStep extends ExerciseStepBase {
  type: "reflection";
  prompt: string;
  previousStepRef?: string; // Reference to compare with earlier response
}

export interface SummaryStep extends ExerciseStepBase {
  type: "summary";
  template: string; // Template with {{fieldId}} placeholders
}

export interface BreathingPacerStep extends ExerciseStepBase {
  type: "breathing-pacer";
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  cycles?: number;
}

export interface TimerStep extends ExerciseStepBase {
  type: "timer";
  durationSeconds: number;
  timerLabel?: string;
}

export interface EmotionPickerStep extends ExerciseStepBase {
  type: "emotion-picker";
}

export interface SUDSStep extends ExerciseStepBase {
  type: "suds";
  sudsLabel?: string;
}

export type ExerciseStep = 
  | InstructionStep 
  | TextInputStep 
  | LikertStep 
  | SelectStep 
  | ReflectionStep 
  | SummaryStep
  | BreathingPacerStep
  | TimerStep
  | EmotionPickerStep
  | SUDSStep;

export interface ExerciseConfig extends BaseExerciseConfig {
  type: "exercise";
  steps: ExerciseStep[];
  allowBackNavigation?: boolean;
  showProgressBar?: boolean;
}

// ─── Worksheet Types ─────────────────────────────────────────────────

export type WorksheetSectionType = 
  | "header" 
  | "text-field" 
  | "table" 
  | "rating-row" 
  | "before-after";

export interface WorksheetSectionBase {
  id: string;
  type: WorksheetSectionType;
  label?: string;
}

export interface HeaderSection extends WorksheetSectionBase {
  type: "header";
  content: string;
  level?: 1 | 2 | 3;
}

export interface TextFieldSection extends WorksheetSectionBase {
  type: "text-field";
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  helpText?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  type: "text" | "number" | "select" | "likert";
  options?: TrackerFieldOption[];
  width?: string;
}

export interface TableSection extends WorksheetSectionBase {
  type: "table";
  columns: TableColumn[];
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
}

export interface RatingRowSection extends WorksheetSectionBase {
  type: "rating-row";
  items: { id: string; label: string }[];
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface BeforeAfterSection extends WorksheetSectionBase {
  type: "before-after";
  beforeLabel?: string;
  afterLabel?: string;
  ratingScale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
}

export type WorksheetSection = 
  | HeaderSection 
  | TextFieldSection 
  | TableSection 
  | RatingRowSection 
  | BeforeAfterSection;

export interface WorksheetConfig extends BaseExerciseConfig {
  type: "worksheet";
  sections: WorksheetSection[];
  printable?: boolean;
  clinicianReviewRequired?: boolean;
}

// ─── Psychoeducation Types ───────────────────────────────────────────

export type PsychoedContentType = 
  | "text" 
  | "video" 
  | "image" 
  | "interactive" 
  | "quiz";

export interface PsychoedSlideBase {
  id: string;
  type: PsychoedContentType;
  title?: string;
}

export interface TextSlide extends PsychoedSlideBase {
  type: "text";
  content: string; // Markdown
}

export interface VideoSlide extends PsychoedSlideBase {
  type: "video";
  videoUrl: string;
  duration?: number; // seconds
  transcript?: string;
}

export interface ImageSlide extends PsychoedSlideBase {
  type: "image";
  imageUrl: string;
  altText: string;
  caption?: string;
}

export interface InteractiveSlide extends PsychoedSlideBase {
  type: "interactive";
  interactionType: "drag-drop" | "matching" | "sorting" | "cbt-triangle" | "anxiety-cycle";
  config?: Record<string, unknown>; // Type-specific config
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; correct?: boolean }[];
  explanation?: string;
}

export interface QuizSlide extends PsychoedSlideBase {
  type: "quiz";
  questions: QuizQuestion[];
  passingScore?: number; // Percentage
  showCorrectAnswers?: boolean;
}

export type PsychoedSlide = 
  | TextSlide 
  | VideoSlide 
  | ImageSlide 
  | InteractiveSlide 
  | QuizSlide;

export interface PsychoedConfig extends BaseExerciseConfig {
  type: "psychoed";
  slides: PsychoedSlide[];
  allowSkip?: boolean;
  trackCompletion?: boolean;
  certificateOnCompletion?: boolean;
}

// ─── Union Type for All Configs ──────────────────────────────────────

export type AnyExerciseConfig = 
  | ChecklistConfig 
  | TrackerConfig 
  | ExerciseConfig 
  | WorksheetConfig 
  | PsychoedConfig;

// ─── Exercise Response Types ─────────────────────────────────────────

export type ResponseStatus = "draft" | "saved" | "completed";

export interface ExerciseResponse {
  id: string;
  exerciseId: string; // References the exercise config ID
  assignmentId: string; // References the assigned exercise instance
  patientId: string;
  clinicianId: string;
  status: ResponseStatus;
  responses: Record<string, unknown>; // Field ID -> value mapping
  startedAt: string; // ISO timestamp
  savedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  // Scoring results (for trackers with scoring functions)
  score?: {
    total: number;
    interpretation?: string;
    subscores?: Record<string, number>;
    flags?: string[]; // e.g., "suicidal_ideation"
  };
  // Clinician notes (for reviewed responses)
  clinicianNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ─── Exercise Assignment Types ───────────────────────────────────────

export interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  patientId: string;
  clinicianId: string;
  treatmentPlanId?: string;
  assignedAt: string;
  dueDate?: string;
  frequency?: string;
  status: "active" | "paused" | "completed" | "cancelled";
  completedAt?: string;
  notes?: string;
}

// ─── Scoring Types ───────────────────────────────────────────────────

export interface ScoringResult {
  total: number;
  interpretation: string;
  severity?: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  subscores?: Record<string, number>;
  flags?: string[];
  recommendations?: string[];
}

export type ScoringFunction = (responses: Record<string, string | number>) => ScoringResult;

// ─── Alert Types ─────────────────────────────────────────────────────

export interface ClinicalAlertData {
  id: string;
  patientId: string;
  exerciseId: string;
  responseId: string;
  severity: "warning" | "critical";
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}
