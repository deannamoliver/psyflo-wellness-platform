-- Custom SQL migration file --

-- Delete alert timeline entries where type is alert_assigned
-- As we don't assign alerts to users anymore

delete from "alert_timeline_entries" where "type" = 'alert_assigned';
