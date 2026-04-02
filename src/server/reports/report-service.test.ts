import { describe, expect, it, vi } from 'vitest';
import type { ReportRepository } from './report-repository';
import { ReportService } from './report-service';

describe('ReportService', () => {
  it('getDaySheet computes occupancy rate from room count', () => {
    const repo: Pick<ReportRepository, 'listDaySheetRows' | 'countRooms'> = {
      listDaySheetRows: vi.fn().mockReturnValue([]),
      countRooms: vi.fn().mockReturnValue(10),
    };
    const svc = new ReportService(repo as unknown as ReportRepository);
    const r = svc.getDaySheet('2026-01-15');
    expect(r.totalRooms).toBe(10);
    expect(r.occupancyCount).toBe(0);
    expect(r.occupancyRate).toBe(0);
  });
});
