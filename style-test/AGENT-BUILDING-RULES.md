# Agent Building Rules

Use this alongside [STYLE-GUIDE.md](/Users/michaelhabermas/repos/star-hotel/style-test/STYLE-GUIDE.md) when implementing UI.

## Default Theme Choice

- Light theme: `Lakeside Console`
- Dark theme: `Night Audit`

Do not introduce a third visual direction unless explicitly requested.

## Required Stack Assumptions

- React
- Tailwind v4
- latest shadcn/ui primitives
- semantic CSS variables for tokens

## Non-Negotiables

- No raw SQL or Node-specific behavior in renderer UI code.
- No ad hoc hex color sprawl in components.
- No placeholder-only inputs.
- No hover-only critical actions.
- No color-only status indicators.
- No decorative charts or hero sections on operational screens.

## Build Order For Any Screen

1. Define the operator’s primary task.
2. Identify required states: loading, empty, success, error, partial, busy.
3. Choose the canonical layout:
   left rail, main workspace, right summary rail.
4. Apply semantic tokens first.
5. Use shadcn primitives and customize to fit the tokens.
6. Add keyboard and focus behavior.
7. Add reduced-motion-safe transitions only where helpful.

## Tailwind Rules

- Prefer semantic classes backed by tokens.
- Prefer consistent spacing steps over arbitrary pixel values.
- Prefer panel layering, borders, and soft shadow over hard visual effects.
- Keep tables and forms compact but readable.

## shadcn Rules

- Use shadcn as a foundation, not as the final look.
- Normalize radius, border, typography, and focus behavior.
- Command/dialog/select/calendar patterns should feel like one system.

## Reservations Screen Rules

- Keep guest details and stay details visible together.
- Keep rate confidence and next action visible.
- Surface room status near assignment choices.
- Preserve user input through recoverable failures.

## Quick Smell Test

A screen is off-style if it feels:

- too startup-like
- too decorative
- too sparse
- too dark without separation
- too dense to scan in under 2 seconds
- too generic to belong to hospitality operations
