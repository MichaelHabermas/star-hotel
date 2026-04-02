import type { App } from 'electron';
import type http from 'node:http';
import type { MainWindowDeps } from './window';

export type StarHotelMainDeps = {
  readonly app: Pick<App, 'whenReady' | 'quit'>;
  readonly appStartMs: number;
  readonly apiBaseUrl: string;
  /** Starts embedded Express + SQLite and registers IPC (idempotent). */
  readonly ensureEmbeddedApiAndIpc: () => Promise<http.Server>;
  readonly registerWindowAllClosed: () => void;
  readonly registerActivateHandler: (createWindow: () => void) => void;
  readonly createMainWindow: (deps: MainWindowDeps) => unknown;
  readonly mainWindowParams: () => MainWindowDeps;
  readonly logger: Pick<Console, 'info' | 'error'>;
};

/**
 * Main-process startup: embedded API + IPC, first window, then macOS activate handler.
 * Dependencies are injected for unit tests.
 */
export async function startStarHotelMain(d: StarHotelMainDeps): Promise<void> {
  d.registerWindowAllClosed();

  await d.app.whenReady();

  const readyMs = Date.now() - d.appStartMs;
  d.logger.info(
    `[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`,
  );

  try {
    await d.ensureEmbeddedApiAndIpc();
    d.logger.info(`[star-hotel] API ${d.apiBaseUrl} (see docs/PERF.md)`);
    d.logger.info(`[star-hotel] Swagger UI ${d.apiBaseUrl}/api/docs`);
  } catch (err) {
    d.logger.error('[star-hotel] embedded API server failed to start', err);
    d.app.quit();
    return;
  }

  d.createMainWindow(d.mainWindowParams());

  d.registerActivateHandler(() => {
    d.createMainWindow(d.mainWindowParams());
  });
}
