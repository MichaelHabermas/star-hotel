import { describe, expect, it } from 'vitest'
import { EMBEDDED_OPENAPI_DOCUMENTED_PATHS } from '@shared/api/embedded-api-paths'
import { starHotelOpenApiDocument } from './openapi-spec'

describe('OpenAPI document vs embedded API path registry', () => {
  it('documents every MVP REST path from EMBEDDED_OPENAPI_DOCUMENTED_PATHS', () => {
    const paths = starHotelOpenApiDocument.paths as Record<string, unknown>
    for (const key of EMBEDDED_OPENAPI_DOCUMENTED_PATHS) {
      expect(paths).toHaveProperty(key)
    }
  })
})
