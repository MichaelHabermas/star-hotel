import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Resolves built preload bundle path.
 * Supports both runtime layouts:
 * - `out/main` -> `out/preload`
 * - `src/main` (dev edge cases) -> `out/preload`
 */
export function resolvePreloadScript(scriptDir: string): string {
  const candidates = [
    path.join(scriptDir, '../preload/index.js'),
    path.join(scriptDir, '../preload/index.cjs'),
    path.join(scriptDir, '../preload/index.mjs'),
    path.join(scriptDir, '../../out/preload/index.js'),
    path.join(scriptDir, '../../out/preload/index.cjs'),
    path.join(scriptDir, '../../out/preload/index.mjs'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `[star-hotel] preload bundle not found. scriptDir=${scriptDir}; tried=${candidates.join(', ')}`,
  );
}
