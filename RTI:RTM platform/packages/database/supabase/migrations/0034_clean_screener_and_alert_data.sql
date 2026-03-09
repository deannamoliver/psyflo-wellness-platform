-- Clean up all test data for screeners and alerts
-- This migration removes all existing screener and alert data to start fresh with production testing
-- All deletions cascade to related tables automatically via foreign key constraints

-- Delete all alerts (cascades to alert_timeline_entries, alert_notes, alert_actions, alert_status_changes, screener_alerts)
DELETE FROM alerts;

-- Delete all screeners (cascades to screener_sessions, screener_session_responses, screener_alerts)
DELETE FROM screeners;
