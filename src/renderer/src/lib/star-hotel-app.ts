import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import {
  formatEmbeddedApiUserMessage as formatEmbeddedApiUserMessageShared,
  normalizeEmbeddedApiBaseUrl,
} from '@shared/api/embedded-http';
import type { IpcChannel } from '@shared/ipc/channels';
import { invokeIpcPing } from '@shared/ipc/typed-invoke';
import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import {
  createEmbeddedApiHttpClients,
  type EmbeddedApiHttpClients,
} from './embedded-api-http-clients';
import type { EmbeddedApiSessionPort } from './embedded-api-session-port';

/** Renderer port: preload bridge + embedded API (dependency inversion — avoid `window` in features). */
export type StarHotelApp = {
  getEnvironment(): Pick<StarHotelPreloadAPI, 'platform' | 'apiBaseUrl'>;
  /** Typed IPC to main; domain data stays on Express (see channel registry in `ipc/channels`). */
  invoke(channel: IpcChannel, payload?: unknown): Promise<unknown>;
  /** Embedded Express API is up (HTTP GET `/health`). */
  pingEmbeddedApi(): Promise<{ ok: true }>;
  /** Main process IPC bridge responds (native/Electron seam). */
  pingIpc(): Promise<{ ok: true }>;
  /** Typed HTTP clients for the embedded Express API (localhost); all domain reads/writes go here. */
  readonly api: EmbeddedApiHttpClients;
  /** Stable user-visible copy from API/network errors (E5+ UI patterns). */
  formatEmbeddedApiUserMessage(error: unknown): string;
};

/**
 * Build Headers for `fetch(input, init)` when merging optional Bearer auth.
 * openapi-fetch calls `fetch(request, requestInitExt)` with `init` often undefined; if we only
 * use `new Headers(init?.headers)` we drop the Request's headers (including `Content-Type`),
 * so `express.json()` never runs and login bodies fail validation (400).
 */
function headersForFetchMerge(input: RequestInfo | URL, init: RequestInit | undefined): Headers {
  if (init?.headers !== undefined) {
    return new Headers(init.headers);
  }
  if (input instanceof Request) {
    return new Headers(input.headers);
  }
  return new Headers();
}

function wrapFetchWithOptionalBearer(
  baseFetch: typeof fetch,
  baseUrl: string,
  getToken: () => string | null | undefined,
): typeof fetch {
  const normalized = normalizeEmbeddedApiBaseUrl(baseUrl);
  return (input, init) => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }
    const needsBearer =
      url.startsWith(normalized) &&
      !url.includes(EMBEDDED_API_PATHS.authLogin) &&
      !url.includes(EMBEDDED_API_PATHS.health);
    const headers = headersForFetchMerge(input, init);
    if (needsBearer) {
      const t = getToken();
      if (t) {
        headers.set('Authorization', `Bearer ${t}`);
      }
    }
    return baseFetch(input, { ...init, headers });
  };
}

export function createStarHotelApp(
  deps: {
    fetch: typeof fetch;
    starHotel: StarHotelPreloadAPI;
  } & EmbeddedApiSessionPort,
): StarHotelApp {
  const baseUrl = deps.starHotel.apiBaseUrl;
  const rawFetch = deps.fetch;
  const fetchFn = deps.getAuthToken
    ? wrapFetchWithOptionalBearer(rawFetch, baseUrl, deps.getAuthToken)
    : rawFetch;

  const api = createEmbeddedApiHttpClients({ baseUrl, fetch: fetchFn });

  return {
    getEnvironment() {
      return {
        platform: deps.starHotel.platform,
        apiBaseUrl: deps.starHotel.apiBaseUrl,
      };
    },
    invoke(channel, payload) {
      return deps.starHotel.invoke(channel, payload);
    },
    api,
    formatEmbeddedApiUserMessage(error: unknown) {
      return formatEmbeddedApiUserMessageShared(error);
    },
    async pingEmbeddedApi() {
      const res = await fetchFn(`${deps.starHotel.apiBaseUrl}${EMBEDDED_API_PATHS.health}`);
      if (!res.ok) {
        throw new Error(`health check failed: HTTP ${res.status}`);
      }
      const body = (await res.json()) as { ok?: unknown };
      if (body.ok !== true) {
        throw new Error('health response invalid');
      }
      return { ok: true as const };
    },
    async pingIpc() {
      return invokeIpcPing(deps.starHotel);
    },
  };
}
