# Student Alerts System

This directory contains the student-focused alert management system that groups individual alerts by student and provides bulk management capabilities.

## Overview

The student alerts system transforms the individual alert-based UI into a student-centric view where:
- Each student appears once per status tab
- Alert counts and sources are contextually filtered based on the current tab
- Student-level actions can update multiple alerts at once
- Educators get a cleaner workflow focused on students rather than individual alerts

## Core Concepts

### Student Status Precedence
Student status is computed from all their alerts using precedence rules:
- **New** > **In Progress** > **Resolved**
- If a student has ANY "new" alert → Student status = "new"
- Else if ANY "in_progress" alert → Student status = "in_progress"
- Else → Student status = "resolved"

### Contextual Filtering
Unlike the original alert-level filtering, the new system filters in two stages:

1. **Student-level filtering:** Show only students whose overall status matches the tab
2. **Alert-level filtering:** For each student, show only alerts matching the tab status

#### Example:
Student with alerts: 1 new, 3 in_progress, 10 resolved
- **Student status:** "new" (highest precedence)
- **"New" tab:** Shows student with "Risk Alerts (1)" from new alert only
- **"In Progress" tab:** Student doesn't appear
- **"Resolved" tab:** Student doesn't appear

## File Structure

```
student-alerts/
├── README.md                    # This documentation
├── types.ts                     # TypeScript definitions
├── student-status.ts           # Status computation logic
├── queries.ts                  # Database queries and data transformation
├── actions.ts                  # Server actions for bulk updates
└── student-alert-card.tsx      # Student card UI component
```

## Types (`types.ts`)

### `StudentAlertsGrouped`
Main data structure representing a student with their alerts:

```typescript
{
  student: Student,           // Student info (name, grade, etc.)
  alerts: AlertWithStudent[], // ALL alerts for this student
  studentStatus: Status,      // Computed overall status
  alertCount: number,         // Total alert count
  latestCreatedAt: Date,      // Most recent alert timestamp
  sourcesAndTypes: SourceAndTypes[], // All sources/types

  // Filtered data for display (based on current tab)
  filteredAlerts: AlertWithStudent[],     // Only alerts matching tab
  filteredAlertCount: number,             // Count of filtered alerts
  filteredSourcesAndTypes: SourceAndTypes[] // Sources/types from filtered alerts
}
```

### `SourceAndTypes`
Represents source-to-alert-types mapping:
```typescript
{
  source: "screener" | "chat",
  alertTypes: ("well_being" | "safety" | "depression" | "anxiety")[]
}
```

## Status Computation (`student-status.ts`)

### Core Functions

- **`computeStudentStatus(alerts)`:** Implements precedence rules
- **`groupSourcesAndTypes(alerts)`:** Groups alerts by source, collects unique types per source
- **`getLatestCreatedAt(alerts)`:** Finds most recent alert creation time
- **`transformToStudentGrouped()`:** Converts alert array to StudentAlertsGrouped
- **`transformToStudentGroupedWithFiltered()`:** Same as above but with separate filtered data

## Data Queries (`queries.ts`)

### `getStudentGroupedAlerts({ schoolId, sParams })`
Main query for alerts page:

1. **Fetch all alerts** for school (no alert-level filtering)
2. **Group by student** using Map
3. **Compute student status** for each group
4. **Filter students** by tab status (student-level filtering)
5. **Filter alerts** within each student by tab status
6. **Transform** to StudentAlertsGrouped with filtered data

### `getStudentWithAllAlerts({ studentId, schoolId })`
Query for student details page:
- Fetches ALL alerts for specific student
- No filtering applied (shows complete student history)

## Bulk Actions (`actions.ts`)

### `changeStudentAlertsStatusAction({ studentId, status })`
Updates multiple alerts for a student:

**Business Logic:**
- **Mark In Progress:** Updates only "new" alerts → "in_progress"
- **Mark Resolved:** Updates "new" AND "in_progress" alerts → "resolved"

**Process:**
1. Fetch all student alerts
2. Filter alerts that need updating based on target status
3. Update each alert individually
4. Create timeline entries for each change
5. Revalidate relevant pages

## UI Components

### `StudentAlertCard` (`student-alert-card.tsx`)
Displays student with their contextually filtered alerts:

- **Student info:** Avatar, name, grade, ID
- **Status badge:** Color-coded student status
- **Alert count:** `filteredAlertCount` (contextual to tab)
- **Sources/Types:** Multiple rows from `filteredSourcesAndTypes`
- **Actions:** Student-level Mark In Progress/Resolved buttons
- **Summary:** From most recent filtered alert

### Key UI Features
- **Consistent height:** Cards stretch to match using flexbox
- **Contextual display:** Only shows data relevant to current tab
- **Action visibility:** Buttons show/hide based on student status

## Filtering Changes

### Original System (Alert-Level)
```
Filter alerts → Group by student → Display
```
**Result:** Students appeared on multiple tabs

### New System (Student-Level)
```
Get all alerts → Group by student → Filter students by status → Filter alerts by status → Display
```
**Result:** Each student appears on exactly one tab

### Removed Filters
- **Source filter:** No longer needed (sources shown contextually)
- **Alert Type filter:** No longer needed (types shown contextually)
- **Kept:** Grade Level filter (still useful for student filtering)

## Pages

### Main Alerts Page (`/dashboard/counselor/alerts`)
- Uses `getStudentGroupedAlerts()`
- Shows `StudentAlertCard` components
- Filtering by student status via tabs
- Only Grade Level dropdown filter remains

### Student Details Page (`/dashboard/counselor/alerts/student/[studentId]`)
- Uses `getStudentWithAllAlerts()`
- Shows comprehensive student info + all alerts
- Student-level actions in top-right
- Individual alert cards showing full history

## Migration Impact

### Benefits
- **Cleaner UX:** Each student appears once, no duplicates
- **Contextual data:** Everything shown is relevant to current view
- **Simplified filtering:** Fewer options, clearer purpose
- **Efficient actions:** Bulk operations on student level

### Breaking Changes
- **Search params:** Removed `source` and `alertType` parameters
- **Filter UI:** Removed Source/Alert Type dropdowns
- **Data structure:** Changed from individual alerts to grouped students
- **Navigation:** "View Details" links to student page, not individual alert

## Future Considerations

### Extensibility
- **Additional sources:** System easily supports new alert sources
- **Status customization:** Could add more student status levels
- **Filtering options:** Could add student-specific filters (assignment status, etc.)

### Performance
- **Current approach:** Fetches all alerts, filters in application
- **Future optimization:** Could push filtering to database level for large datasets
- **Caching:** Student groupings could be cached since they change less frequently

### Analytics
- **Student-level metrics:** Now easier to track student progress over time
- **Educator workflow:** Can measure time-to-resolution per student vs per alert
- **Risk tracking:** Student status changes provide better trend analysis