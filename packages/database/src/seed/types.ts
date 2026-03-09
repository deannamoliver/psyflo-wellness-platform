/**
 * Seed data types
 *
 * This file contains all shared types extracted from helpers.ts and new types
 * for the constraint-based scenario system.
 */

// ============================================================================
// TEST SCENARIO TYPES (Extracted from helpers.ts)
// ============================================================================

/**
 * Universal emotions (top-level mood categories)
 */
export type UniversalEmotion =
  | "happy"
  | "sad"
  | "afraid"
  | "angry"
  | "disgusted"
  | "surprised"
  | "bad";

/**
 * Specific emotions (detailed emotions within each universal category)
 */
export type SpecificEmotion =
  // happy
  | "playful"
  | "joyful"
  | "curious"
  | "confident"
  | "valued"
  | "creative"
  | "peaceful"
  | "hopeful"
  // sad
  | "lonely"
  | "left_out"
  | "guilty"
  | "embarrassed"
  | "empty"
  | "hurt"
  | "let_down"
  // afraid
  | "scared"
  | "nervous"
  | "worried"
  | "insecure"
  | "powerless"
  | "threatened"
  // angry
  | "disrespected"
  | "holding_a_grudge"
  | "mad"
  | "jealous"
  | "aggressive"
  | "frustrated"
  | "annoyed"
  // disgusted
  | "grossed_out"
  | "horrified"
  | "disapproving"
  | "disappointed"
  | "offended"
  // surprised
  | "excited"
  | "shocked"
  | "amazed"
  | "confused"
  | "startled"
  | "anxious"
  // bad
  | "blah"
  | "tired"
  | "stressed"
  | "bored"
  | "overwhelmed"
  | "distracted"
  | "excluded";

/**
 * SEL domain subtype (for skill development data)
 */
export type SELSubtype =
  | "sel_self_awareness_self_concept"
  | "sel_self_awareness_emotion_knowledge"
  | "sel_social_awareness"
  | "sel_self_management_emotion_regulation"
  | "sel_self_management_goal_management"
  | "sel_self_management_school_work"
  | "sel_relationship_skills"
  | "sel_responsible_decision_making";

/**
 * Configuration for a single test scenario
 */
export type TestScenario = {
  // Student information
  student: {
    firstName: string;
    lastName: string;
    grade: number; // 8-12
    age: number; // For screener age requirements (11-18)
  };
  // Mood check-ins for this student (to populate wellness dashboard)
  moodCheckIns?: Array<{
    universalEmotion: UniversalEmotion;
    specificEmotion: SpecificEmotion;
    createdAt?: Date; // Defaults to today
  }>;
  // SEL screeners for skill development (can have multiple over time)
  selScreeners?: Array<{
    completedAt?: Date; // Defaults to 2 weeks ago
    // Target scores for each domain (1-4 scale, will be averaged)
    domainScores: {
      sel_self_awareness_self_concept?: number;
      sel_self_awareness_emotion_knowledge?: number;
      sel_social_awareness?: number;
      sel_self_management_emotion_regulation?: number;
      sel_self_management_goal_management?: number;
      sel_self_management_school_work?: number;
      sel_relationship_skills?: number;
      sel_responsible_decision_making?: number;
    };
  }>;
  // Optional: active wellness coach conversation (shows in counselor "Active Conversations")
  activeWellnessConversation?: {
    topic: string;
    reason: string;
    status: "accepted" | "in_progress";
    /** If "student", shows "Needs Coach Reply". If "coach", shows "Waiting on Student". */
    lastMessageFrom: "student" | "coach";
    coachGreeting?: string;
    studentReply?: string;
  };
  // Therapist referral (optional - creates a referral for this student)
  therapistReferral?: {
    reason:
      | "anxiety"
      | "depression"
      | "trauma"
      | "behavioral"
      | "family_issues"
      | "grief_loss"
      | "self_harm"
      | "substance_use"
      | "other";
    serviceTypes: (
      | "individual_therapy"
      | "family_therapy"
      | "psychiatric_services"
    )[];
    additionalContext?: string;
    urgency: "routine" | "urgent";
    insuranceStatus?: "has_insurance" | "uninsured" | "unknown";
    status?:
      | "submitted"
      | "in_progress"
      | "matched"
      | "completed"
      | "cancelled";
    createdAt?: Date;
  };
  // Multiple alerts per student (for testing bulk actions)
  alerts: Array<{
    // Optional screener that triggered this alert
    screener?: {
      type: "phq_a" | "phq_9" | "gad_child" | "gad_7";
      targetScore: number; // We'll generate responses to achieve this score
      completedAt?: Date; // Defaults to 1 day ago
      // Optional: Specify exact answers for specific questions (e.g., question 9 for safety)
      specificAnswers?: Array<{ questionCode: string; answerCode: string }>;
    };
    // Alert configuration (optional - for students with screeners but no alerts)
    alert?: {
      type:
        | "depression"
        | "anxiety"
        | "safety"
        | "abuse_neglect"
        | "harm_to_others";
      source: "screener" | "chat" | "coach";
      status: "new" | "in_progress" | "resolved";
      createdAt?: Date; // Defaults to 1 day ago
      // Timeline entries for this alert
      timeline: Array<{
        type:
          | "alert_generated"
          | "emergency_action"
          | "note_added"
          | "status_changed";
        description: string;
        createdAt?: Date; // Defaults to sequence within the day
        // Type-specific data
        action?:
          | "contacted_988"
          | "notified_staff"
          | "contacted_parents"
          | "triggered_gad7"
          | "triggered_phq9"
          | "emergency_services_contacted"
          | "cps_notified"
          | "assessment_performed";
        noteContent?: string; // For note_added type
        statusChange?: {
          from: "new" | "in_progress" | "resolved";
          to: "new" | "in_progress" | "resolved";
        }; // For status_changed type
      }>;
      // Chat alert data (required when source is "chat")
      chatAlert?: {
        triggeringStatement: string;
        conversationContext: string; // JSON string of conversation history
        shutdownRiskType?:
          | "direct"
          | "indirect"
          | "ambiguous"
          | "harm_to_others"
          | "abuse_neglect";
        isShutdown?: boolean;
        cssrState?: Record<string, unknown>;
        clarificationResponses?: Record<string, unknown>;
      };
    };
  }>;
};

// ============================================================================
// NEW TYPES FOR CONSTRAINT-BASED SYSTEM
// ============================================================================

// Screener type enum
export type ScreenerType = "phq_a" | "phq_9" | "gad_child" | "gad_7";

// Alert type enum
export type AlertType =
  | "depression"
  | "anxiety"
  | "safety"
  | "abuse_neglect"
  | "harm_to_others";

// Alert status enum
export type AlertStatus = "new" | "in_progress" | "resolved";

// Alert source enum
export type AlertSource = "screener" | "chat" | "coach";

// TODO: Add more types as needed in Phase 2
