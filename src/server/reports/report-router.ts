import { daySheetReportQuerySchema, folioReportQuerySchema } from '@shared/schemas/report';
import { Router } from 'express';
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit';
import { ReportRepository } from './report-repository';
import { ReportService } from './report-service';

export function createReportRouter(kit: SqliteHttpAdapterKit): Router {
  const router = Router();
  const getReportService = kit.createLazySqliteService(
    (db) => new ReportService(new ReportRepository(db)),
  );

  router.use(kit.ensurePersistenceReady);

  router.get(
    '/folio',
    kit.asyncHandler(async (req, res) => {
      const q = folioReportQuerySchema.parse(req.query);
      const svc = await getReportService();
      res.status(200).json(svc.getFolio(q.reservationId));
    }),
  );

  router.get(
    '/day-sheet',
    kit.asyncHandler(async (req, res) => {
      const q = daySheetReportQuerySchema.parse(req.query);
      const svc = await getReportService();
      res.status(200).json(svc.getDaySheet(q.date));
    }),
  );

  return router;
}
