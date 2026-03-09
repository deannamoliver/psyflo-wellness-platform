# Adding New Test Scenarios and Validators

This guide explains how to extend the seed system with new test scenarios and validation rules.

## Quick Start: Adding a New Scenario

1. Open [scenarios/index.ts](scenarios/index.ts)
2. Add your scenario to the appropriate category array
3. Run `bun run db:seed` to validate and create

### Example: Adding SEL Screeners for Skill Development

To populate the skill development overview, add SEL screeners to your scenarios:

```typescript
{
  student: {
    firstName: "Maya",
    lastName: "Chen",
    grade: 10,
    age: 15,
  },
  // Add SEL screeners to show progression over time
  selScreeners: [
    {
      completedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000), // ~20 weeks ago
      domainScores: {
        sel_self_awareness_self_concept: 2.5,
        sel_self_awareness_emotion_knowledge: 2.5,
        sel_social_awareness: 2.5,
        sel_self_management_emotion_regulation: 2.0,
        sel_self_management_goal_management: 2.5,
        sel_self_management_school_work: 2.5,
        sel_relationship_skills: 3.0,
        sel_responsible_decision_making: 2.5,
      },
    },
    {
      completedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // ~10 weeks ago
      domainScores: {
        sel_self_awareness_self_concept: 3.0,
        sel_self_awareness_emotion_knowledge: 3.0,
        // ... show progression in scores
      },
    },
  ],
  alerts: [
    // ... mental health screeners and alerts
  ],
}
```

**SEL Domain Score Guidelines:**
- Scores range from 1-4 (Very Difficult to Very Easy)
- SEL screeners don't generate alerts
- Create multiple screeners over time (10-week intervals) to show skill development trends
- All 8 domains should be included for complete data

### Example: Adding a New Alert Scenario

```typescript
export const depressionScenarios: TestScenario[] = [
  // ... existing scenarios
  {
    student: {
      firstName: "Your",
      lastName: "Name",
      grade: 10,        // Must be 8-12
      age: 15,          // Must align with grade (see validator)
    },
    alerts: [
      {
        screener: {
          type: "phq_a",           // phq_a/phq_9/gad_child/gad_7
          targetScore: 15,         // Will generate responses to hit this score
          completedAt: new Date("2024-01-15"),
        },
        alert: {
          type: "depression",      // Must match screener type
          source: "screener",      // screener | chat
          status: "new",           // new | in_progress | resolved
          createdAt: new Date("2024-01-15"),
          timeline: [
            {
              type: "alert_generated",
              description: "Alert generated from PHQ-A screener",
            },
            {
              type: "note_added",
              description: "Initial assessment note",
              noteContent: "Student shows signs of moderate depression",
            },
          ],
        },
      },
    ],
  },
];
```

## Scenario Constraints

The seed system validates all scenarios before creation. Understanding these constraints helps you create valid scenarios.

### Student Constraints

#### Grade-Age Alignment
Students must have realistic grade-age combinations:

| Grade | Valid Ages |
|-------|-----------|
| 8     | 13-14     |
| 9     | 14-15     |
| 10    | 15-16     |
| 11    | 16-17     |
| 12    | 17-18     |

**Validator:** `validators.gradeAge(grade, age)` in [validators.ts](validators.ts)

### Screener Constraints

#### Screener Type for Age
Different screeners have age requirements:

- **PHQ-A / GAD-Child**: Ages 11-17 (adolescent versions)
- **PHQ-9 / GAD-7**: Ages 18+ (adult versions)

**Validator:** `validators.screenerType(age, type)` in [validators.ts](validators.ts)

#### Alert-Screener Matching
Alert types must match the screener that generated them:

| Alert Type | Valid Screeners |
|-----------|----------------|
| depression | phq_a, phq_9   |
| anxiety   | gad_child, gad_7 |
| safety    | phq_a, phq_9   |

**Validator:** `validators.alertScreenerMatch(alertType, screenerType)` in [validators.ts](validators.ts)

### Timeline Constraints

#### Chronological Order
Timeline entries must be in chronological order. Each entry's `createdAt` must be >= the previous entry.

**Validator:** `validators.timelineOrder(entries)` in [validators.ts](validators.ts)

## Special Scenario Types

### Scenarios Without Alerts

Students can have screeners without triggering alerts (e.g., low scores):

```typescript
{
  student: { firstName: "Low", lastName: "Score", grade: 9, age: 14 },
  alerts: [
    {
      screener: {
        type: "phq_a",
        targetScore: 3,  // Low score, no alert needed
      },
      // No alert property - just screener data
    },
  ],
}
```

### Multiple Alerts Per Student

Test bulk operations by giving students multiple alerts:

```typescript
{
  student: { firstName: "Multiple", lastName: "Alerts", grade: 11, age: 16 },
  alerts: [
    {
      screener: { type: "phq_a", targetScore: 18 },
      alert: { type: "depression", source: "screener", status: "new", timeline: [...] },
    },
    {
      screener: { type: "gad_child", targetScore: 15 },
      alert: { type: "anxiety", source: "screener", status: "in_progress", timeline: [...] },
    },
  ],
}
```

### Chat-Generated Alerts

Alerts can come from chat interactions instead of screeners:

```typescript
{
  student: { firstName: "Chat", lastName: "Alert", grade: 10, age: 15 },
  alerts: [
    {
      // No screener
      alert: {
        type: "safety",
        source: "chat",  // From chat, not screener
        status: "new",
        timeline: [
          {
            type: "alert_generated",
            description: "Safety concern identified in chat conversation",
          },
        ],
      },
    },
  ],
}
```

## Adding New Validators

When you need to enforce a new constraint, add a validator to [validators.ts](validators.ts).

### Step 1: Define the Validator Function

Add your validator to the `validators` object:

```typescript
export const validators = {
  // ... existing validators

  /**
   * Example: Validate screener score is within valid range
   */
  screenerScore: (type: ScreenerType, score: number): ValidationResult => {
    const ranges: Record<ScreenerType, { min: number; max: number }> = {
      phq_a: { min: 0, max: 27 },
      phq_9: { min: 0, max: 27 },
      gad_child: { min: 0, max: 21 },
      gad_7: { min: 0, max: 21 },
    };

    const range = ranges[type];
    if (score < range.min || score > range.max) {
      return {
        valid: false,
        errors: [
          `Score ${score} is outside valid range for ${type} (${range.min}-${range.max})`,
        ],
      };
    }
    return { valid: true };
  },
};
```

### Step 2: Use in Composite Validator

Add your validator to `validateScenario()` function:

```typescript
export function validateScenario(scenario: TestScenario): ValidationResult {
  const errors: string[] = [];

  // ... existing validations

  // Add new validation
  for (const alert of scenario.alerts) {
    if (alert.screener) {
      const scoreResult = validators.screenerScore(
        alert.screener.type,
        alert.screener.targetScore,
      );
      if (!scoreResult.valid) {
        errors.push(...scoreResult.errors);
      }
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
```

### Validator Design Principles

1. **Pure Functions**: Validators should have no side effects
2. **Single Responsibility**: Each validator checks one constraint
3. **Consistent Return Type**: Always return `ValidationResult`
4. **Clear Error Messages**: Include context in error messages

## Scenario Organization

Scenarios are organized by category in [scenarios/](scenarios/) directory:

- **depression.ts**: Depression-related alerts (PHQ-A, PHQ-9)
- **anxiety.ts**: Anxiety-related alerts (GAD-Child, GAD-7)
- **safety.ts**: Safety/suicide risk alerts
- **edge-cases.ts**: Special cases (multiple alerts, status changes, repeats)
- **no-alerts.ts**: Students with screeners but no alerts
- **index.ts**: Exports all scenarios

### Adding a New Category

If you need a new category (e.g., substance use scenarios):

1. Create `scenarios/substance-use.ts`:

```typescript
import type { TestScenario } from "../types";

export const substanceUseScenarios: TestScenario[] = [
  // Your scenarios
];
```

2. Export from `scenarios/index.ts`:

```typescript
export * from "./substance-use";

// Update allScenarios array
export const allScenarios: TestScenario[] = [
  ...depressionScenarios,
  ...anxietyScenarios,
  ...safetyScenarios,
  ...edgeCaseScenarios,
  ...noAlertScenarios,
  ...substanceUseScenarios,  // Add new category
];
```

## Testing Your Scenarios

### Validation Before Creation

All scenarios are validated before database insertion:

```bash
bun run db:seed
# Will show: === Validating XX scenarios ===
# If any fail, you'll see detailed error messages
```

### Common Validation Errors

**Grade-Age Mismatch:**
```
❌ Invalid scenario: John Doe
   - [John Doe] Student: Grade 10 expects ages 15-16, got 18
```
Fix: Adjust age to match grade

**Screener Type Wrong for Age:**
```
❌ Invalid scenario: Jane Smith
   - [Jane Smith] Alert 1: Screener: phq_9 requires age 18+, got 15
```
Fix: Use `phq_a` for age 15

**Alert-Screener Mismatch:**
```
❌ Invalid scenario: Bob Jones
   - [Bob Jones] Alert 1: Alert type anxiety doesn't match screener phq_a
```
Fix: Use `gad_child` screener for anxiety alerts

**Timeline Out of Order:**
```
❌ Invalid scenario: Alice Brown
   - [Alice Brown] Alert 1: Timeline: Timeline entry 2 is before entry 1
```
Fix: Ensure timeline dates are chronological

## Database Verification

After seeding, verify your data was created:

```typescript
// In a test file or manual check:
const students = await db.query.students.findMany();
const alerts = await db.query.alerts.findMany();
const screeners = await db.query.screeners.findMany();

console.log(`Created ${students.length} students`);
console.log(`Created ${alerts.length} alerts`);
console.log(`Created ${screeners.length} screeners`);
```

## Advanced: Custom Generators

For complex data generation, you can create custom generators in [generators/](generators/).

### Current Generators

- **alert.ts**: Creates alerts with timeline entries
- **screener.ts**: Creates screeners with calculated responses
- **student.ts**: Creates students with profiles

### Adding a Custom Generator

Example: Generate a screener with specific response patterns:

```typescript
// generators/screener-custom.ts
export async function createCustomScreener(
  db: ReturnType<typeof drizzle>,
  userId: string,
  config: {
    type: ScreenerType;
    pattern: "all-high" | "all-low" | "mixed";
  },
): Promise<string> {
  // Your custom logic here
}
```

Then use in your scenario creation logic in [helpers.ts](helpers.ts).

## Tips and Best Practices

1. **Start Small**: Add one scenario at a time and test
2. **Use Existing Scenarios**: Copy and modify similar scenarios
3. **Leverage Defaults**: Most dates default to reasonable values
4. **Test Edge Cases**: Create scenarios that test boundary conditions
5. **Document Intent**: Use clear names like "High-Risk-Resolved" instead of "Test1"
6. **Check Validation**: Run `bun run db:seed` to see if your scenarios are valid
7. **Review Constraints**: Check [validators.ts](validators.ts) for all rules

## Future Extensions

This system is designed to be extended. Consider adding:

- New screener types (CRAFFT, Columbia, etc.)
- Custom alert severity levels
- Group/cohort-based scenarios
- Longitudinal scenarios (progress over time)
- Custom counselor interaction patterns
- School-specific configurations

When adding new features, follow the same pattern:
1. Define types in [types.ts](types.ts)
2. Add validators in [validators.ts](validators.ts)
3. Create generators in [generators/](generators/)
4. Build scenarios in [scenarios/](scenarios/)
5. Test with `bun run db:seed`