# Counselor Dashboard Documentation (`src/app/dashboard/counselor/`)

This document provides architecture documentation for the counselor dashboard in the FeelWell frontend.

## Overview

The counselor dashboard enables school counselors and staff to monitor student wellness, respond to alerts, and view analytics.

## Directory Structure

```text
dashboard/counselor/
├── page.tsx              # Redirect to home
├── layout.tsx            # Counselor dashboard layout
├── home/
│   ├── page.tsx          # Dashboard overview
│   ├── loading.tsx
│   └── ~lib/             # Charts, stats components
├── alerts/
│   ├── page.tsx          # Alert list
│   ├── [alertId]/        # Individual alert
│   │   ├── page.tsx
│   │   └── ~lib/
│   └── student/[studentId]/  # Student's alerts
│       ├── page.tsx
│       └── ~lib/
├── students/
│   ├── page.tsx          # Student list
│   └── [studentId]/      # Individual student
│       ├── page.tsx
│       ├── layout.tsx
│       ├── tabs.tsx
│       ├── activity/     # Activity tab
│       ├── assessments/  # Assessment tab
│       ├── mood/         # Mood tab
│       └── skill-development/  # Skills tab
├── analytics/page.tsx    # School analytics
├── inbox/page.tsx        # Messages
├── resources/
│   ├── page.tsx
│   ├── emergency-resources/
│   ├── privacy-policy/
│   └── terms-and-conditions/
├── settings/
│   ├── page.tsx
│   ├── change-password/
│   └── ~lib/
└── ~lib/
    ├── sidebar.tsx
    └── sidebar-header.tsx
```

## Key Features

### Alert Management

Alerts are the primary workflow for counselors:
- Alert list with filtering by status/severity
- Individual alert detail with timeline
- Student-grouped alert view
- Note-taking and status updates

### Student Profiles

Detailed student views with tabs:
- **Activity:** Recent interactions and events
- **Assessments:** Screener results and history
- **Mood:** Mood check-in calendar and trends
- **Skill Development:** SEL skill progress

### Analytics

School-wide metrics:
- Active student count
- Alert trends over time
- Check-in completion rates
- Wellness score distributions

## Key Patterns

### Alert Status Flow

```text
pending → acknowledged → in_progress → resolved
                     ↘ escalated
```

### Student Data Access

All student data is scoped by school via RLS:

```typescript
const students = await db.rls(async (tx) => {
  return tx.select()
    .from(profiles)
    .where(eq(profiles.schoolId, counselor.schoolId));
});
```

### Tabbed Student Views

Student detail uses parallel routes pattern:

```text
students/[studentId]/
├── page.tsx        # Default view
├── layout.tsx      # Tab navigation
├── activity/       # /students/123/activity
├── mood/           # /students/123/mood
└── ...
```

## Common Tasks

### Adding New Alert Action

1. Add action to `lib/alerts/actions.ts`
2. Update UI in `alerts/[alertId]/~lib/`
3. Add to alert card actions if needed

### Adding New Student Tab

1. Create folder: `students/[studentId]/<tab>/`
2. Add `page.tsx` with tab content
3. Update `tabs.tsx` navigation
4. Add `~lib/` for complex components

### Modifying Dashboard Stats

1. Update data fetching in `home/page.tsx`
2. Modify chart configs in `home/~lib/`
3. Update stat card displays

## See Also

- **`../../lib/alerts/`** - Alert module documentation
- **`../../lib/student-alerts/`** - Student-grouped alerts
- **`../../lib/analytics/`** - Chart configuration
