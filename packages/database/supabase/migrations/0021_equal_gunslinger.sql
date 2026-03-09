ALTER TABLE "alert_actions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alert_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alert_status_changes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alert_timeline_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alerts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mood_check_ins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "school_domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_schools" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "screener_alerts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "screener_session_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "screener_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "screeners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "admin can manage all alert actions" ON "alert_actions" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all alert notes" ON "alert_notes" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all alert status changes" ON "alert_status_changes" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all alert timeline entries" ON "alert_timeline_entries" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all alerts" ON "alerts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all chat messages" ON "chat_messages" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all chat sessions" ON "chat_sessions" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all mood check ins" ON "mood_check_ins" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all school domains" ON "school_domains" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all schools" ON "schools" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all user schools" ON "user_schools" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all screener alerts" ON "screener_alerts" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all screener session responses" ON "screener_session_responses" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all screener sessions" ON "screener_sessions" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all screeners" ON "screeners" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage all user settings" ON "user_settings" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" USING (true);