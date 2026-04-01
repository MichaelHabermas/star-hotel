import { DEFAULT_API_PORT } from './constants'

const STAR_HOTEL_PORT_ENV = 'STAR_HOTEL_PORT' as const

/**
 * Resolves the TCP port for the embedded Express API from `process.env`.
 * Matches main-process behavior: invalid or missing values fall back to {@link DEFAULT_API_PORT}.
 */
export function resolveApiPort(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): number {
  return Number(env[STAR_HOTEL_PORT_ENV]) || DEFAULT_API_PORT
}

/** Base URL for the embedded API (loopback, fixed host — port is the variable part). */
export function buildApiBaseUrl(port: number): string {
  return `http://127.0.0.1:${port}`
}
