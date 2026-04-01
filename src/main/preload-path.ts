import { existsSync } from 'node:fs'
import path from 'node:path'

/** Resolves built preload bundle path (.mjs preferred when present). */
export function resolvePreloadScript(scriptDir: string): string {
  const asJs = path.join(scriptDir, '../preload/index.js')
  const asMjs = path.join(scriptDir, '../preload/index.mjs')
  if (existsSync(asMjs)) {
    return asMjs
  }
  return asJs
}
