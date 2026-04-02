import { guestResponseSchema } from '@shared/schemas/guest';
import { reservationResponseSchema } from '@shared/schemas/reservation';
import { roomResponseSchema } from '@shared/schemas/room';
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { starHotelOpenApiDocument } from './openapi-spec';

type OpenApiSchemas = {
  readonly schemas: Record<string, { properties?: Record<string, unknown> }>;
};

function openapiComponentPropertyKeys(componentName: string): Set<string> {
  const components = starHotelOpenApiDocument.components as OpenApiSchemas | undefined;
  const def = components?.schemas?.[componentName];
  const props = def?.properties;
  if (!props) {
    throw new Error(`OpenAPI components.schemas.${componentName}.properties missing`);
  }
  return new Set(Object.keys(props));
}

function zodObjectKeys(schema: z.ZodObject<Record<string, z.ZodTypeAny>>): Set<string> {
  return new Set(Object.keys(schema.shape));
}

/**
 * Track A alignment: critical response DTO property names match between Zod (runtime) and OpenAPI (docs/codegen).
 */
describe('OpenAPI component schemas vs Zod response shapes', () => {
  it('Guest', () => {
    expect(zodObjectKeys(guestResponseSchema)).toEqual(openapiComponentPropertyKeys('Guest'));
  });

  it('Room', () => {
    expect(zodObjectKeys(roomResponseSchema)).toEqual(openapiComponentPropertyKeys('Room'));
  });

  it('Reservation', () => {
    expect(zodObjectKeys(reservationResponseSchema)).toEqual(
      openapiComponentPropertyKeys('Reservation'),
    );
  });
});
