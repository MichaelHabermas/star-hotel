import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port';

type SqliteDb = ReturnType<HotelSqlitePersistencePort['getDatabase']>;

export type ExpressAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Shared Express + SQLite lifecycle glue for MVP domain routers: async route wrapping,
 * readiness before DB access, and memoized lazy domain services built from `getDatabase()`.
 */
export type SqliteHttpAdapterKit = {
  readonly asyncHandler: (fn: ExpressAsyncHandler) => RequestHandler;
  readonly ensurePersistenceReady: RequestHandler;
  createLazySqliteService<T>(factory: (db: SqliteDb) => T): () => Promise<T>;
};

export function createSqliteHttpAdapterKit(
  persistence: HotelSqlitePersistencePort,
): SqliteHttpAdapterKit {
  function asyncHandler(fn: ExpressAsyncHandler): RequestHandler {
    return (req, res, next) => {
      void fn(req, res, next).catch(next);
    };
  }

  const ensurePersistenceReady: RequestHandler = (_req, _res, next) => {
    void persistence.isReady().then(() => next(), next);
  };

  function createLazySqliteService<T>(factory: (db: SqliteDb) => T): () => Promise<T> {
    let servicePromise: Promise<T> | null = null;
    return () => {
      if (!servicePromise) {
        servicePromise = (async () => {
          await persistence.isReady();
          return factory(persistence.getDatabase());
        })();
      }
      return servicePromise;
    };
  }

  return {
    asyncHandler,
    ensurePersistenceReady,
    createLazySqliteService,
  };
}
