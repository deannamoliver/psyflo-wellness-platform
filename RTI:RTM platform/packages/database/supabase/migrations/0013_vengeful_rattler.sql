-- Delete existing screener_sessions entries where grade would be null
DELETE FROM "screener_sessions" WHERE "grade" IS NULL;
