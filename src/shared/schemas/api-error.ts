import type { z } from 'zod';
import { z as zod } from './zod-openapi';

/** Wire shape for `sendJsonError` / embedded API error responses. */
export const apiErrorBodySchema = zod.object({
  error: zod.object({
    code: zod.string(),
    message: zod.string(),
    details: zod.unknown().optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
