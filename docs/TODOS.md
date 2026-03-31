# TODOS (deferred from /autoplan)

Items below were explicitly deferred or cherry-pick candidates. Ordered by dependency risk.

| ID | What | Why defer | Unblock |
|----|------|-----------|---------|
| T1 | **State matrix doc** (loading / empty / error / partial per screen) | Needs first implemented routes | After MVP form chosen |
| T2 | **Primary workflow ranking** (front desk vs night audit vs reporting) | Product decision; spec is rubric-heavy | Stakeholder or legacy usage observation |
| T3 | **`.mdb` parity verification suite** (golden export + diff) | Blocked on migration fork T4 | After T4 |
| T4 | **Decide: clean install vs day-one import** | Open in PRE-SEARCH / Design | Before schema freeze |
| T5 | **Report scope contract** (receipt-only vs grouped financial) | Open question | Before report sprint |
| T6 | **Packaging smoke CI** (Windows installer + native module) | Post-MVP per design doc order | After first end-to-end run |
| T7 | **Telemetry PII policy** (redaction, env gating, replay opt-in) | Codex flagged over-broad logging | Before Sentry/PostHog wire |
| T8 | **Competitive one-pager** (why not SaaS PMS) | Not required for grade; helps narrative | Optional before demo video |
