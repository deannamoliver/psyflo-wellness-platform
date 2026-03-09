import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { PatternType } from "./constants";
import type { ClarificationResponses, CSSRState } from "./types";

export const ConversationState = Annotation.Root({
  // Built in messages array reducer
  ...MessagesAnnotation.spec,

  // Set on invocation
  chatSessionId: Annotation<string>,
  userId: Annotation<string>,

  // Optional – set when user starts a chat from an explore topic
  exploreTopic: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  // Student age (cached after first base agent call to avoid repeated DB queries)
  studentAge: Annotation<number | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  // Created by main graph before protocol invocation
  alertId: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),
  chatAlertId: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  // The original statement that triggered risk detection
  triggeringStatement: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  // Full conversation history as simple objects (for database storage)
  conversationHistory: Annotation<Array<{
    role: string;
    content: string;
  }> | null>,

  // ============================================================================
  // RISK DETECTION (Set by main graph analyze_risk node)
  // ============================================================================

  riskDetected: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Primary risk type classification
   * - "direct": Explicit suicide statements
   * - "indirect": Indirect linguistic themes (hopelessness, burden, etc.)
   * - "ambiguous": Needs clarification (method access, place references, etc.)
   */
  riskType: Annotation<"direct" | "indirect" | "ambiguous" | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Subtype for more granular classification
   * Examples:
   * - Ambiguous: "medication", "chemicals", "place", "firearms", etc.
   * - Indirect: "hopelessness", "burden", "finality", "escape", etc.
   */
  riskSubtype: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * High-level domain of the risk
   * - "suicide": The existing suicide risk protocol
   * - "abuse_neglect": The new abuse and neglect protocol
   * - "harm_to_others": The harm to others protocol
   */
  riskDomain: Annotation<"suicide" | "abuse_neglect" | "harm_to_others" | null>(
    {
      value: (_x, y) => y,
      default: () => "suicide", // Default to suicide for backward compatibility if not set
    },
  ),

  /**
   * Abuse & Neglect Category (1-8)
   */
  abuseCategory: Annotation<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Abuse & Neglect Severity
   */
  abuseSeverity: Annotation<"red" | "orange" | "yellow" | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Abuse Protocol Loop Counter (to prevent infinite clarification loops)
   */
  abuseLoopCount: Annotation<number>({
    value: (_x, y) => y,
    default: () => 0,
  }),

  /**
   * Abuse Protocol Status
   */
  abuseProtocolStatus: Annotation<"in_progress" | "clarifying" | "complete">({
    value: (_x, y) => y,
    default: () => "in_progress",
  }),

  // ============================================================================
  // HARM TO OTHERS PROTOCOL STATE
  // ============================================================================

  /**
   * Harm to Others Category (1-15)
   */
  harmCategory: Annotation<number | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Harm to Others Calculated Score
   */
  harmScore: Annotation<number | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Harm to Others Risk Level
   */
  harmRiskLevel: Annotation<"low" | "moderate" | "high" | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Harm to Others Action
   */
  harmAction: Annotation<"ACT_NOW" | "VERIFY_RISK" | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Harm to Others Verification Count
   */
  harmVerificationCount: Annotation<number>({
    value: (_x, y) => y,
    default: () => 0,
  }),

  /**
   * Pattern type (used by ambiguous risk)
   */
  patternType: Annotation<PatternType | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Extracted context from pattern matching (used by ambiguous risk)
   */
  extractedContext: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Situational distress context (non-risk but worth noting for counselors)
   * Set when student expresses situational hopelessness/burden/escape that doesn't
   * meet the threshold for risk protocol but should be tracked for awareness.
   */
  situationalDistress: Annotation<string | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Whether a situational alert has already been created this session.
   * Used to prevent duplicate alerts for the same conversation.
   */
  situationalAlertCreated: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Whether a risk alert has already been created this session.
   * Used to prevent re-triggering CSSR after protocol completes (loop prevention).
   */
  riskAlertCreated: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Whether volatile/labile suicidality was detected (feelings come and go).
   * Set when student indicates fluctuating suicidal thoughts.
   */
  labileDetected: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Whether a labile alert has already been created this session.
   * Used to prevent duplicate labile alerts.
   */
  labileAlertCreated: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  // ============================================================================
  // AMBIGUOUS RISK FIELDS (Optional - only used in ambiguous subgraph)
  // ============================================================================

  /**
   * Current clarification step (A, B, C, or complete)
   */
  clarificationStep: Annotation<"A" | "B" | "C" | "complete" | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Stored responses to clarification questions
   */
  clarificationResponses: Annotation<ClarificationResponses>({
    value: (_x, y) => y,
    default: () => ({}),
  }),

  // ============================================================================
  // INDIRECT RISK / CSSR FIELDS (Optional - only used in indirect subgraph)
  // ============================================================================

  /**
   * @deprecated - No longer used in new CSSR flow
   * CSSR now always starts at Q1 regardless of entry point.
   * Kept for backward compatibility during transition.
   */
  cssrConfig: Annotation<{
    startSection: 1 | 2 | 3;
    reason: "indirect_theme" | "ambiguous_b_yes" | "ambiguous_c_yes";
  } | null>,

  /**
   * CSSR state - tracks answers to all CSSR questions (Q1-Q6 + Q6Followup)
   *
   * New flow:
   * - Q1 → Q2 → (if Q2=yes) Q3 → Q4 → Q5 → Q6 → (if Q6=yes) Q6Followup
   *            → (if Q2=no) Q6 → (if Q6=yes) Q6Followup
   */
  cssrState: Annotation<CSSRState | null>({
    value: (_x, y) => y,
    default: () => null,
  }),

  /**
   * Current CSSR question text being asked
   */
  currentQuestionText: Annotation<string | null>,

  /**
   * Whether any CSSR question was answered "yes"
   */
  anyYesResponses: Annotation<boolean>,

  // ============================================================================
  // PROTOCOL CONTROL FLAGS (Used by router for orchestration)
  // ============================================================================

  /**
   * Signals that indirect risk subgraph should be invoked
   * Set by ambiguous subgraph when indirect themes detected in Question A
   */
  shouldInvokeIndirect: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Signals that CSSR screening should be invoked
   * Set by ambiguous subgraph when Questions B or C return "yes"
   */
  shouldInvokeCSSR: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Signals that conversation should shut down
   * Set by any subgraph when high risk is detected
   */
  shouldShutdown: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Indicates the current protocol/subgraph has completed
   */
  protocolComplete: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Whether crisis resources have been displayed
   */
  resourcesDisplayed: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Tracks if we asked the past_resolved follow-up question
   * When true and user responds, route to complete_past_resolved
   * Used by both ambiguous and indirect risk subgraphs
   */
  pastResolvedFollowupAsked: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Tracks if we asked the labile check question
   * (to distinguish past_resolved from volatile/fluctuating)
   */
  labileCheckAsked: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  /**
   * Tracks if we have already announced the CSSR transition
   * (to prevent redundant "I need to ask..." messages)
   */
  hasTransitioned: Annotation<boolean>({
    value: (_x, y) => y,
    default: () => false,
  }),

  // ============================================================================
  // METADATA (Used for state transfer and logging)
  // ============================================================================

  /**
   * Natural language summary of the conversation for counselor review
   * Generated by the main graph's generate_conversation_summary node
   * Stored in chat_alerts.conversation_context for display in admin UI
   *
   * Example: "Student expressed feelings of hopelessness and mentioned that
   * 'nothing will get better.' Clarification questions revealed ongoing
   * academic stress. CSSR screening was completed with mixed responses."
   */
  conversationContext: Annotation<string | null>,
});

/**
 * Type helper for accessing the state type
 */
export type ConversationStateType = typeof ConversationState.State;

/**
 * Type helper for partial state updates
 */
export type PartialConversationState = Partial<ConversationStateType>;

/**
 * Default/initial state values
 * Used by main graph on first invocation to initialize all fields
 */
export const DEFAULT_CONVERSATION_STATE: PartialConversationState = {
  messages: [],
  exploreTopic: null,
  alertId: null,
  chatAlertId: null,
  triggeringStatement: null,
  conversationHistory: null,
  riskDetected: false,
  riskType: null,
  riskSubtype: null,
  patternType: null,
  extractedContext: null,
  clarificationStep: null,
  clarificationResponses: {},
  cssrConfig: null,
  cssrState: null,
  currentQuestionText: null,
  anyYesResponses: false,
  shouldInvokeIndirect: false,
  shouldInvokeCSSR: false,
  shouldShutdown: false,
  protocolComplete: false,
  resourcesDisplayed: false,
  conversationContext: null,
  hasTransitioned: false,
};
