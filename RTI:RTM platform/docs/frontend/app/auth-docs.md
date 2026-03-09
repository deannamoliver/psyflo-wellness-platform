# Auth Routes Documentation (`src/app/(auth)/`)

This document provides architecture documentation for authentication routes in the FeelWell frontend.

## Overview

The `(auth)` route group contains all authentication-related pages. The parentheses indicate a route group that doesn't affect the URL structure - pages are accessible at `/login`, `/sign-up`, etc.

## Directory Structure

```text
(auth)/
├── login/
│   ├── page.tsx          # Login form page
│   ├── action.ts         # Login server action
│   └── schema.ts         # Validation schema
├── sign-up/
│   ├── page.tsx          # Registration page
│   ├── action.ts         # Signup server action
│   └── schema.ts         # Validation schema
├── sign-out/
│   └── route.ts          # Logout API route
├── check-in/
│   ├── page.tsx          # Pre-auth check-in page
│   └── action.ts         # Check-in submission
└── welcome/
    ├── page.tsx          # Welcome landing
    ├── layout.tsx        # Welcome flow layout
    ├── customize/page.tsx
    ├── expect/page.tsx
    ├── listen/page.tsx
    └── privacy/page.tsx
```

## Authentication Flow

1. **Login:** Email → OTP sent → OTP verification → Dashboard redirect
2. **Sign-up:** Email + details → OTP sent → OTP verification → Onboarding
3. **Sign-out:** Clears session → Redirect to login

## Key Patterns

### OTP Verification

Both login and signup use OTP (one-time password) verification:

```typescript
// action.ts
export async function sendOTP(email: string) {
  const supabase = await serverSupabase();
  await supabase.auth.signInWithOtp({ email });
}

export async function verifyOTP(email: string, token: string) {
  const supabase = await serverSupabase();
  await supabase.auth.verifyOtp({ email, token, type: "email" });
}
```

### Role-Based Redirects

After authentication, users are redirected based on role:
- Students → `/dashboard/student/home`
- Counselors → `/dashboard/counselor/home`

## Welcome Flow

New users go through a welcome wizard explaining the platform:
1. `/welcome` - Introduction
2. `/welcome/listen` - How the AI listens
3. `/welcome/expect` - What to expect
4. `/welcome/privacy` - Privacy information
5. `/welcome/customize` - Personalization options

## Common Tasks

### Modifying Login Flow

1. Update `login/schema.ts` for validation changes
2. Modify `login/action.ts` for auth logic changes
3. Update `login/page.tsx` for UI changes

### Adding New Auth Routes

1. Create folder: `(auth)/<route>/`
2. Add `page.tsx` and `action.ts` as needed
3. Ensure proper redirects after authentication

## See Also

- **`../lib/auth/signup-cookie.md`** - OTP cookie handling
- **`../lib/database/supabase.md`** - Supabase client
