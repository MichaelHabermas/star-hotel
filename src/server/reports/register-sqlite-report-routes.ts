import type { Express } from 'express';
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit';
import { createReportRouter } from './report-router';

export function registerSqliteReportRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use('/api/reports', createReportRouter(kit));
}
