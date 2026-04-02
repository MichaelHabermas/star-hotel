import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EMBEDDED_OPENAPI_DOCUMENTED_PATHS } from '@shared/api/embedded-api-paths'
import { starHotelOpenApiDocument } from './openapi-spec'

const specJsonPath = join(dirname(fileURLToPath(import.meta.url)), 'openapi-spec.json')

describe('OpenAPI document vs embedded API path registry', () => {
  it('documents every MVP REST path from EMBEDDED_OPENAPI_DOCUMENTED_PATHS', () => {
    const paths = starHotelOpenApiDocument.paths as Record<string, unknown>
    for (const key of EMBEDDED_OPENAPI_DOCUMENTED_PATHS) {
      expect(paths).toHaveProperty(key)
    }
  })

  it('exported openapi-spec.json matches the TS document (run pnpm codegen:api after spec edits)', () => {
    const fromDisk = JSON.parse(readFileSync(specJsonPath, 'utf8')) as {
      paths: Record<string, unknown>
    }
    expect(fromDisk.paths).toEqual(starHotelOpenApiDocument.paths)
  })
})
