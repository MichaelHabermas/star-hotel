import {
  daySheetReportResponseSchema,
  folioReportResponseSchema,
  type DaySheetReportResponse,
  type FolioReportResponse,
} from '../schemas/report';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { throwIfOpenApiError } from './embedded-http';

export { EmbeddedApiHttpError as ReportsHttpError } from './embedded-http';

export type ReportsHttpClient = {
  getFolio(reservationId: number): Promise<FolioReportResponse>;
  getDaySheet(date: string): Promise<DaySheetReportResponse>;
};

export function createReportsHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): ReportsHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async getFolio(reservationId) {
      const r = await client.GET('/api/reports/folio', {
        params: { query: { reservationId } },
      });
      throwIfOpenApiError(r);
      return folioReportResponseSchema.parse(r.data);
    },

    async getDaySheet(date) {
      const r = await client.GET('/api/reports/day-sheet', {
        params: { query: { date } },
      });
      throwIfOpenApiError(r);
      return daySheetReportResponseSchema.parse(r.data);
    },
  };
}
