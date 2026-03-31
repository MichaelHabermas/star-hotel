# Design: StarHotel VB6 → Electron modernization

Generated from `/office-hours` (builder mode), 2026-03-31  
Branch: `main`  
Repo: `star-hotel`  
Status: APPROVED (approach locked)  
Mode: Builder

## Problem Statement

Modernize the legacy **Star Hotel** system (VB6 + Microsoft Access) into a **production-grade local desktop app**: Electron, React 19, Tailwind v4, shadcn/ui, Express in the main process, SQLite via **better-sqlite3** with WAL, strict IPC via **contextBridge**, and **functional parity** with the original application within the sprint described in `VB6-Hotel-App-Modernization-Project-specs.md`.

The open problem for *this* session was not “which stack” (fixed by the spec) but **how to sequence work** so it stays **gradable**, **learnable**, and **credible to a skeptical technical audience**—specifically a **hiring partner in tech at a major hotel conglomerate** who will judge **speed and product feel**, not slides.

## What Makes This Cool

- **“Real software,” not a homework UI:** polished loading/empty/error paths, navigation that does not jank, a demo you do not apologize for (**B**).
- **Interview-ready depth:** ability to explain **IPC → Express → SQLite → packaging** cold (**C** as a minor).
- **Proof, not vibes:** Vitest-backed business logic extracted from `.bas` modules and schema-level constraints—not only UI validation.

## Constraints

- **Sprint and gates:** mandatory **pre-search**, **24h MVP gate** (shell, SQLite, Express, one form parity, full CRUD through the stack, Vitest minimums, secure IPC), then broader UI/observability and final packaging per the spec.
- **Stack is non-negotiable:** TypeScript strict, pnpm, Vite, Tailwind v4, shadcn, Zod at boundaries, no raw SQL in React, no `nodeIntegration` in renderer, `contextIsolation` on.
- **Legacy ground truth:** behavior and data shapes ultimately trace to `pyhoon/star-hotel-vb6` and `StarHotel.mdb` (see `PRE-SEARCH.md`).
- **Personal priority order when tradeoffs bite:** **UX → parity lab → migration tooling → ops**—still subject to rubric must-haves.

## Premises (agreed for planning)

1. **North star:** Success for *your* goals is **interview-grade polish and speed** on a **credible vertical slice**, plus enough depth to explain the architecture—not “deployed to 500 hotels.”
2. **Rubric vs personal 10x:** You still satisfy **graded** requirements (MVP gate, tests, IPC security) even when personal ordering prefers UX first.
3. **Migration fork (decide early):** **Clean install** vs **day-one import of legacy `StarHotel.mdb`** changes validation, seed data, and how hard SQLite constraints must be in week one. Track the decision explicitly.
4. **No framework substitution:** Stay on the mandated stack; optimize **within** it (bundling, main-thread discipline, query patterns).

## Landscape (generic)

Industry material often favors **strangler / phased** cutovers over **big-bang** for large legacy systems because of hidden business rules and timeline risk. This sprint still ships **one modern application** on a fixed deadline; the workable synthesis is **“strangler inside the plan”**: **vertical slices**, **module-by-module parity**, and **tests per workflow**, not two production systems in parallel.

Common Electron + SQLite guidance: **local-first** data, **SQLite in main**, **IPC** for renderer access, **heavy work off the UI thread** where it matters.

*Codex second opinion was optional and was not run before locking the approach.*

## Approaches Considered

### Approach A — MVP gate, then beauty pass

- **Summary:** Clear the **spec MVP checklist** first with acceptable UI, then concentrate time on startup, navigation, and one **hero** workflow so the demo feels fast.
- **Effort:** S · **Risk:** Med (polish squeezed if the gate slips)
- **Pros:** Low risk of missing disqualifying requirements; predictable order.
- **Cons:** “Wow” UX and observability can feel **bolted on** at the end.

### Approach B — Performance budget from day one

- **Summary:** Define **measurable** targets early (cold start, IPC round-trip, critical query latency) and **instrument** them; pair features with **loading / empty / error** states so speed is **felt**, not accidental.
- **Effort:** M · **Risk:** Low–Med
- **Pros:** Aligns with a **hotel-tech** audience and supports the **C** story (you can explain *how* you proved performance).
- **Cons:** Upfront wiring; easy to over-build **metrics** vs **shipping**.

### Approach C — One hero module, museum quality

- **Summary:** Fewer screens, but one path (e.g. reservations + room grid) is **deeply** polished—keyboard nav, table performance, tight feedback; parity tests **for that path** first.
- **Effort:** M · **Risk:** Med–High for **full** parity by final deadline (breadth vs depth).
- **Pros:** Strong “this is real product” signal.
- **Cons:** Rubric may require **breadth** across modules; needs an explicit **gap list** against the spec.

## Recommended Approach — **B + A** (selected)

**Sequence (A):** Treat the **24h MVP gate** as the spine—prove Electron + Express + SQLite + IPC + one real form + CRUD + tests before expanding surface area.

**Instrumentation and UX discipline (B):** From early in the MVP window, define a small **performance budget** (aligned with spec targets where applicable: startup, query latency, IPC overhead) and **measure** it in dev (timestamps, simple harness, or dev-only panel—full Sentry/PostHog can follow the spec’s “early submission” phase if time is tight). Every meaningful screen gets intentional **loading, empty, and error** states so “fast” reads as **product quality**, not only milliseconds.

**Use C sparingly:** Apply **museum-quality** polish to **one** chosen flow after the gate is green, not at the expense of security, tests, or schema integrity.

## Open Questions

From `PRE-SEARCH.md` and the spec—resolve explicitly:

1. **Reports:** Complex grouped reports vs simple receipts/HTML print/PDF—what does parity require for **your** submission?
2. **Deployment topology:** Shared network drive vs standalone machine—impacts paths, locking assumptions, and how you tell the SQLite story.
3. **Data:** **Clean slate** vs **mandatory one-time migration** of `StarHotel.mdb` for day one—drives migration scripts and verification.

## Success Criteria

- **MVP gate (spec):** Secure IPC, migrated/created SQLite schema with WAL, Express routing from main, ≥1 legacy form parity in React + Tailwind v4, end-to-end CRUD, Vitest with minimum tests on extracted logic, stable dev/build.
- **Personal bar:** Demo where a **hotel-tech hiring partner** experiences **fast cold start, smooth navigation, and a complete happy-path workflow** without excuses; you can **walk the architecture** credibly.
- **Integrity:** No silent divergence on billing/date edge cases you claim parity for—either tested or explicitly out-of-scope with a written list.

## Distribution Plan

- **Deliverable:** Packaged desktop installer per spec (Electron Builder / equivalent), **public GitHub** link, README with dev/test/build commands, architecture PDF, demo video, ROI doc, open-source contribution artifact—per `VB6-Hotel-App-Modernization-Project-specs.md`.
- **CI/CD:** Not prescribed in detail here; add **release builds** and **artifact uploads** as soon as the app runs end-to-end so packaging issues surface early.

## Next Steps (build order)

1. **Scaffold** create-electron-vite (or equivalent) + strict TS + ESLint/Prettier; confirm **Hello World** runs.
2. **Tailwind v4** + shadcn baseline; global error boundary in React.
3. **SQLite** + schema from Access mapping; WAL; migrations/version table as needed.
4. **Express** in main; first read-only API; then mutations with **Zod** validation.
5. **IPC** `preload` + typed bridge; renderer calls only through it.
6. **One form** end-to-end parity + **Vitest** on extracted pure functions from `.bas` logic.
7. **Performance budget** checklist + dev measurement for startup and one critical path.
8. **Expand UI** toward full parity; **reports** per clarified scope; **Sentry/PostHog/crashReporter** per spec timeline.
9. **Packaging**, demo video, docs, OSS contribution—per submission requirements.

## What I noticed about how you think

- You named a **specific audience** (“hiring partner for the tech department of a major hotel conglomerate”) and a concrete **wow** bar: **“lightning fast load, navigation, and functionality.”**
- When “closest competitor” felt impossible, you did not fake certainty—you said you were **lost**, then accepted a **framing** (“internal line-of-business rewrite”) that matches the work.
- You ranked **10x** priorities honestly (**UX → parity lab → migration → ops**), which is how you avoid building **ops theater** before the product **feels** fast.

## References

- `docs/PRE-SEARCH.md` — legacy folder map, schema sketch, control mapping, clarifying questions.
- `docs/VB6-Hotel-App-Modernization-Project-specs.md` — authoritative stack, gates, deliverables, and evaluation framework.
