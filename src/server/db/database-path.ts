import path from 'node:path';

/**
 * SQLite file path for the embedded app database (main process only).
 * Uses Electron `userData` so the file survives updates and is writable per user profile.
 * Shared network / multi-seat installs are out of scope for MVP; see docs/DECISIONS.md (T4).
 */
export function resolveDatabaseFilePath(userDataDir: string): string {
  return path.join(userDataDir, 'database.sqlite');
}
