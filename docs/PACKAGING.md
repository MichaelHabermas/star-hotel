# Packaging (Epic E10 / T6)

This document defines the **T6 packaging smoke** path: what “green” means in CI, how installers are produced, and how to verify a **fresh-machine** install with native modules (`better-sqlite3`, `argon2`).

## Commands

| Command        | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `pnpm dist`    | Production build + platform default installer(s) for the current OS       |
| `pnpm dist:dir` | Unpacked app only (fast sanity check; output under `release/`)            |
| `pnpm dist:linux` | Linux **x64 portable zip** (`electron-builder --linux --x64`; matches GitHub `ubuntu-latest`) |
| `pnpm dist:mac`   | macOS **DMG** + **zip**                                                   |
| `pnpm dist:win`   | Windows **NSIS** x64 installer                                            |

Artifacts are written to **`release/`** (gitignored). Run `pnpm build` before packaging if you only need a compile check without installers.

## T6 — CI “green” definition

A packaging run is **green** when:

1. `pnpm install --frozen-lockfile` succeeds.
2. **`pnpm dist:linux`** completes without error on **`ubuntu-latest`** (matches GitHub Actions Linux runners).
3. At least one **Linux zip** exists under `release/` and is **uploaded as a workflow artifact** for the run.

This proves Electron Builder, `electron-vite` output, and **native dependency rebuild** for Electron complete in a clean environment. It does **not** replace interactive QA on a physical Windows or macOS machine if you ship those targets.

## Fresh-machine smoke (manual)

After installing from the produced artifact on a machine that **never had** this repo’s `node_modules`:

1. Launch **Star Hotel**; confirm the window opens and no `NODE_MODULE_VERSION` / `ERR_DLOPEN_FAILED` appears.
2. **Sign in** (default seed user: see README / embedded API section).
3. Open **Reservations** (or another CRUD screen) and confirm data loads (SQLite under `userData`).

If native modules fail, on a dev machine run `pnpm rebuild:native` and rebuild; **packaged** apps rely on Electron Builder’s rebuild of `better-sqlite3` and `argon2` for the bundled Electron version.

## Windows and macOS installers

- **Windows (x64 NSIS):** `pnpm dist:win` on Windows or in CI (`windows-latest`). Requires `wine` only if cross-building from Linux (not required when using a Windows runner).
- **macOS:** `pnpm dist:mac` on macOS. Unsigned local builds use ad-hoc signing; notarized distribution needs Apple credentials (out of scope for the course baseline).

## References

- [Electron Builder](https://www.electron.build/)
- [README](../README.md) — commands and troubleshooting
- [PRD — Epic E10](PRD.md#epic-e10--packaging-ci-smoke-submission)
