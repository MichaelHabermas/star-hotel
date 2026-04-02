import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z as zBase } from 'zod';

extendZodWithOpenApi(zBase);

/** Shared Zod instance extended for `@asteasolutions/zod-to-openapi` (runtime validation unchanged). */
export const z = zBase;
