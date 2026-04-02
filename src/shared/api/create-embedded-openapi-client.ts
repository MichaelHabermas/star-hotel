import createClient from 'openapi-fetch'
import type { paths } from './generated/openapi-types'
import { normalizeEmbeddedApiBaseUrl } from './embedded-http'

export function createEmbeddedOpenApiClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}) {
  return createClient<paths>({
    baseUrl: normalizeEmbeddedApiBaseUrl(deps.baseUrl),
    fetch: deps.fetch,
  })
}

export type { paths } from './generated/openapi-types'
