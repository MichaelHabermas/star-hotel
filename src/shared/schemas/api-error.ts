import { z } from 'zod';

/** Wire shape for `sendJsonError` / embedded API error responses. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
