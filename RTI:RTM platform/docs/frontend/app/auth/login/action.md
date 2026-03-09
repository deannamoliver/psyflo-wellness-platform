# login/action.ts

Server actions for login flow. Exports `sendOTP(email)` to initiate magic link and `verifyOTP(email, token)` to complete authentication via Supabase Auth.

**Used by:** Login form submission
