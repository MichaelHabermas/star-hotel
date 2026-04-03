import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { useRoomsList } from '@renderer/features/rooms/use-rooms-list';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import {
  ROOM_STATUS_DASHBOARD_CLASSES,
  ROOM_STATUS_VALUES,
  type RoomStatus,
} from '@shared/room-status';
import type { RoomResponse } from '@shared/schemas/room';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const LEVELS_DESC = [4, 3, 2, 1] as const;

function parseBoardCell(roomNumber: string | null): { level: number; col: number } | null {
  if (!roomNumber) {
    return null;
  }
  const m = /^([1-4])(\d{2})$/.exec(roomNumber.trim());
  if (!m) {
    return null;
  }
  return { level: Number(m[1]), col: Number(m[2]) };
}

function buildBoard(rows: RoomResponse[]): Map<string, RoomResponse> {
  const map = new Map<string, RoomResponse>();
  for (const r of rows) {
    const pos = parseBoardCell(r.roomNumber);
    if (!pos) {
      continue;
    }
    map.set(`${pos.level}-${pos.col}`, r);
  }
  return map;
}

function countByStatus(rows: RoomResponse[]): Record<RoomStatus, number> {
  const init = Object.fromEntries(ROOM_STATUS_VALUES.map((s) => [s, 0])) as Record<
    RoomStatus,
    number
  >;
  for (const r of rows) {
    init[r.status] += 1;
  }
  return init;
}

export function RoomDashboard(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useRoomsList(starHotel);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const board = useMemo(() => {
    if (list.kind !== 'ok') {
      return new Map<string, RoomResponse>();
    }
    return buildBoard(list.rows);
  }, [list]);

  const statusCounts = useMemo(() => {
    if (list.kind !== 'ok') {
      return null;
    }
    return countByStatus(list.rows);
  }, [list]);

  const selectedRoom = useMemo(() => {
    if (list.kind !== 'ok') {
      return null;
    }
    if (selectedRoomId === null) {
      return list.rows[0] ?? null;
    }
    return list.rows.find((row) => row.id === selectedRoomId) ?? list.rows[0] ?? null;
  }, [list, selectedRoomId]);

  useEffect(() => {
    if (list.kind !== 'ok') {
      return;
    }
    if (list.rows.length === 0) {
      setSelectedRoomId(null);
      return;
    }
    if (selectedRoomId === null || !list.rows.some((row) => row.id === selectedRoomId)) {
      setSelectedRoomId(list.rows[0]?.id ?? null);
    }
  }, [list, selectedRoomId]);

  if (list.kind === 'loading') {
    return (
      <p className="text-muted-foreground font-ui text-sm" role="status" aria-live="polite">
        Loading room board…
      </p>
    );
  }

  if (list.kind === 'err') {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm" role="alert">
          {list.message}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => void reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 border-border/80 border-b pb-4">
        <div>
          <p className="text-muted-foreground font-ui text-xs tracking-wide uppercase">Summary</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROOM_STATUS_VALUES.map((s) => (
              <div
                key={s}
                className="border-border/60 flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
              >
                <span
                  className={`inline-block size-3 shrink-0 rounded-sm border ${ROOM_STATUS_DASHBOARD_CLASSES[s]}`}
                  aria-hidden
                />
                <span className="font-ui font-medium">{s}</span>
                <span className="text-muted-foreground font-mono tabular-nums">
                  {statusCounts?.[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3" aria-label="Room status by level">
          {LEVELS_DESC.map((level) => (
            <div key={level}>
              <p className="text-muted-foreground mb-1 font-ui text-xs font-semibold">
                Level {level}
              </p>
              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {Array.from({ length: 11 }, (_, i) => {
                  const col = i + 1;
                  const key = `${level}-${col}`;
                  const room = board.get(key);
                  const label = room?.roomNumber ?? `${level}${String(col).padStart(2, '0')}`;
                  const selected = room ? selectedRoom?.id === room.id : false;
                  return room ? (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`flex min-h-[3.5rem] flex-col justify-center rounded border px-0.5 py-1 text-center text-[0.65rem] leading-tight transition sm:text-xs ${ROOM_STATUS_DASHBOARD_CLASSES[room.status]} ${
                        selected ? 'ring-ring ring-2 ring-offset-2' : 'hover:brightness-95'
                      }`}
                      aria-pressed={selected}
                      title={`${room.roomNumber ?? room.id} · ${room.roomType} · ${room.status}`}
                    >
                      <span className="font-mono font-semibold tabular-nums">{label}</span>
                      <span className="mt-0.5 line-clamp-2 opacity-90">{room.roomType}</span>
                    </button>
                  ) : (
                    <div
                      key={key}
                      className="border-border/50 bg-muted/30 flex min-h-[3.5rem] flex-col justify-center rounded border border-dashed px-0.5 py-1 text-center text-[0.65rem] text-muted-foreground sm:text-xs"
                      title="Empty slot"
                    >
                      <span className="font-mono font-semibold tabular-nums">{label}</span>
                      <span className="mt-0.5">—</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="font-ui text-base">Desk actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            {selectedRoom ? (
              <>
                <div className="space-y-1">
                  <p className="font-ui text-lg font-semibold">
                    Room {selectedRoom.roomNumber ?? selectedRoom.id}
                  </p>
                  <p className="text-muted-foreground text-sm">{selectedRoom.roomType}</p>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{selectedRoom.status}</dd>
                  <dt className="text-muted-foreground">Rate</dt>
                  <dd className="font-mono">${selectedRoom.price.toFixed(2)}</dd>
                  <dt className="text-muted-foreground">Board cell</dt>
                  <dd className="font-mono">{selectedRoom.roomNumber ?? `#${selectedRoom.id}`}</dd>
                </dl>

                <div className="flex flex-col gap-2">
                  <Button type="button" asChild>
                    <Link to={`/rooms/${selectedRoom.id}`}>Open room card</Link>
                  </Button>
                  <Button type="button" variant="secondary" asChild>
                    <Link to={`/reservations/new?roomId=${selectedRoom.id}`}>Start check-in</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/reservations">Open reservation ledger</Link>
                  </Button>
                </div>

                <p className="text-muted-foreground text-xs">
                  Select a room on the board, then open the room card or start a booking from the
                  same desk surface.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No rooms available on the board.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
