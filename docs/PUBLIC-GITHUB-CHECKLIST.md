# Public GitHub readiness (Epic E10)

Use this before marking the repo **public** or submitting the course bundle.

## Repository

- [ ] **LICENSE** present at repo root ([LICENSE](../LICENSE)); matches intended use (e.g. MIT).
- [ ] **README** documents install, test, build, package, and links to submission docs.
- [ ] **No secrets:** `.env` gitignored; no DSN/API keys committed (use `.env.example` only).
- [ ] **`.gitignore`:** includes `release/`, `out/`, `node_modules/`, `.env` (see root `.gitignore`).

## Branches and CI

- [ ] Default branch is **`main`** (or document otherwise).
- [ ] CI green: lint, format, typecheck, test, build, packaging smoke ([PACKAGING.md](./PACKAGING.md)).

## Course artifacts (links in README)

- [ ] Architecture summary: [ARCHITECTURE-SUBMISSION.md](./ARCHITECTURE-SUBMISSION.md) (export to PDF if required).
- [ ] Demo video URL filled in [DEMO-VIDEO.md](./DEMO-VIDEO.md) and README.
- [ ] ROI: [ROI-REPORT.md](./ROI-REPORT.md).
- [ ] OSS contribution: [OSS-CONTRIBUTION.md](./OSS-CONTRIBUTION.md).
- [ ] Social draft: [SOCIAL-POST-DRAFT.md](./SOCIAL-POST-DRAFT.md).

## Optional polish

- [ ] Issue templates or `CONTRIBUTING.md` if you expect external readers.
- [ ] Version tag (`v0.1.0`) aligned with [package.json](../package.json) when you cut a release artifact.
