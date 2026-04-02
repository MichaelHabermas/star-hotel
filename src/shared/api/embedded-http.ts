import { z } from 'zod'
import {
  apiErrorBodySchema,
  type ApiErrorBody,
} from '../schemas/api-error'

/** @deprecated Use `apiErrorBodySchema` from `@shared/schemas/api-error`. */
export const embeddedApiErrorBodySchema = apiErrorBodySchema

export type EmbeddedApiErrorBody = ApiErrorBody

export class EmbeddedApiHttpError extends Error {
  readonly name = 'EmbeddedApiHttpError'

  constructor(
    readonly status: number,
    readonly body: EmbeddedApiErrorBody,
  ) {
    super(body.error.message)
  }
}

export function normalizeEmbeddedApiBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}

function parseEmbeddedApiErrorBodyFromText(
  text: string,
): EmbeddedApiErrorBody | undefined {
  if (text === '') {
    return undefined
  }
  try {
    const json: unknown = JSON.parse(text)
    const parsed = embeddedApiErrorBodySchema.safeParse(json)
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

export async function readEmbeddedApiErrorBody(
  res: Response,
): Promise<EmbeddedApiErrorBody | undefined> {
  const text = await res.text()
  return parseEmbeddedApiErrorBodyFromText(text)
}

/**
 * openapi-fetch consumes the response body; use `data` / `error` from its result instead of
 * {@link parseEmbeddedJsonOk} on `response`.
 */
export function throwIfOpenApiError(result: {
  readonly response: Response
  readonly error?: unknown
}): void {
  if (result.response.ok) {
    return
  }
  const parsed = embeddedApiErrorBodySchema.safeParse(result.error)
  if (parsed.success) {
    throw new EmbeddedApiHttpError(result.response.status, parsed.data)
  }
  throw new Error(`HTTP ${result.response.status}`)
}

export async function parseEmbeddedJsonOk<T>(
  res: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    const errBody = parseEmbeddedApiErrorBodyFromText(text)
    if (errBody) {
      throw new EmbeddedApiHttpError(res.status, errBody)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response (HTTP ${res.status})`)
  }
  return schema.parse(json)
}

export function formatEmbeddedApiUserMessage(error: unknown): string {
  if (error instanceof EmbeddedApiHttpError) {
    return error.body.error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
