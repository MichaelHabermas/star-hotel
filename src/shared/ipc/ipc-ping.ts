import { z } from 'zod';

export const ipcPingResponseSchema = z.object({ ok: z.literal(true) });

export type IpcPingResponse = z.infer<typeof ipcPingResponseSchema>;
