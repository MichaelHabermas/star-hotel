import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import { starHotelOpenApiDocument } from './openapi-spec'

/** Serves the OpenAPI document and Swagger UI on the embedded Express app (loopback only). */
export function registerOpenApiRoutes(app: Express): void {
  app.get('/api/openapi.json', (_req, res) => {
    res.status(200).json(starHotelOpenApiDocument)
  })
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(starHotelOpenApiDocument))
}
