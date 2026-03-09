export type SafetyWorkflowStep =
  | "danger"
  | "type"
  | "assess"
  | "level"
  | "act"
  | "document"
  | "send"
  | "return";

export type DangerLevel = "immediate_yes" | "immediate_no";

export type ConcernType =
  | "harm_to_self"
  | "harm_to_others"
  | "abuse_neglect"
  | "other_safety";

export type AssessHarmSelfData = {
  disclosures: string[];
  cssrAnswers: Record<string, boolean | null>;
};

export type AssessHarmOthersData = {
  whatHappened: string[];
  coOccurrence: string[];
  questions: Record<string, boolean | null>;
};

export type AssessAbuseNeglectData = {
  abuseTypes: string[];
  involvedPersons: string[];
  perpetratorName: string;
  perpetratorRelationship: string;
  safeGoingHome: string | null;
};

export type AssessOtherSafetyData = {
  concerns: string[];
  situationDescription: string;
};

export type RiskLevel = "emergency" | "high" | "moderate" | "low";

export type SafetyPlanData = {
  warningSigns: string;
  copingStrategies: string;
  peopleTalkTo: string;
  adultsHelp: string;
  professionalResources: string;
  environmentSafe: string;
  reasonsToLive: string;
};

export type EmergencyContactInfo = {
  id: string;
  name: string;
  relation: string;
  contactType: "home" | "school";
  tag: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  primaryEmail: string | null;
  secondaryEmail: string | null;
};

export type EmergencyServicesAction = {
  status: "called" | "not_needed" | null;
  timeCalled: string;
  infoProvided: string[];
  additionalNotes: string;
  complete: boolean;
};

export type NotifySchoolAction = {
  selectedContact: string;
  notificationMethod: "phone" | "email" | "in_person" | null;
  timeNotified: string;
  infoProvided: string[];
  parentNotificationProtocol: "school_will_notify" | "i_will_notify" | null;
  contactResult: "reached" | "left_message" | "no_answer" | null;
  briefSummary: string;
  adminResponse: string;
  complete: boolean;
};

export type NotifyParentAction = {
  notificationMethod: "phone" | "email" | "in_person" | null;
  timeOfContact: string;
  contactResult:
    | "reached"
    | "left_message"
    | "no_answer"
    | "na_school_handles"
    | null;
  infoProvided: string[];
  conversationNotes: string;
  complete: boolean;
};

export type ContinueConversationAction = {
  conversationNotes: string;
  complete: boolean;
};

export type EmergencyActionsData = {
  emergencyServices: EmergencyServicesAction;
  notifySchool: NotifySchoolAction;
  notifyParent: NotifyParentAction;
  continueConversation: ContinueConversationAction;
};

export type DocEmergencyServicesSection = {
  enabled: boolean;
  serviceCalled: string | null;
  timeCalled: string;
  details: string;
  outcome: string | null;
  completed: boolean;
};

export type DocAssessmentSection = {
  enabled: boolean;
  completed: boolean;
};

export type DocSchoolNotifiedSection = {
  enabled: boolean;
  whoNotified: string;
  method: string | null;
  timeNotified: string;
  outcome: string | null;
  notes: string;
  additionalDetails: string;
  completed: boolean;
};

export type DocParentGuardianSection = {
  enabled: boolean;
  relationship: string | null;
  nameContact: string;
  contactMethod: string | null;
  timeContacted: string;
  result: string | null;
  notes: string;
  parentResponse: string;
  completed: boolean;
};

export type DocCpsSection = {
  enabled: boolean;
  dateReported: string;
  timeReported: string;
  reportCaseNumber: string;
  typeOfConcern: string | null;
  nextSteps: string;
  cpsResponse: string;
  completed: boolean;
};

export type DocumentData = {
  situationSummary: string;
  studentStatement: string;
  emergencyServices: DocEmergencyServicesSection;
  assessment: DocAssessmentSection;
  schoolNotified: DocSchoolNotifiedSection;
  parentGuardian: DocParentGuardianSection;
  cps: DocCpsSection;
};

export const EMPTY_DOCUMENT_DATA: DocumentData = {
  situationSummary: "",
  studentStatement: "",
  emergencyServices: {
    enabled: false,
    serviceCalled: null,
    timeCalled: "",
    details: "",
    outcome: null,
    completed: false,
  },
  assessment: {
    enabled: false,
    completed: false,
  },
  schoolNotified: {
    enabled: false,
    whoNotified: "",
    method: null,
    timeNotified: "",
    outcome: null,
    notes: "",
    additionalDetails: "",
    completed: false,
  },
  parentGuardian: {
    enabled: false,
    relationship: null,
    nameContact: "",
    contactMethod: null,
    timeContacted: "",
    result: null,
    notes: "",
    parentResponse: "",
    completed: false,
  },
  cps: {
    enabled: false,
    dateReported: "",
    timeReported: "",
    reportCaseNumber: "",
    typeOfConcern: null,
    nextSteps: "",
    cpsResponse: "",
    completed: false,
  },
};

export type SafetyWorkflowData = {
  id: string;
  handoffId: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  schoolId: string | null;
  status: "active" | "completed" | "cancelled";
  isDuringSchoolHours: boolean;
  activatedAt: string;
  immediateDanger: boolean | null;
  concernType: ConcernType | null;
  assessmentData: Record<string, unknown> | null;
  riskLevel: RiskLevel | null;
  professionalJudgment: string | null;
  actData: Record<string, unknown> | null;
};

export type SchoolHoursInfo = {
  isDuringSchoolHours: boolean;
  timezone: string;
};

export const EMPTY_HARM_SELF: AssessHarmSelfData = {
  disclosures: [],
  cssrAnswers: {},
};

export const EMPTY_HARM_OTHERS: AssessHarmOthersData = {
  whatHappened: [],
  coOccurrence: [],
  questions: {},
};

export const EMPTY_ABUSE_NEGLECT: AssessAbuseNeglectData = {
  abuseTypes: [],
  involvedPersons: [],
  perpetratorName: "",
  perpetratorRelationship: "",
  safeGoingHome: null,
};

export const EMPTY_OTHER_SAFETY: AssessOtherSafetyData = {
  concerns: [],
  situationDescription: "",
};

export const EMPTY_SAFETY_PLAN: SafetyPlanData = {
  warningSigns: "",
  copingStrategies: "",
  peopleTalkTo: "",
  adultsHelp: "",
  professionalResources: "",
  environmentSafe: "",
  reasonsToLive: "",
};

export const EMPTY_EMERGENCY_SERVICES: EmergencyServicesAction = {
  status: null,
  timeCalled: "",
  infoProvided: [],
  additionalNotes: "",
  complete: false,
};

export const EMPTY_NOTIFY_SCHOOL: NotifySchoolAction = {
  selectedContact: "",
  notificationMethod: null,
  timeNotified: "",
  infoProvided: [],
  parentNotificationProtocol: null,
  contactResult: null,
  briefSummary: "",
  adminResponse: "",
  complete: false,
};

export const EMPTY_NOTIFY_PARENT: NotifyParentAction = {
  notificationMethod: null,
  timeOfContact: "",
  contactResult: null,
  infoProvided: [],
  conversationNotes: "",
  complete: false,
};

export const EMPTY_CONTINUE_CONVERSATION: ContinueConversationAction = {
  conversationNotes: "",
  complete: false,
};

export const EMPTY_EMERGENCY_ACTIONS: EmergencyActionsData = {
  emergencyServices: EMPTY_EMERGENCY_SERVICES,
  notifySchool: EMPTY_NOTIFY_SCHOOL,
  notifyParent: EMPTY_NOTIFY_PARENT,
  continueConversation: EMPTY_CONTINUE_CONVERSATION,
};

export const CONCERN_TYPE_LABELS: Record<ConcernType, string> = {
  harm_to_self: "HARM TO SELF",
  harm_to_others: "HARM TO OTHERS",
  abuse_neglect: "ABUSE / NEGLECT",
  other_safety: "OTHER SAFETY CONCERN",
};

export const STEP_LABELS: Record<SafetyWorkflowStep, string> = {
  danger: "Danger",
  type: "Type",
  assess: "Assess",
  level: "Level",
  act: "Act",
  document: "Document",
  send: "Send",
  return: "Return",
};

export const ORDERED_STEPS: SafetyWorkflowStep[] = [
  "danger",
  "type",
  "assess",
  "level",
  "act",
  "document",
  "send",
  "return",
];
