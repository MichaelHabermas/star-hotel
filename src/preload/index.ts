import { readRendererEmbeddedApiBaseUrl } from '@shared/embedded-api-config';
import { IPC_CHANNELS, type IpcChannel } from '@shared/ipc/channels';
import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import { contextBridge, ipcRenderer } from 'electron';

const FALLBACK_PLATFORM = 'unknown';

const allowedIpcChannels = new Set<string>(Object.values(IPC_CHANNELS));
const maybeProcess = typeof process !== 'undefined' ? process : undefined;

const bridge = {
  platform: maybeProcess?.platform ?? FALLBACK_PLATFORM,
  apiBaseUrl: readRendererEmbeddedApiBaseUrl(
    Array.isArray(maybeProcess?.argv) ? maybeProcess.argv : [],
    maybeProcess?.env ?? {},
  ),
} as const;

function invoke(channel: IpcChannel, payload?: unknown): Promise<unknown> {
  if (!allowedIpcChannels.has(channel)) {
    return Promise.reject(new Error('IPC channel not allowed'));
  }
  return ipcRenderer.invoke(channel, payload);
}

const api: StarHotelPreloadAPI = {
  ...bridge,
  invoke,
};

console.info('[preload] bridge bootstrap start', {
  platform: bridge.platform,
  apiBaseUrl: bridge.apiBaseUrl,
});
contextBridge.exposeInMainWorld('starHotel', api);
console.info('[preload] bridge exposed');
