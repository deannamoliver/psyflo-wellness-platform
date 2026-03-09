# tailwind-utils.ts

Tailwind CSS utility functions, primarily the `cn()` function that merges class names using `clsx` and `tailwind-merge`. Essential for conditional styling throughout all components.

**Usage:** `cn("base-class", condition && "conditional-class", props.className)`

**Used by:** Every UI component in the application
