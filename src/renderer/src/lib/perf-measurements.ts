import type { StarHotelApp } from '@renderer/lib/star-hotel-app';

export type PerfSmokeResult = {
  readonly embeddedApiRttMs: number;
  readonly ipcRttMs: number;
  readonly reservationListMs: number;
};

/** Dev harness: HTTP health, IPC ping, and list reservations (see docs/PERF.md). */
export async function runPerfSmoke(starHotel: StarHotelApp): Promise<PerfSmokeResult> {
  const tHealth = performance.now();
  await starHotel.pingEmbeddedApi();
  const embeddedApiRttMs = Math.round(performance.now() - tHealth);

  const tIpc = performance.now();
  await starHotel.pingIpc();
  const ipcRttMs = Math.round(performance.now() - tIpc);

  const tList = performance.now();
  await starHotel.api.reservations.list({});
  const reservationListMs = Math.round(performance.now() - tList);

  return { embeddedApiRttMs, ipcRttMs, reservationListMs };
}
