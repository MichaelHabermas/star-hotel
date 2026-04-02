import {
  daySheetReportResponseSchema,
  folioReportResponseSchema,
  type DaySheetReportResponse,
  type FolioReportResponse,
} from '../schemas/report';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { EMBEDDED_API_PATHS } from './embedded-api-paths';
import { parseOpenApiOkData } from './embedded-http';

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
      const r = await client.GET(EMBEDDED_API_PATHS.reportsFolio, {
        params: { query: { reservationId } },
      });
      return parseOpenApiOkData(r, folioReportResponseSchema);
    },

    async getDaySheet(date) {
      const r = await client.GET(EMBEDDED_API_PATHS.reportsDaySheet, {
        params: { query: { date } },
      });
      return parseOpenApiOkData(r, daySheetReportResponseSchema);
    },
  };
}
