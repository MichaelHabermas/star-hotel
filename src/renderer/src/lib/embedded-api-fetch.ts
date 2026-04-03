import { shouldAttachBearerToEmbeddedApiUrl } from '@shared/api/embedded-api-public-access';

/**
 * Build Headers for `fetch(input, init)` when merging optional Bearer auth.
 * openapi-fetch calls `fetch(request, requestInitExt)` with `init` often undefined; if we only
 * use `new Headers(init?.headers)` we drop the Request's headers (including `Content-Type`),
 * so `express.json()` never runs and login bodies fail validation (400).
 */
export function headersForEmbeddedApiFetchMerge(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Headers {
  if (init?.headers !== undefined) {
    return new Headers(init.headers);
  }
  if (input instanceof Request) {
    return new Headers(input.headers);
  }
  return new Headers();
}

/** Wraps `fetch` so protected embedded API URLs get `Authorization: Bearer` when a token exists. */
export function wrapFetchWithOptionalEmbeddedApiBearer(
  baseFetch: typeof fetch,
  baseUrl: string,
  getToken: () => string | null | undefined,
): typeof fetch {
  return (input, init) => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }
    const needsBearer = shouldAttachBearerToEmbeddedApiUrl(url, baseUrl);
    const headers = headersForEmbeddedApiFetchMerge(input, init);
    if (needsBearer) {
      const t = getToken();
      if (t) {
        headers.set('Authorization', `Bearer ${t}`);
      }
    }
    return baseFetch(input, { ...init, headers });
  };
}
