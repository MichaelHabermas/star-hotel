# Star Hotel UI Style Guide

This guide is the source of truth for AI agents building UI for Star Hotel.

**Epic E1.5:** Locked directions and scope (including no in-app design lab) are recorded in [DECISIONS.md](./DECISIONS.md#e15-visual-design-and-style-lab-scope); static A/B prototypes live under [style-test/](../style-test/).

It is based on the selected style directions from the design lab:

- `Lakeside Console` for light mode
- `Night Audit` for dark mode

The product context is not a marketing site and not a generic SaaS dashboard. It is a desktop-first operational hotel application used by front-desk staff under time pressure. Every decision should optimize for scan speed, confidence, keyboard flow, and calm professionalism.

## 1. Product Intent

### Core feeling

The interface should feel:

- calm
- fast
- trustworthy
- dense but not cramped
- premium without becoming decorative

The interface should not feel:

- startup-demo flashy
- playful
- glassy for the sake of it
- luxury-brand editorial first, operations second
- dark-mode-by-inversion

### Primary user posture

Assume the main operator is:

- seated at a front desk
- using a laptop or desktop monitor
- switching between keyboard and mouse
- handling interruptions
- moving quickly through reservations, rooms, guest details, and pricing

Design for a user who needs to complete a correct check-in while answering questions, resolving room issues, and keeping a line moving.

## 2. Visual Direction

### Light mode: Lakeside Console

Use light mode as the default production direction.

Characteristics:

- cool steel-blue structure
- soft white and pale blue surfaces
- restrained teal support accent
- clear section boundaries
- minimal visual noise
- operational rather than boutique

This is the default look for most screens.

### Dark mode: Night Audit

Dark mode is a first-class theme, not a fallback.

Characteristics:

- deep navy panels, not pure black
- high-contrast text and dividers
- electric blue focus/primary actions
- warm amber for service emphasis
- recovery and review states that remain obvious in low light

Dark mode should feel purposeful for long overnight sessions and audit work.

## 3. Design Principles

### 3.1 Operational first

Prioritize the work surface over atmosphere.

- Important actions must be obvious.
- Important status must be visible without scrolling.
- Important errors must be recoverable without losing entered data.

### 3.2 Calm density

The UI can be information-dense, but never visually frantic.

- Prefer compact spacing with strong grouping.
- Use subtle borders and layered surfaces instead of heavy decoration.
- Keep one strong accent per screen, not many.

### 3.3 Hospitality, not fintech

The app should feel more human than a finance admin, but still disciplined.

- Keep warmth in typography and tone.
- Do not introduce loud gradients, neon glows, or harsh enterprise severity everywhere.
- Let hospitality show in polish, not ornament.

### 3.4 Keyboard credibility

Every primary workflow should look and behave like it can be driven efficiently with the keyboard.

- predictable focus order
- command-driven patterns where useful
- visible focus styling
- no hidden critical actions behind hover-only patterns

### 3.5 State clarity

Hotel software lives in edge cases. The UI must handle:

- loading
- empty
- partial data
- DB busy / sync busy
- validation errors
- recoverable failures
- success confirmation

Never design only the happy path.

## 4. Color System

Use semantic tokens. Do not hardcode random hex values in components.

### 4.1 Light mode tokens

Use these values as the visual baseline:

```css
--background: #eff5fb;
--background-accent: #dfe9f4;
--foreground: #142033;
--muted-foreground: #5d718b;
--panel: #ffffff;
--panel-muted: #edf3f8;
--border: rgba(36, 61, 88, 0.12);
--border-strong: rgba(36, 61, 88, 0.22);
--primary: #1f4f88;
--primary-strong: #173b66;
--accent: #0f8a8d;
--success: #127b67;
--warning: #c8850c;
--destructive: #cb4a3f;
--info: #2463d7;
```

### 4.2 Dark mode tokens

```css
--background: #09111c;
--background-accent: #101b2a;
--foreground: #edf4ff;
--muted-foreground: #91a7c2;
--panel: #0b1421;
--panel-muted: #111d31;
--border: rgba(153, 180, 212, 0.14);
--border-strong: rgba(153, 180, 212, 0.24);
--primary: #6fa8ff;
--primary-strong: #3b7cff;
--accent: #d4a24a;
--success: #4cd29a;
--warning: #e2b35f;
--destructive: #ff8073;
--info: #79a8ff;
```

### 4.3 Color rules

- Primary is for the main CTA, focus ring family, and selected state.
- Accent is for hospitality detail and secondary emphasis, not the main CTA.
- Success, warning, and destructive colors must always be paired with text or icon cues.
- Avoid pure red/green-only meaning.
- Backgrounds should be layered with surfaces, not giant flat fields of one color.
- Do not use purple as a default accent.

## 5. Typography

### Type roles

- Display and section emphasis: `Fraunces`
- UI and component labels: `Manrope` or `Plus Jakarta Sans`
- Body copy: `Inter`
- Tabular data and operational identifiers: `JetBrains Mono`

### Usage rules

- Use serif display typography sparingly and intentionally.
- Do not set long-form body copy in serif.
- Most UI should still read as sans-serif and highly usable.
- Use mono for confirmation codes, reservation IDs, timestamps, room references, and dense numeric columns.

### Suggested scale

- Page title: `text-3xl` to `text-4xl`
- Section title: `text-xl` to `text-2xl`
- Card title: `text-base` to `text-lg`
- Body: `text-sm` to `text-base`
- Labels/meta: `text-xs` to `text-sm`

### Typography rules

- Body text should not drop below 14px in dense desktop layouts.
- Default line-height should remain readable, around 1.45 to 1.6.
- Keep uppercase labels reserved for metadata and compact field labels.
- Use tabular numbers for pricing, occupancy, times, and metrics.

## 6. Spacing, Shape, and Elevation

### Spacing rhythm

Use a 4px/8px rhythm with these common jumps:

- 4
- 8
- 12
- 16
- 20
- 24
- 32

### Radius

The product should feel modern and refined, not boxy and not bubbly.

- Small controls: 12px to 14px
- Cards and panels: 18px to 20px
- Shell containers / major framing: 28px to 34px
- Pills and chips: fully rounded

### Elevation

Use restrained soft shadows in light mode and depth separation in dark mode.

- Avoid huge glows.
- Avoid Material-style exaggerated floating stacks.
- Use shadow plus border together for major cards.

## 7. Layout Model

### Canonical screen structure

For primary work surfaces, default to:

1. top app bar
2. left contextual rail or filter/status rail
3. central work surface
4. right summary / activity / completion rail

This is the core operational composition.

### Layout rules

- Desktop first.
- Tablet should collapse thoughtfully, not merely shrink.
- Avoid horizontal scroll for whole-page layout.
- Dense tables may scroll internally if headers remain visible.
- Preserve visible summary and next-step information whenever possible.

### Width and density

- Favor wide, breathable desktop layouts.
- Avoid giant empty whitespace that pushes useful context off-screen.
- Favor compact vertical rhythm in operational cards and tables.

## 8. Component Style Rules

### Buttons

Primary buttons:

- use primary background
- strong contrast
- medium-to-bold label weight
- obvious hover, active, disabled states

Secondary buttons:

- quiet surface
- bordered
- readable against both themes

Rules:

- Button height should generally be 40px to 44px minimum.
- Use icon + label for important actions where clarity improves.
- Do not create more than one visually dominant CTA in the same immediate region.

### Inputs

Inputs should feel stable and desk-ready.

- visible labels above fields
- padded input body
- clear borders
- no ultra-light placeholder-only patterns
- clear focus ring

Do not use floating labels.

### Selects, comboboxes, command inputs

These are important in this app.

- Use them for guest lookup, room assignment, and workflow acceleration.
- Keep triggers visually consistent with text inputs.
- Prefer command-dialog patterns for high-frequency search or quick switching.

### Cards and panels

Cards are structural, not decorative.

- use subtle tonal differences between neighboring surfaces
- keep headings compact
- use panel headers for orientation and actions
- avoid giant illustration-led cards on core workflow pages

### Tables

This app will live in tables and dense lists.

Rules:

- sticky headers for longer tables
- zebra striping only if subtle
- row hover must not overpower selection state
- selected rows need a clear persistent state
- numeric columns right-aligned
- status columns should combine icon, tone, and text
- large tables should be virtualized when necessary

### Badges and chips

Use chips for:

- occupancy status
- housekeeping state
- loyalty level
- urgency / review state

Keep them compact and legible. Never rely on badge color alone.

### Dialogs and sheets

Use dialogs for confirmation, exception handling, or short focused tasks.

Do not put the main reservation workflow inside modal stacks.

## 9. State Design

Every major screen should specify these states before implementation:

- loading
- empty
- success
- validation error
- server/API failure
- DB busy
- partial sync / stale room status
- permission/session issue

### State behavior rules

- Loading longer than 300ms should show visible feedback.
- Prefer skeletons over blank cards.
- Validation errors appear near the field and in a top summary when needed.
- DB busy should preserve entered data and tell the user what can still be done.
- Success should confirm the action without making the user decode the result.

## 10. Accessibility Rules

These are mandatory.

- Visible focus states on all interactive elements.
- All icon-only buttons must have accessible names.
- Keyboard order must match the visible order.
- Color contrast must meet WCAG AA at minimum.
- Semantic headings and landmark structure should be preserved.
- Tables need meaningful headers.
- Status must never be conveyed by color alone.
- Reduced motion must be respected.

For dense operator screens, accessibility is a usability requirement, not a compliance afterthought.

## 11. Motion Rules

Motion should communicate change, not decorate the app.

- 150ms to 250ms for most interactions
- opacity and transform preferred
- no width/height animation for core layout
- subtle hover lift is acceptable
- focus and selection transitions should feel quick
- loading shimmer/skeleton is acceptable

Avoid:

- floating decorative motion
- exaggerated spring physics
- slow cinematic transitions

## 12. Tailwind v4 Guidance

### Tailwind philosophy

Use Tailwind v4 as the implementation layer for tokens and composition, not as an excuse for ad hoc styling.

Rules:

- Put theme tokens in CSS variables.
- Map those variables into Tailwind-friendly utilities.
- Prefer semantic utility groupings over random one-off values.
- Avoid raw hex values directly inside components when a semantic token exists.

### Theme structure

Prefer a token-first setup in your global CSS using Tailwind v4 CSS-first patterns.

Recommended categories:

- background
- foreground
- panel
- panel-muted
- border
- primary
- primary-foreground
- accent
- success
- warning
- destructive
- ring

### Utility usage

Prefer patterns like:

- `bg-background`
- `text-foreground`
- `bg-panel`
- `border-border`
- `text-muted-foreground`
- `bg-primary`

Do not build screens with dozens of arbitrary values unless the value is truly unique and justified.

## 13. shadcn Guidance

Use the latest shadcn components as the baseline UI kit, but adapt them to this design language.

### Good fits for this project

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Combobox` / command-based search patterns
- `Dialog`
- `Sheet`
- `Table`
- `DropdownMenu`
- `Tooltip`
- `Calendar`
- `Popover`
- `Tabs`
- `Badge`
- `Skeleton`
- `Sonner` or toast pattern if the project uses it

### Customization rules

- Default shadcn styles will likely be too generic.
- Override radius, color tokens, border tone, and typography so components match this guide.
- Avoid stacking too many shadcn primitives in ways that create visual clutter.
- Keep spacing tighter for operator screens than for marketing or content apps.

### Component behavior guidance

- Command/search surfaces should be central to the workflow.
- Tables should be production-grade, not demo-grade.
- Calendar/date controls must feel precise and readable.
- Toasts should confirm, not narrate excessively.

## 14. React Implementation Guidance

### Structure

Prefer small, focused components with clear purpose.

Separate:

- page shell
- filters / side rail
- data table or list
- detail / edit form
- summary rail
- transient state UI

### State

- Keep server-derived data separate from transient form state.
- Preserve in-progress edits during recoverable errors.
- Avoid large monolithic page components with tangled responsibilities.
- Prefer explicit state names over boolean soup.

### Performance

- Profile before optimizing.
- Virtualize long lists or tables when counts are high.
- Preserve row identity and key stability.
- Avoid unnecessary rerenders in dense surfaces.
- Use transitions carefully for non-urgent UI updates when appropriate.

### Interaction

- Keep keyboard shortcuts discoverable.
- Maintain stable focus after async actions.
- Restore focus intelligently after dialog close or validation failure.

## 15. Screen-Specific Guidance

### Reservations / check-in

This is the reference screen for the visual system.

Must include:

- room selection context
- guest identity and stay dates
- rate/tax/folio confidence area
- notes or special requests
- visible next step
- meaningful recovery states

### Rooms

Rooms screens should feel grid-and-status driven.

- occupancy and housekeeping need immediate legibility
- filters should be lightweight
- room condition should be scannable from a distance

### Guests

Guest views can be slightly calmer and more form-oriented, but must remain aligned with the operational system.

### Dashboard / shell

Do not over-design the dashboard. It should orient and accelerate, not compete with the workflow screens.

## 16. Copy Tone

UI copy should be:

- calm
- direct
- specific
- recovery-oriented

Prefer:

- “Room status is still syncing. You can finish guest details now and assign the room when sync completes.”

Avoid:

- “Something went wrong.”
- “Oops!”
- vague technical failure text without an action path

## 17. Explicit Anti-Patterns

Do not do these:

- generic purple SaaS styling
- large glossy glassmorphism as the main identity
- oversized KPI cards that waste space
- tiny low-contrast table text
- multiple competing accent colors on one screen
- placeholder-only forms
- icon-only critical actions without labels
- heavy dark mode that collapses all surfaces into black
- using color alone to express room status
- creating beautiful happy paths with no busy/error states

## 18. Agent Workflow Rule

When building any new UI, agents should:

1. Identify the screen type and main task.
2. Start from this style guide before inventing a look.
3. Reuse Lakeside Console patterns for light mode.
4. Reuse Night Audit patterns for dark mode.
5. Define the full state matrix.
6. Map UI to semantic tokens before writing component classes.
7. Use shadcn primitives only after aligning them to this guide.
8. Preserve keyboard and accessibility behavior as first-order concerns.

If a design decision is ambiguous, favor operational clarity over visual novelty.
