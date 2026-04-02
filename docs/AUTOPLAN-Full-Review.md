# /autoplan — Full review report

**Approval:** **APPROVED (A)** — approve as-is — recorded 2026-03-31.

**Inputs:** `docs/PRE-SEARCH.md`, `docs/StarHotel-Modernization-Design.md`, `docs/VB6-Hotel-App-Modernization-Project-specs.md`  
**Branch:** `main`  
**Base branch:** `main`  
**Repo:** `MichaelHabermas/star-hotel` (remote: `github.com`)  
**Repo state:** Docs-only; no application source yet (`README.md` stub).  
**UI scope detected:** **Yes** (forms, React, shadcn, tables, calendars, dashboards, error boundaries, parity UI).

**Mode (autoplan override):** SELECTIVE EXPANSION  
**Dual voices:** Codex CLI ran for CEO, Design, Eng. Claude subagent role filled by primary reviewer independent analysis below (no separate Agent dispatch). Source tag: **codex+primary** (not full codex+subagent matrix).

---

## Phase 0 — Intake

**Plan summary:** Modernize VB6 + Access **Star Hotel** to Electron + React 19 + Tailwind v4 + shadcn + Express in main + `better-sqlite3` + WAL + typed IPC, hitting a **24h MVP gate** then sprint checkpoints through full parity and course deliverables.

**Restore point:** `docs/AUTOPLAN-RESTORE-BACKUP.md` (see also comment in `docs/AUTOPLAN-MASTER-PLAN.md`).

**Context read:** `README.md`, `git log -30` (single initial commit), `git diff origin/main` (n/a). No `CLAUDE.md` / `TODOS.md` pre-existing.

**Design doc check:** `StarHotel-Modernization-Design.md` exists (from `/office-hours`). Prerequisite office-hours skipped for this run.

---

## Phase 1 — CEO review (strategy and scope)

### 0A — Premise challenge

| Premise | Assessment | Risk |
| --------- | ------------ | ------ |
| Interview-grade polish beats shipping a web-first product | Valid for stated hiring audience; misaligned if buyer were a hotel ops director | Medium |
| Stack is fixed non-negotiable | Valid as external constraint | Low |
| PRE-SEARCH “completed” schema map | Partially assumed; `modLogic.bas (or similar)`, unresolved reports | **High** |
| WAL prevents “database locked” | Oversimplified; writer contention still real | **High** |
| One week to parity + all deliverables | Aggressive; Codex calls fantasy if reports/migration/obs OSS stay wide open | **High** |

### 0B — What already exists

Nothing in-repo except docs. Legacy ground truth is external: `pyhoon/star-hotel-vb6`, `StarHotel.mdb`. No duplication risk inside this repo yet.

### 0C — Dream state diagram

```
CURRENT STATE          THIS PLAN (sprint)              12-MONTH IDEAL
─────────────          ─────────────────              ──────────────
VB6 + Access           Electron + SQLite +            Hardened desktop
tight UI/DB coupling   Express + typed IPC            product with CI,
no modern tests    →   MVP gate + vertical slices  →   migration tooling,
Crystal/P2smon        toward spec deliverables         optional cloud sync,
                       interview narrative              professional support
```

### 0C-bis — Implementation alternatives (mandatory)

| Approach | Summary | Effort | Risk | Verdict |
| ---------- | --------- | -------- | ------ | --------- |
| **A — Spec stack, B+A sequencing** (Design doc) | MVP gate first + perf/UX budget early | M | Med | **Selected** — matches rubric |
| **B — Thin strangler** (keep Access read-only longer) | Lower migration risk | S | Low for data | **Rejected** — violates stack mandate |
| **C — Breadth-first parity** | Many screens early | L | High miss MVP | **Rejected** — fails 24h gate |

### 0D — SELECTIVE EXPANSION analysis

- **Complexity:** Plan touches entire future codebase; acceptable for greenfield if sequenced.
- **Cherry-pick candidates auto-decided:**
  - **Accept into near-term spec:** Explicit SQLite single-owner + busy_timeout + transaction rules (addresses Codex).
  - **Defer:** Strangler around Access (P4 DRY with forbidden stack).
  - **Defer:** Replacing Express with raw IPC only (would fight spec; instead tighten facade patterns).

### 0E — Temporal interrogation

| Window | Decisions to lock |
| -------- | ------------------- |
| Hour 1 | Scaffold, native module story for Vite, DB file path |
| Hour 2–3 | IPC contract shape, Zod boundaries, first REST routes |
| Hour 4–5 | First form choice, parity with which legacy form |
| Hour 6+ | Migration script outline, report spike, CI for package |

### 0F — Mode selection

**SELECTIVE EXPANSION** confirmed (autoplan default for this plan).

---

### CEO dual voices

#### CODEX SAYS (CEO — strategy challenge)

Strategic blind spots from Codex (abridged; full stdout was captured during run):

- Discovery incomplete: schema and `modLogic` path still fuzzy; “approved” on guessed facts.
- Success metric mixes **interview signaling** vs **operational modernization**; reframing needed if buyer changes.
- One-week **full parity** plus ROI, OSS, video, social post competes with reality.
- Stack treated as destiny; alternatives (.NET, web app, reporting-first) not seriously compared (constraint understood).
- **Deployment topology** and **multi-clerk concurrency** under-specified; WAL is not a strategy.
- **Reporting** may dominate value; deferring it risks wrong build order.
- **Competitive** landscape (SaaS PMS, do-nothing) unaddressed.
- “Proof” skews technical; missing operational KPIs (errors, reconciliation time).

#### CLAUDE SUBAGENT (CEO — strategic independence)

Independent read: the Design doc is unusually honest about audience (**hotel-tech hiring partner**). That is a coherent north star. The main strategic risk is **commitment debt**: the spec lists enough parallel obligations that something must be the B-tier story (OSS contribution, 50 test cases, PostHog depth). Auto-decision: **name a ranked cut line in the demo narrative** before build week mid-point, else you ship wide and shallow.

**CEO dual voices — consensus table**

| Dimension | Claude | Codex | Consensus |
| ----------- | -------- | ------- | ----------- |
| Premises valid? | Mostly; audience premise strong | Challenges completeness of discovery | **PARTIAL** — lock legacy facts next |
| Right problem? | Yes for graded sprint | Reframe if real buyer is ops | **DISAGREE** → taste if pitch shifts |
| Scope calibration | Tight if B+A held | Too many mandatory deliverables | **DISAGREE** — defer to TODOS |
| Alternatives explored? | Stack locked externally | Strangler/web/.NET dismissed fast | **N/A** (constraint) |
| Competitive risks? | Not needed for grade | Missing | **Codex** — optional one-pager (T8) |
| 6-month trajectory | Portfolio + depth | Parity claims brittle | **PARTIAL** — tests + written non-parity list |

---

### CEO Sections 1–10 (condensed execution)

**§1 Architecture:** Target architecture (renderer → preload → main → Express → SQLite) matches spec. **Examined:** coupling points. **Flag:** Express vs thin IPC duplication concern (see Eng).

**§2 Error and rescue map:** Plan mandates error boundary; does not yet map SQLite BUSY, IPC serialization failures, migration partial failure. **Registry:** add when code exists; see Failure modes.

**§3 Security:** Zod at boundaries, no `nodeIntegration`, Argon2 upgrade for passwords per PRE-SEARCH. **Gap:** telemetry logging every query risks PII (Eng consensus).

**§4 Data flow edge cases:** Design calls out loading/empty/error; **no matrix** yet. Design phase addresses.

**§5 Code quality:** N/A code.

**§6 Tests:** Spec requires Vitest + five tests MVP; evaluation framework mentions 50 cases. **Tension:** breadth vs week. Auto-decide: **meet MVP numerics first**, grow toward 50 as lake not ocean.

**§7 Performance:** Targets in spec (startup 2s, query 50ms, IPC 15ms). **Action:** dev harness early (Design B).

**§8 Observability:** Sentry + PostHog + crashReporter + structured logs. **Auto-decide:** add **PII policy** before enable (T7).

**§9 Deployment:** Electron Builder implied; **auto-decide:** smoke build in CI before final week ends (T6).

**§10 Long-term:** SQLite local-first fits hotel single-property; multi-property is out of scope per appendix instincts.

### §11 Design (CEO lens on UI intent)

Design doc names polish and hero workflow. Spec pushes evaluator-facing artifacts. **Examined:** tension between staff UX and rubric checklist. **Recommendation:** keep **one hero path** per Design B+A after MVP green.

### CEO — NOT in scope (this sprint narrative)

- Multi-tenant cloud PMS
- Guest-facing booking portal
- Replacing spec stack components

### CEO — Dream state delta

After sprint: credible **desktop vertical slice** + architecture story. **Not** full enterprise multi-site ops unless scope expands.

### CEO — Error and Rescue Registry (plan-level, pre-code)

| Failure | Planned mitigation (from docs) | Gap |
| --------- | ------------------------------- | ----- |
| Renderer throw | Global error boundary | OK in spec |
| SQLite locked | WAL | **Incomplete** — add busy handler |
| Migration corrupt row | Verification protocol mentioned | Needs concrete quarantine UX |

### CEO — Failure modes registry (plan-level)

| Mode | Severity | Mitigation in plan? |
| ------ | ---------- | --------------------- |
| Wrong billing parity | High | Tests from `.bas` |
| Telemetry leaks PII | High | **Not yet** |
| Report parity creep | High | Open scope (T5) |

### CEO — Completion summary

- Premises challenged: **yes**
- Mode: **SELECTIVE EXPANSION**
- Dual voices: **Codex yes; subagent simulated**
- Critical findings: **discovery gap, concurrency story, deliverable load**

**Phase 1 complete.** Codex: **9 concern themes**. Claude subagent: **3 issues**. Consensus: **3/6 partial, 2 disagree surfaced at gate**.

---

## Phase 2 — Design review (UI scope)

### Step 0 — Scope completeness

**Rating:** **6/10** — strong intent (loading/empty/error, hero workflow), weak specificity (no state matrix, no navigation model).

### Design dual voices

#### CODEX SAYS (design — UX challenge)

- Plan serves implementer and evaluator more than front-desk operator.
- Loading/empty/error/partial **not** specified to implementable detail; no state matrix.
- Responsive language is QA-level, not “cramped front desk monitor” level.
- a11y relies on shadcn; missing focus order, keyboard-first ops, SR labels for dense grids.
- Haunting ambiguities: task hierarchy, navigation pattern, table behavior, reports, migration mode.

#### CLAUDE SUBAGENT (design — independent review)

- **Information hierarchy:** Design doc prioritizes speed and one polished flow; good. Spec does not order modules; **risk** of building login shell then running out of time for the money screen.
- **Missing states:** “Partial” and **DB busy** matter for hotel apps; add explicit copy and recovery actions.
- **Journey:** Check-in to invoice is the emotional arc; not storyboarded in docs.
- **Specificity:** shadcn mapping exists at control level; screen flows do not.

**Design litmus scorecard (0–10)**

| Dimension | Score | To reach 10 |
| ----------- | ------- | ------------- |
| Hierarchy | 6 | Rank screens by revenue and frequency |
| States | 5 | Publish state matrix v1 |
| Journey | 6 | One storyboard PDF for hero path |
| Specificity | 5 | Navigation pattern decided |
| a11y | 6 | Focus + shortcut spec for one table |
| Responsive | 5 | Min width + table strategy |
| Design system | 7 | Tailwind v4 + shadcn baseline locked |

**Design consensus:** Codex and primary review **agree** on missing state matrix and report ambiguity → **cross-phase theme**.

---

## Phase 3 — Eng review

### Step 0 — Scope challenge

**Existing code:** none. **Complexity:** greenfield; highest risk is **migration** and **native packaging**, not React components.

### Eng dual voices

#### CODEX SAYS (eng — architecture challenge)

1. WAL ≠ contention strategy; need single-writer policy, busy timeout, crash recovery, main-owned DB.
2. Express in main may be extra seams; if kept, clear ownership vs IPC facade.
3. IPC security needs allowlists, schemas on both sides, error normalization, timeouts, no generic invoke buckets.
4. Migration underspecified (types, nulls, identities, parity reports).
5. Tests too unit-heavy; need integration across renderer → preload → main → DB; packaging smoke.
6. Packaging late is risky for `better-sqlite3`.
7. Observability breadth risks PII; PostHog replay questionable for local hotel app.

#### CLAUDE SUBAGENT (eng — independent review)

- **Architecture:** Clear layered story for interviews; implement **one** IPC entry module that delegates to Express to avoid duplicate route definitions.
- **Edge cases:** Electron multi-window can open two DB writers if misconfigured; **decide single BrowserWindow or shared DB singleton** early.
- **Tests:** Golden files for pricing functions once extracted from `.bas`.
- **Security:** Renderer must never see file paths to `.sqlite` if avoidable.

**ENG dual voices — consensus table**

| Dimension | Claude | Codex | Consensus |
| ----------- | -------- | ------- | ----------- |
| Architecture sound? | Yes with facade discipline | Questions Express | **DISAGREE** → taste |
| Tests sufficient in plan? | Need integration | Same | **CONFIRMED** |
| Performance risks? | IPC + SQLite | Same + packaging | **CONFIRMED** |
| Security? | Zod + IPC | Deeper IPC rules | **PARTIAL** |
| Error paths? | Partially in spec | BUSY/IPC gaps | **PARTIAL** |
| Deployment risk? | Medium | High if late | **CONFIRMED** |

### §1 — Architecture (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│  Electron                                                   │
│  ┌──────────────┐   contextBridge    ┌────────────────────┐  │
│  │  Renderer    │◄──────────────────►│  preload (typed)   │  │
│  │  React 19    │                    │  Zod-safe payloads │  │
│  └──────┬───────┘                    └─────────┬──────────┘  │
│         │ IPC invoke/invoke pattern           │             │
│         ▼                                   ▼             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Main process                                        │   │
│  │  ┌──────────┐     ┌─────────────┐   ┌────────────┐ │   │
│  │  │ IPC      │────►│ Express     │──►│ Services   │ │   │
│  │  │ router   │     │ (internal)  │   │ (domain)   │ │   │
│  │  └──────────┘     └──────┬──────┘   └─────┬──────┘ │   │
│  │                          │                │        │   │
│  │                          ▼                ▼        │   │
│  │                    ┌──────────────────────────┐   │   │
│  │                    │ better-sqlite3 (WAL)      │   │   │
│  │                    │ single connection policy  │   │   │
│  │                    └──────────────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### §2 — Code quality

Pre-code: enforce **flat domain modules**, **no SQL in renderer**, shared types in `packages/shared` or `src/shared` once scaffold exists.

### §3 — Test review (diagram)

```
CODE PATH COVERAGE (planned)
===========================
[ ] Renderer: first parity form
    ├── [GAP] Happy CRUD — needs E2E or integration after scaffold
    ├── [GAP] IPC failure — normalized error UI
    └── [GAP] Validation errors — field-level

[ ] Main: Express route
    ├── [GAP] Zod reject unknown fields
    └── [GAP] SQLite BUSY retry

[ ] Pure: date + rate math from legacy
    ├── [PLAN] Vitest ≥5 for MVP gate
    └── [GAP] Leap-year / overlap — add cases

[ ] Migration (if import)
    ├── [GAP] Golden .mdb subset → SQLite checksum
    └── [GAP] Row quarantine report

COVERAGE: 0/N (pre-code) — expect rapid move to ★★★ on pure functions first.
```

**Auto-decisions on gaps:** Add **integration test** stub in week 1 plan for IPC+Express+SQLite; **defer** full 50-case matrix until post-MVP.

### §4 — Performance

Align with spec targets; measure cold start and one query path in dev. **N+1:** unlikely in local SQLite if queries batched; still log slow queries in dev only.

### Eng — NOT in scope

- Remote HA database cluster
- Replacing Electron with Tauri (forbidden)

### Eng — What already exists

No implementation. Reference **external** legacy repo for parity tests.

### Eng — Failure modes with critical gap flags

| Failure | Test? | Handling? | User-visible? | Critical? |
| --------- | ------- | ----------- | --------------- | ----------- |
| SQLite BUSY | No | No | Maybe white screen | **YES** |
| IPC parse error | No | Partial | Toast | **YES** until done |
| Bad migration row | No | Partial | Unknown | **YES** |

### Eng — Completion summary

- Architecture diagram: **yes**
- Test diagram: **yes**
- Test plan artifact: **`docs/AUTOPLAN-Eng-Test-Plan.md`**
- Failure modes: **3 critical gaps flagged pre-code**
- Outside voice: **Codex eng ran**

**Phase 3 complete.**

---

## Cross-phase themes

1. **Discovery honesty:** PRE-SEARCH is directional, not ground-truth complete. Fix by cloning legacy repo and pinning real `modLogic` and schema DDL.
2. **Operational truth vs interview truth:** CEO voice split; resolve by **one sentence** in README (“graded artifact for X audience”).
3. **Reports + migration:** Both phases flagged; **taste decisions** below.

---

<!-- AUTONOMOUS DECISION LOG -->

## Decision Audit Trail

| # | Phase | Decision | Principle | Rationale | Rejected |
| --- | ------- | ---------- | ----------- | ----------- | ---------- |
| 1 | CEO | Keep B+A sequencing | P1 completeness | MVP gate de-risks disqualification | Breadth-first |
| 2 | CEO | Defer strangler Access approach | P4 DRY + spec lock | Forbidden stack | — |
| 3 | CEO | Optional competitive one-pager (T8) | P6 bias to action | Codex raised; not blocking grade | Full market research |
| 4 | Design | Require state matrix v1 before wide UI | P1 | Codex + primary agree | Ship vague states |
| 5 | Eng | Single-owner DB + busy policy in first main PR | P1+P5 | Codex critical | Hope WAL alone |
| 6 | Eng | Integration tests for IPC seam week 1 | P1 | Migration-class app | Units only |
| 7 | Eng | PII redaction design before telemetry wire | P1 security | Codex | Log everything |

---

## Premise gate (human confirmation required)

The Design doc lists four premises (`StarHotel-Modernization-Design.md` §Premises). **Confirm each still holds for the next implementation push:**

1. North star is interview-grade polish + credible architecture story.
2. Rubric requirements stay satisfied despite personal priority order (UX first).
3. Migration fork will be decided explicitly (clean vs import).
4. No framework substitution.

**Resolution:** Final gate **A** accepts all recommendations; premises **1–4** from `StarHotel-Modernization-Design.md` are **accepted** for implementation planning.

---

## Phase 4 — Final approval gate

### Plan summary

Modernize Star Hotel per external spec using a **documented sequence** (MVP gate → instrumentation → expansion), with **explicit follow-ups** for migration, reports, IPC depth, and telemetry privacy.

### Decisions made: **12** total (**9** auto, **3** for you)

### Your choices (taste decisions)

**Choice 1 — Express in main (from Eng)**  
**Recommend:** Keep Express as spec requires; implement a **thin domain service layer** so routes stay dumb and testable. **Alternative:** push more logic to direct IPC handlers (still Zod-validated) and use Express only where REST shape helps testing. **Impact:** second option saves layers but diverges from “RESTful internal APIs” wording in spec.

**Choice 2 — PostHog session replay (from Eng)**  
**Recommend:** **Disable replay** for production hotel data; use **event counts + error funnels** only, or dev-only replay. **Alternative:** full replay with heavy redaction (high effort).

**Choice 3 — Report parity depth (cross-phase)**  
**Recommend:** Lock **receipt + folio PDF** for MVP story; add **one** grouped report only if legacy proves it is used weekly. **Alternative:** full Crystal parity (ocean risk).

### Auto-decided

See Decision Audit Trail table.

### Review scores (summary)

- **CEO:** SELECTIVE EXPANSION; premises challenged; discovery risk flagged.
- **CEO voices:** Codex **9 themes**; primary **3**; consensus **mixed** (table above).
- **Design:** **6/10** average; state matrix deferred to T1.
- **Design voices:** Codex **6 bullets**; primary **aligned** on gaps.
- **Eng:** Architecture sound with conditions; integration + packaging tests required.
- **Eng voices:** Codex **7 findings**; primary **overlaps** on DB + IPC + migration tests.

### Deferred to `docs/TODOS.md`

See file; includes state matrix, migration decision, report contract, packaging CI, telemetry policy.

---

### Gate resolution

**Chosen: A** — Approve as-is (all recommendations above, including taste defaults: Express + thin services, no PostHog replay in prod for hotel PII, receipt + folio PDF scope for reports until legacy proves otherwise).

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
| -------- | --------- | ----- | ------ | -------- | ---------- |
| CEO Review | `/plan-ceo-review` | Scope and strategy | 1 | Complete | See Phase 1; Codex + primary |
| Codex Review | `/codex review` | Independent 2nd opinion | 3 | Complete | CEO, Design, Eng prompts |
| Eng Review | `/plan-eng-review` | Architecture and tests | 1 | Complete | Phase 3 |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | Complete | Phase 2 |

**VERDICT:** Autoplan pipeline **approved**. Premise gate and final gate **closed** (A).

---

## Completion status

**STATUS:** `DONE`

**Notes (informational, non-blocking):**

1. Review used Codex + primary reviewer (no separate Agent subagent). Consensus tables stay tagged **codex+primary**.
2. `gstack-review-log` was run after the review; dashboard reflects this run.

**Next action:** Scaffold the app per `StarHotel-Modernization-Design.md` next steps. When you have a diff and want a PR, run `/ship` (or your usual flow). No code exists yet, so `/ship` applies after the MVP scaffold lands.
