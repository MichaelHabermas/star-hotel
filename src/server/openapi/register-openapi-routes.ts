import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { starHotelOpenApiDocument } from './openapi-spec';

/** Serves the OpenAPI document and Swagger UI on the embedded Express app (loopback only). */
export function registerOpenApiRoutes(app: Express): void {
  app.get(EMBEDDED_API_PATHS.openapiJson, (_req, res) => {
    res.status(200).json(starHotelOpenApiDocument);
  });
  app.use(EMBEDDED_API_PATHS.docs, swaggerUi.serve, swaggerUi.setup(starHotelOpenApiDocument));
}
