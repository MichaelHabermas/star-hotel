import { DEFAULT_API_PORT } from './constants';

/** Env var for embedded Express TCP port (main and preload). */
export const STAR_HOTEL_PORT_ENV = 'STAR_HOTEL_PORT' as const;

/** Renderer argv prefix: full base URL for embedded API (overrides port env). */
export const API_BASE_ARG_PREFIX = '--star-hotel-api-base=' as const;

function parseTcpPort(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') {
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return null;
  }
  if (n < 1 || n > 65535) {
    return null;
  }
  return n;
}

/**
 * Resolves the TCP port for the embedded Express API from env.
 * Invalid or missing values fall back to {@link DEFAULT_API_PORT}.
 */
export function resolveApiPortFromEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): number {
  return parseTcpPort(env[STAR_HOTEL_PORT_ENV]) ?? DEFAULT_API_PORT;
}

/**
 * Resolves the TCP port for the embedded Express API from `process.env`.
 * Prefer {@link resolveApiPortFromEnv}; kept as a stable name for call sites.
 */
export function resolveApiPort(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): number {
  return resolveApiPortFromEnv(env);
}

/** Base URL for the embedded API (loopback, fixed host — port is the variable part). */
export function buildApiBaseUrl(port: number): string {
  return `http://127.0.0.1:${port}`;
}

/**
 * Preload/renderer: embedded API base URL from `--star-hotel-api-base=` or env port + {@link buildApiBaseUrl}.
 */
export function readRendererEmbeddedApiBaseUrl(
  argv: readonly string[],
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string {
  const apiBaseArg = argv.find((arg) => arg.startsWith(API_BASE_ARG_PREFIX));
  if (apiBaseArg) {
    return apiBaseArg.slice(API_BASE_ARG_PREFIX.length);
  }
  return buildApiBaseUrl(resolveApiPortFromEnv(env));
}
