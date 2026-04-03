import { EMBEDDED_API_PATHS } from './embedded-api-paths';
import { normalizeEmbeddedApiBaseUrl } from './embedded-http';

/**
 * Express `req.path` (pathname only) — true when the embedded API does not require Bearer auth.
 * Must stay aligned with {@link shouldAttachBearerToEmbeddedApiUrl} for the renderer.
 */
export function embeddedApiPathnameExemptFromBearer(pathname: string): boolean {
  if (pathname === EMBEDDED_API_PATHS.health) {
    return true;
  }
  if (pathname.startsWith('/api/openapi')) {
    return true;
  }
  if (pathname === EMBEDDED_API_PATHS.docs) {
    return true;
  }
  /** Only login is unauthenticated; other `/api/auth/*` routes require Bearer when enabled. */
  if (pathname === EMBEDDED_API_PATHS.authLogin) {
    return true;
  }
  return false;
}

/**
 * Absolute request URL against the embedded API base — true when the renderer should attach Bearer.
 * Returns false if `url` is not under `embeddedApiBaseUrl`.
 */
export function shouldAttachBearerToEmbeddedApiUrl(
  url: string,
  embeddedApiBaseUrl: string,
): boolean {
  const base = normalizeEmbeddedApiBaseUrl(embeddedApiBaseUrl);
  if (!url.startsWith(base)) {
    return false;
  }
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return false;
  }
  return !embeddedApiPathnameExemptFromBearer(pathname);
}
