# Task: Build the Safety Alerts Screen

You are building a new Safety Alerts screen for the counselor dashboard. You have two reference images:

1. Empty state: `/Users/ali/.cursor/projects/Users-ali-code-psyflo/assets/Safety__Empty_State_-7c7a1dae-4dcd-47f4-91db-33c2c3c45fa9.png`
2. Populated state: `/Users/ali/.cursor/projects/Users-ali-code-psyflo/assets/Safety-648687e3-01f0-419b-89bc-c329b8064719.png`

## Business Context

This screen shows **Safety Alerts** — a subset of all alerts focused on student safety concerns. It replaces/extends the existing `/dashboard/counselor/alerts` page with a new table-based view and risk-level aggregation.

---

## Key Business Rules

### 1. Alert Types (exactly 2)

There are only two types of alerts shown on this screen:

| Display Name | Source | Risk Level |
|--------------|--------|------------|
| **PHQ-9 Q9 Endorsed** | Screener (`source: screener`, `type: safety`, PHQ-A or PHQ-9 with Q9 > 0) | Always **HIGH** |
| **Coach Escalation Report** | Wellness coach escalation + Safety Workflow form | **EMERGENCY**, **HIGH**, **MODERATE**, or **LOW** (from Safety Workflow) |

### 2. Risk Levels

Four levels: **EMERGENCY** > **HIGH** > **MODERATE** > **LOW**

- PHQ-9 Q9 Endorsed = always HIGH
- Coach Escalation Report = risk level from Safety Workflow form (stored elsewhere)

### 3. Aggregation by Student

- Rows in the table are **per student**, not per alert.
- If a student has multiple alerts, aggregate them:
  - **Safety Risk Level**: Show the **highest** risk level across all the student's alerts.
  - **Alerts column**: List all alert types (e.g., "Coach Escalation Report, PHQ-9 Q9 Endorsed").
  - **Alert count**: Show total (e.g., "▲ 2 Alerts").

### 4. Status Labels

The design shows: **NEW**, **IN REVIEW**, **RESOLVED**

These map to the existing schema:

- `new` → "NEW"
- `in_progress` → "IN REVIEW"
- `resolved` → "RESOLVED"

### 5. Actions Taken

The "Actions Taken" column shows actions from the Safety Workflow form. The design shows:

- Parent/Guardian contacted
- Emergency Services contacted
- School notified
- CPS notified
- Assessment performed

Current `action_type` enum has: `contacted_988`, `notified_staff`, `contacted_parents`, `triggered_gad7`, `triggered_phq9`.

**You will need to extend the enum or create a mapping.** For now, map what you can:

- `contacted_parents` → "Parent/Guardian contacted"
- `notified_staff` → "School notified"

The remaining actions (Emergency Services, CPS, Assessment performed) are not in the current schema. Either:

- Add them to `action_type` enum, OR
- Display a placeholder / fetch from the Safety Workflow form data if available

### 6. Summary Cards (Top)

The four cards show **student counts** per risk level (not alert counts):

- EMERGENCY: X Students
- HIGH RISK: X Students
- MODERATE: X Students
- LOW RISK: X Students

---

## Schema Context

### Existing Tables You'll Use

**`alerts`** - Parent alert record

- `id`, `studentId`, `type`, `source`, `status`, `resolvedBy`, `createdAt`, `updatedAt`
- `type`: `safety`, `depression`, `anxiety`, `abuse_neglect`, `harm_to_others`
- `source`: `chat`, `screener`
- `status`: `new`, `in_progress`, `resolved`

**`screener_alerts`** - Links screeners to alerts

- `screenerId`, `alertId`

**`screeners`** - Screener records

- `userId`, `type` (`phq_a`, `phq_9`, `gad_7`, `gad_child`, `sel`), `score`, `completedAt`

**`screener_session_responses`** - Individual question responses

- Use to check if Q9 > 0 for PHQ safety alerts

**`alert_timeline_entries`** + **`alert_actions`** - Timeline and actions

- `alert_actions.type`: `contacted_988`, `notified_staff`, `contacted_parents`, `triggered_gad7`, `triggered_phq9`

**`profiles`** - Student info

- `grade`, etc.

**`wellness_coach_escalations`** - Coach escalations (for Coach Escalation Reports)

- `studentId`, `status`, `reason`, `topic`
- **Note**: Currently has NO `alertId` link and NO `risk_level` field

### What's Missing in Schema

The schema does NOT currently have:

1. **`safety_risk_level`** on alerts (emergency/high/moderate/low)
2. **Link between `wellness_coach_escalations` and `alerts`**
3. **Additional action types** (emergency_services_contacted, cps_notified, assessment_performed)

### How to Handle Missing Data

For this implementation:

1. **PHQ-9 Q9 Endorsed risk level**: Hardcode as "HIGH" (no schema change needed)

2. **Coach Escalation Report risk level**:
   - If the Safety Workflow form stores this elsewhere, query it
   - Otherwise, you may need to add a `safety_risk_level` column to `alerts` or `wellness_coach_escalations`
   - For MVP, you could derive from existing data or default to a placeholder

3. **Linking escalations to alerts**:
   - Coach Escalation Reports should create alerts when the Safety Workflow is submitted
   - For now, you may need to identify them by `source: 'chat'` + the escalation context, OR add an `escalationId` to alerts

---

## UI Components & Layout

### Page Structure

```
/dashboard/counselor/alerts (or a new /dashboard/counselor/safety route)

├── Page Header
│   ├── Title: "Safety Alerts"
│   └── Subtitle: "Review and resolve student safety reports"
│
├── Summary Cards (4 cards in a row)
│   ├── EMERGENCY (red) - count + "Students"
│   ├── HIGH RISK (orange) - count + "Students"
│   ├── MODERATE (yellow) - count + "Students"
│   └── LOW RISK (blue) - count + "Students"
│
├── Filters & Search Card
│   ├── Search input (by student name, ID, or alert type)
│   ├── Grade Level dropdown
│   ├── Risk Level dropdown
│   ├── Status dropdown
│   ├── Sort dropdown (Most Recent, etc.)
│   └── Clear All link
│
└── Data Table
    ├── Checkbox column (for bulk actions, optional)
    ├── STUDENT (name, grade, ID)
    ├── SAFETY RISK LEVEL (badge: EMERGENCY/HIGH/MODERATE/LOW)
    ├── ALERTS (count + list of alert types)
    ├── MOST RECENT (relative time + absolute time)
    ├── ACTIONS TAKEN (icons/badges for each action)
    ├── STATUS (badge: NEW/IN REVIEW/RESOLVED)
    └── ACTIONS (View button + icon)
```

### Empty State

When no alerts match filters, show centered "No alerts." text in the table body.

### Risk Level Badge Colors

- EMERGENCY: Red background (`bg-red-500` or similar)
- HIGH: Orange/red background
- MODERATE: Yellow background
- LOW: Blue background

### Status Badge Colors

- NEW: Red dot + text
- IN REVIEW: Orange/yellow dot + text
- RESOLVED: Green dot + text

---

## Implementation Steps

1. **Query layer**: Create a query that:
   - Fetches safety-related alerts (`type: safety` from screeners, plus any Coach Escalation Reports)
   - Joins with `screener_alerts` → `screeners` to identify PHQ-9 Q9 alerts
   - Groups by student
   - Computes highest risk level per student
   - Fetches actions taken per student

2. **Risk level logic**:
   - PHQ-9 Q9 Endorsed (screener safety alert where PHQ Q9 > 0) → HIGH
   - Coach Escalation Report → from Safety Workflow (if available) or placeholder

3. **Summary cards**: Count distinct students per risk level

4. **Table component**: Build with the columns shown in the design

5. **Filters**: Implement search, grade, risk level, status, and sort filters

6. **Navigation**: Update `/dashboard/counselor/alerts` or create a new route; ensure "Safety" nav item points here

---

## Files to Reference

- Existing alerts page: `apps/frontend/src/app/dashboard/counselor/alerts/page.tsx`
- Alerts queries: `apps/frontend/src/lib/student-alerts/queries.ts`
- Alert card components: `apps/frontend/src/lib/student-alerts/student-alert-card.tsx`
- Schema: `packages/database/src/schema/alert.ts`, `packages/database/src/schema/screener.ts`, `packages/database/src/schema/wellness-coach.ts`
- Existing filters: `apps/frontend/src/app/dashboard/counselor/alerts/~lib/filters.tsx`
- Top nav: `apps/frontend/src/app/dashboard/counselor/~lib/top-nav.tsx` (already has "Safety" label pointing to alerts)

---

## Out of Scope (for now)

- Building the Safety Workflow form itself (exists elsewhere)
- Bulk actions (checkboxes shown but no actions defined)
- The "View" action detail page (use existing alert detail pages)

---

## Deliverables

1. New or updated page at `/dashboard/counselor/alerts` showing the Safety Alerts table view
2. Summary cards with student counts by risk level
3. Filters (search, grade, risk level, status, sort)
4. Table with all columns from the design
5. Empty state when no alerts
6. Any necessary schema additions (document what you add)
