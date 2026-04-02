# TODOS (deferred from /autoplan)

Items below were explicitly deferred or cherry-pick candidates. Ordered by dependency risk.

**Resolved (Epic E0):** T2, T4, T5 are recorded in [DECISIONS.md](./DECISIONS.md). Do not duplicate rationale here.

| ID | What | Why defer | Unblock | Resolved |
|----|------|-----------|---------|----------|
| T1 | **State matrix doc** (loading / empty / error / partial per screen) | Needs first implemented routes | After MVP form chosen | — |
| T2 | **Primary workflow ranking** (front desk vs night audit vs reporting) | Was product decision | E8 implementation order | [DECISIONS.md](./DECISIONS.md) (T2) |
| T3 | **`.mdb` parity verification suite** (golden export + diff) | Blocked on migration fork T4 | After T4 **and** import path if Phase 2 runs | [DECISIONS.md](./DECISIONS.md) (T4) |
| T4 | **Decide: clean install vs day-one import** | Was open in PRE-SEARCH / Design | Before schema freeze | [DECISIONS.md](./DECISIONS.md) (T4) |
| T5 | **Report scope contract** (receipt-only vs grouped financial) | Was open question | Before report sprint | [DECISIONS.md](./DECISIONS.md) (T5) |
| T6 | **Packaging smoke CI** (Windows installer + native module) | Post-MVP per design doc order | After first end-to-end run | — |
| T7 | **Telemetry PII policy** (redaction, env gating, replay opt-in) | Codex flagged over-broad logging | Before Sentry/PostHog wire | [T7-TELEMETRY-PII.md](./T7-TELEMETRY-PII.md) (Epic E7) |
| T8 | **Competitive one-pager** (why not SaaS PMS) | Not required for grade; helps narrative | Optional before demo video | — |
