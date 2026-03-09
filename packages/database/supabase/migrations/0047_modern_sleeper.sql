CREATE TYPE "public"."resolution_follow_up_plan" AS ENUM('no_follow_up', 'routine_check_ins', 'scheduled_follow_up', 'other');--> statement-breakpoint
CREATE TYPE "public"."resolution_student_status" AS ENUM('crisis_resolved', 'ongoing_support', 'transferred_external', 'hospitalized', 'other');--> statement-breakpoint
CREATE TYPE "public"."coach_safety_report_status" AS ENUM('draft', 'submitted');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('emergency', 'high', 'moderate', 'low');--> statement-breakpoint
CREATE TYPE "public"."safety_concern_category" AS ENUM('harm_to_self', 'harm_to_others', 'abuse_neglect', 'other_safety');--> statement-breakpoint
CREATE TYPE "public"."conversation_event_type" AS ENUM('closed', 'transferred', 'reopened', 'takeover');--> statement-breakpoint
CREATE TYPE "public"."emergency_contact_tag" AS ENUM('primary', 'backup_1', 'backup_2');--> statement-breakpoint
CREATE TYPE "public"."emergency_contact_type" AS ENUM('home', 'school');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'blocked', 'archived');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('user', 'admin', 'clinical_supervisor');--> statement-breakpoint
CREATE TYPE "public"."safety_workflow_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."organization_contact_role" AS ENUM('admin', 'billing', 'technical', 'additional');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('active', 'suspended', 'onboarding', 'archived');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('k12', 'college', 'clinic', 'cbo');--> statement-breakpoint
CREATE TYPE "public"."screener_frequency" AS ENUM('monthly', 'quarterly', 'annually');--> statement-breakpoint
CREATE TYPE "public"."referral_insurance_status" AS ENUM('has_insurance', 'uninsured', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."referral_reason" AS ENUM('anxiety', 'depression', 'trauma', 'behavioral', 'family_issues', 'grief_loss', 'self_harm', 'substance_use', 'other');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('submitted', 'in_progress', 'matched', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."referral_urgency" AS ENUM('routine', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."treatment_plan_status" AS ENUM('active', 'completed', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."wellness_coach_chat_entry_author" AS ENUM('student', 'coach');--> statement-breakpoint
CREATE TYPE "public"."wellness_coach_handoff_origin" AS ENUM('user', 'risk_protocol');--> statement-breakpoint
CREATE TYPE "public"."wellness_coach_escalation_status" AS ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."action_type" ADD VALUE 'emergency_services_contacted';--> statement-breakpoint
ALTER TYPE "public"."action_type" ADD VALUE 'cps_notified';--> statement-breakpoint
ALTER TYPE "public"."action_type" ADD VALUE 'assessment_performed';--> statement-breakpoint
ALTER TYPE "public"."alert_source" ADD VALUE 'coach';--> statement-breakpoint
ALTER TYPE "public"."alert_type" ADD VALUE 'harm_to_self';--> statement-breakpoint
ALTER TYPE "public"."alert_type" ADD VALUE 'other';--> statement-breakpoint
CREATE TABLE "alert_resolutions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"counselor_id" uuid NOT NULL,
	"actions_taken" text[] NOT NULL,
	"resolution_summary" text NOT NULL,
	"student_status" "resolution_student_status" NOT NULL,
	"follow_up_plan" "resolution_follow_up_plan" NOT NULL,
	"verification_completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "alert_resolutions_alertId_unique" UNIQUE("alert_id")
);
--> statement-breakpoint
ALTER TABLE "alert_resolutions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "coach_safety_reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"alert_id" uuid NOT NULL,
	"handoff_id" uuid,
	"category" "safety_concern_category" NOT NULL,
	"risk_level" "risk_level" DEFAULT 'moderate' NOT NULL,
	"student_disclosure" text,
	"situation_summary" text,
	"screening_responses" jsonb,
	"submitted_by_coach_id" uuid,
	"report_status" "coach_safety_report_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "coach_safety_reports_alert_id_unique" UNIQUE("alert_id")
);
--> statement-breakpoint
ALTER TABLE "coach_safety_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "conversation_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"handoff_id" uuid NOT NULL,
	"event_type" "conversation_event_type" NOT NULL,
	"performed_by_coach_id" uuid,
	"closure_reason" text,
	"closing_summary" text,
	"student_notified" boolean DEFAULT false,
	"transfer_to_coach_id" uuid,
	"transfer_reason" text,
	"transfer_notes" text,
	"reopen_reason" text,
	"reopen_context" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "conversation_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" uuid,
	"school_id" uuid,
	"contact_type" "emergency_contact_type" NOT NULL,
	"name" text NOT NULL,
	"relation" text NOT NULL,
	"tag" "emergency_contact_tag",
	"primary_phone" text,
	"secondary_phone" text,
	"primary_email" text,
	"secondary_email" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "contact_reference_check" CHECK (("emergency_contacts"."student_id" IS NOT NULL AND "emergency_contacts"."school_id" IS NULL AND "emergency_contacts"."contact_type" = 'home') OR ("emergency_contacts"."student_id" IS NULL AND "emergency_contacts"."school_id" IS NOT NULL AND "emergency_contacts"."contact_type" = 'school'))
);
--> statement-breakpoint
ALTER TABLE "emergency_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_blackout_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "location_blackout_days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"contact_name" text NOT NULL,
	"job_title" text,
	"email" text,
	"phone" text,
	"office_phone" text,
	"mobile_phone" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "location_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_emergency_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"police_phone" text,
	"police_address" text,
	"sro_name" text,
	"sro_phone" text,
	"no_sro" boolean DEFAULT false,
	"crisis_center_name" text,
	"crisis_hotline" text,
	"crisis_hours" text DEFAULT '24/7',
	"mobile_crisis_available" boolean DEFAULT false,
	"mobile_crisis_number" text,
	"nearest_hospital" text,
	"er_address" text,
	"er_phone" text,
	"state_cps_hotline" text,
	"local_cps_office" text,
	"cps_report_url" text,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "location_emergency_services_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
ALTER TABLE "location_emergency_services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_grade_restrictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"grade_level" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "location_grade_restrictions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_platform_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"chatbot_enabled" boolean DEFAULT true,
	"chatbot_schedule_type" text DEFAULT '24_7',
	"chatbot_closures_disabled" boolean DEFAULT true,
	"sel_screener_enabled" boolean DEFAULT true,
	"sel_screener_frequency" text DEFAULT 'monthly',
	"sel_screener_first_date" date,
	"phq9_enabled" boolean DEFAULT true,
	"phq9_frequency" text DEFAULT 'quarterly',
	"phq9_first_date" date,
	"gad7_enabled" boolean DEFAULT true,
	"gad7_frequency" text DEFAULT 'quarterly',
	"gad7_first_date" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "location_platform_config_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
ALTER TABLE "location_platform_config" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "safety_workflows" (
	"id" uuid PRIMARY KEY NOT NULL,
	"handoff_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"initiated_by_coach_id" uuid,
	"school_id" uuid,
	"status" "safety_workflow_status" DEFAULT 'active' NOT NULL,
	"is_during_school_hours" boolean DEFAULT false NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"immediate_danger" boolean,
	"concern_type" "safety_concern_category",
	"assessment_data" jsonb,
	"risk_level" "risk_level",
	"professional_judgment" text,
	"act_data" jsonb,
	"document_data" jsonb,
	"alert_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "safety_workflows" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "school_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"contact_role" "organization_contact_role" NOT NULL,
	"name" text,
	"title" text,
	"email" text,
	"phone" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "school_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "school_hours" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_school_day" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "school_hours" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "screener_frequency_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"screener_type" "screener_type" NOT NULL,
	"frequency" "screener_frequency" DEFAULT 'quarterly' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "screener_frequency_settings_screener_type_unique" UNIQUE("screener_type")
);
--> statement-breakpoint
ALTER TABLE "screener_frequency_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"is_helpful" boolean NOT NULL,
	"comment" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "referral_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"author_role" text NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "referral_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "therapist_referrals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"counselor_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"reason" "referral_reason" NOT NULL,
	"service_types" text[] NOT NULL,
	"additional_context" text,
	"urgency" "referral_urgency" NOT NULL,
	"insurance_status" "referral_insurance_status",
	"parent_notification_confirmed" boolean NOT NULL,
	"insurance_provider" text,
	"insurance_member_id" text,
	"status" "referral_status" DEFAULT 'submitted' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "therapist_referrals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"diagnosis_code" text NOT NULL,
	"diagnosis_label" text NOT NULL,
	"template_name" text NOT NULL,
	"plan_data" jsonb NOT NULL,
	"status" "treatment_plan_status" DEFAULT 'active' NOT NULL,
	"frequency" text,
	"estimated_duration" text,
	"clinical_notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wellness_coach_chat_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"escalation_id" uuid NOT NULL,
	"content" text NOT NULL,
	"author" "wellness_coach_chat_entry_author",
	"sender_user_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "wellness_coach_chat_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wellness_coach_handoffs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chat_session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"school_id" uuid,
	"reason" text NOT NULL,
	"topic" text NOT NULL,
	"other_detail" text,
	"status" "wellness_coach_escalation_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_by_coach_id" uuid,
	"accepted_at" timestamp with time zone,
	"alert_id" uuid,
	"origin" "wellness_coach_handoff_origin" DEFAULT 'user' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "admin can manage all chat messages" ON "chat_messages" CASCADE;--> statement-breakpoint
DROP TABLE "chat_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "alert_notes" DROP CONSTRAINT "alert_notes_educator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "alert_status_changes" DROP CONSTRAINT "alert_status_changes_educator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "alerts" ALTER COLUMN "resolved_by" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."alert_resolved_by";--> statement-breakpoint
CREATE TYPE "public"."alert_resolved_by" AS ENUM('counselor', 'chatbot');--> statement-breakpoint
ALTER TABLE "alerts" ALTER COLUMN "resolved_by" SET DATA TYPE "public"."alert_resolved_by" USING "resolved_by"::"public"."alert_resolved_by";--> statement-breakpoint
ALTER TABLE "school_allowed_emails" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_schools" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_schools" ALTER COLUMN "role" SET DEFAULT 'student'::text;--> statement-breakpoint
DROP TYPE "public"."user_school_role";--> statement-breakpoint
CREATE TYPE "public"."user_school_role" AS ENUM('student', 'counselor', 'wellness_coach');--> statement-breakpoint
ALTER TABLE "school_allowed_emails" ALTER COLUMN "role" SET DATA TYPE "public"."user_school_role" USING "role"::"public"."user_school_role";--> statement-breakpoint
ALTER TABLE "user_schools" ALTER COLUMN "role" SET DEFAULT 'student'::"public"."user_school_role";--> statement-breakpoint
ALTER TABLE "user_schools" ALTER COLUMN "role" SET DATA TYPE "public"."user_school_role" USING "role"::"public"."user_school_role";--> statement-breakpoint
ALTER TABLE "alert_notes" ADD COLUMN "counselor_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD COLUMN "counselor_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "assigned_coach_id" uuid;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "student_last_read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "home_address" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "platform_role" "platform_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "account_status" "account_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_active_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "student_code" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "added_by" uuid;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "can_manage_users" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "receives_alert_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_reason" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_explanation" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_duration" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_notes" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "blocked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "unblocked_reason" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "unblocked_notes" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "unblocked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "type" "organization_type";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "district_code" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "status" "organization_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "email_domain" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "street_address" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "street_address_2" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "school_code" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "school_type" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "grade_levels" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "estimated_student_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "invite_link_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "invite_link_code" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "academic_year_start" date;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "academic_year_end" date;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "alert_resolutions" ADD CONSTRAINT "alert_resolutions_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_resolutions" ADD CONSTRAINT "alert_resolutions_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_safety_reports" ADD CONSTRAINT "coach_safety_reports_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_safety_reports" ADD CONSTRAINT "coach_safety_reports_handoff_id_wellness_coach_handoffs_id_fk" FOREIGN KEY ("handoff_id") REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_safety_reports" ADD CONSTRAINT "coach_safety_reports_submitted_by_coach_id_users_id_fk" FOREIGN KEY ("submitted_by_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_events" ADD CONSTRAINT "conversation_events_handoff_id_wellness_coach_handoffs_id_fk" FOREIGN KEY ("handoff_id") REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_events" ADD CONSTRAINT "conversation_events_performed_by_coach_id_users_id_fk" FOREIGN KEY ("performed_by_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_events" ADD CONSTRAINT "conversation_events_transfer_to_coach_id_users_id_fk" FOREIGN KEY ("transfer_to_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_blackout_days" ADD CONSTRAINT "location_blackout_days_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_contacts" ADD CONSTRAINT "location_contacts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_emergency_services" ADD CONSTRAINT "location_emergency_services_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_grade_restrictions" ADD CONSTRAINT "location_grade_restrictions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_platform_config" ADD CONSTRAINT "location_platform_config_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_workflows" ADD CONSTRAINT "safety_workflows_handoff_id_wellness_coach_handoffs_id_fk" FOREIGN KEY ("handoff_id") REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_workflows" ADD CONSTRAINT "safety_workflows_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_workflows" ADD CONSTRAINT "safety_workflows_initiated_by_coach_id_users_id_fk" FOREIGN KEY ("initiated_by_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_workflows" ADD CONSTRAINT "safety_workflows_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_workflows" ADD CONSTRAINT "safety_workflows_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_contacts" ADD CONSTRAINT "school_contacts_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_hours" ADD CONSTRAINT "school_hours_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_notes" ADD CONSTRAINT "referral_notes_referral_id_therapist_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."therapist_referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_notes" ADD CONSTRAINT "referral_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_referrals" ADD CONSTRAINT "therapist_referrals_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_referrals" ADD CONSTRAINT "therapist_referrals_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "therapist_referrals" ADD CONSTRAINT "therapist_referrals_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_chat_entries" ADD CONSTRAINT "wellness_coach_chat_entries_escalation_id_wellness_coach_handoffs_id_fk" FOREIGN KEY ("escalation_id") REFERENCES "public"."wellness_coach_handoffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_chat_entries" ADD CONSTRAINT "wellness_coach_chat_entries_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ADD CONSTRAINT "wellness_coach_handoffs_chat_session_id_chat_sessions_id_fk" FOREIGN KEY ("chat_session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ADD CONSTRAINT "wellness_coach_handoffs_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ADD CONSTRAINT "wellness_coach_handoffs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ADD CONSTRAINT "wellness_coach_handoffs_accepted_by_coach_id_users_id_fk" FOREIGN KEY ("accepted_by_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wellness_coach_handoffs" ADD CONSTRAINT "wellness_coach_handoffs_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_student_id" ON "emergency_contacts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_school_id" ON "emergency_contacts" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_contact_type" ON "emergency_contacts" USING btree ("contact_type");--> statement-breakpoint
CREATE UNIQUE INDEX "location_grade_restrictions_unique" ON "location_grade_restrictions" USING btree ("school_id","grade_level");--> statement-breakpoint
CREATE UNIQUE INDEX "school_hours_school_day_unique" ON "school_hours" USING btree ("school_id","day_of_week");--> statement-breakpoint
CREATE INDEX "treatment_plans_student_id_idx" ON "treatment_plans" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "treatment_plans_diagnosis_code_idx" ON "treatment_plans" USING btree ("diagnosis_code");--> statement-breakpoint
ALTER TABLE "alert_notes" ADD CONSTRAINT "alert_notes_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ADD CONSTRAINT "alert_status_changes_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_assigned_coach_id_users_id_fk" FOREIGN KEY ("assigned_coach_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_organization_id_schools_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_notes" DROP COLUMN "educator_id";--> statement-breakpoint
ALTER TABLE "alert_status_changes" DROP COLUMN "educator_id";--> statement-breakpoint
CREATE POLICY "admin can manage all alert resolutions" ON "alert_resolutions" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all coach safety reports" ON "coach_safety_reports" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all conversation events" ON "conversation_events" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all emergency contacts" ON "emergency_contacts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all location blackout days" ON "location_blackout_days" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all location contacts" ON "location_contacts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all location emergency services" ON "location_emergency_services" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all location grade restrictions" ON "location_grade_restrictions" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all location platform config" ON "location_platform_config" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all safety workflows" ON "safety_workflows" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all school contacts" ON "school_contacts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all school hours" ON "school_hours" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all screener frequency settings" ON "screener_frequency_settings" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "authenticated can insert own feedback" ON "feedback" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "authenticated can view own feedback" ON "feedback" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "admin can manage all feedback" ON "feedback" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all referral notes" ON "referral_notes" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all therapist referrals" ON "therapist_referrals" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all wellness coach chat entries" ON "wellness_coach_chat_entries" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all wellness coach handoffs" ON "wellness_coach_handoffs" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
DROP TYPE "public"."chat_author";