# Onboarding Documentation (`src/app/onboarding/`)

This document provides architecture documentation for student onboarding in the FeelWell frontend.

## Overview

The onboarding flow guides new students through profile setup, collecting information to personalize their experience with the AI chatbot.

## Directory Structure

```text
onboarding/
└── student/
    ├── start/page.tsx        # Onboarding start
    ├── complete/page.tsx     # Completion confirmation
    └── profile/
        ├── page.tsx          # Profile hub
        └── [step]/           # Individual steps
            ├── birthday/
            │   ├── page.tsx
            │   ├── action.ts
            │   ├── form.tsx
            │   └── schema.ts
            ├── grade/
            ├── interest/
            ├── language/
            ├── learning-style/
            ├── personal-goals/
            ├── pronouns/
            └── race/
```

## Onboarding Steps

Each profile step collects specific information:

| Step | Purpose | Required |
|------|---------|----------|
| `birthday` | Age for appropriate content | Yes |
| `grade` | Grade level context | Yes |
| `pronouns` | Respectful communication | Yes |
| `language` | Language preferences | No |
| `race` | Demographic data | No |
| `interest` | Personalization topics | No |
| `learning-style` | Communication preferences | No |
| `personal-goals` | Wellness focus areas | No |

## Key Patterns

### Step Structure

Each step follows a consistent pattern:

```text
[step]/
├── page.tsx     # Server component, data fetching
├── action.ts    # Server action for form submission
├── form.tsx     # Client component with form UI
└── schema.ts    # Zod validation schema
```

### Form Flow

```tsx
// form.tsx
"use client";

export function StepForm({ defaultValue }: Props) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { value: defaultValue },
  });

  async function onSubmit(data: Schema) {
    await submitAction(data);
    router.push("/onboarding/student/profile");
  }

  return <Form {...form}>...</Form>;
}
```

### Progress Tracking

Profile completion is tracked to show progress:

```typescript
const completedSteps = await getCompletedSteps(userId);
const totalSteps = ONBOARDING_STEPS.length;
const progress = completedSteps / totalSteps;
```

## Common Tasks

### Adding New Onboarding Step

1. Create folder: `profile/<step>/`
2. Add standard files:
   - `page.tsx` - Server component
   - `action.ts` - Form submission
   - `form.tsx` - Client form
   - `schema.ts` - Validation
3. Add to step sequence in profile hub
4. Update database schema if needed

### Modifying Existing Step

1. Update `schema.ts` for validation changes
2. Modify `form.tsx` for UI changes
3. Update `action.ts` for submission logic

### Skipping Optional Steps

Optional steps can be skipped:

```tsx
<Button variant="ghost" onClick={() => router.push("/onboarding/student/profile")}>
  Skip for now
</Button>
```

## Completion Flow

1. Student completes required steps
2. Optional steps can be skipped
3. `/onboarding/student/complete` shows confirmation
4. Redirect to `/dashboard/student/home`

## See Also

- **Database schema:** `packages/database/src/schema/profile.ts`
- **`../lib/screener/`** - Initial wellness screener after onboarding
