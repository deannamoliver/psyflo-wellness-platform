# `src/lib/time-utils.ts`

Date/time utility functions. Provides `dateOrNull(value)` which safely converts a string to a Date object, returning null if the input is null/undefined or if the resulting date is invalid (NaN).

**Exports:** `dateOrNull(value: string | null | undefined): Date | null`

**Dependencies:** None (pure JavaScript)
