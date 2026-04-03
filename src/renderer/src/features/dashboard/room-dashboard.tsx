import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { useReservationsList } from '@renderer/features/reservations/use-reservations-list';
import { useRoomsList } from '@renderer/features/rooms/use-rooms-list';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import {
  ROOM_STATUS_DASHBOARD_CLASSES,
  ROOM_STATUS_VALUES,
  type RoomStatus,
} from '@shared/room-status';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LEVELS_DESC = [4, 3, 2, 1] as const;
const BOARD_COLUMNS = 11;

type ReservationSnapshot = {
  readonly active: ReservationResponse | null;
  readonly upcoming: ReservationResponse | null;
  readonly latest: ReservationResponse | null;
};

type DeskAction = {
  readonly label: string;
  readonly to: string;
  readonly hint: string;
};

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseBoardCell(roomNumber: string | null): { level: number; col: number } | null {
  if (!roomNumber) {
    return null;
  }
  const m = /^([1-4])(\d{2})$/.exec(roomNumber.trim());
  if (!m) {
    return null;
  }
  const col = Number(m[2]);
  if (col < 1 || col > BOARD_COLUMNS) {
    return null;
  }
  return { level: Number(m[1]), col };
}

function buildBoard(rows: RoomResponse[]): Map<string, RoomResponse> {
  const map = new Map<string, RoomResponse>();
  for (const room of rows) {
    const pos = parseBoardCell(room.roomNumber);
    if (!pos) {
      continue;
    }
    map.set(`${pos.level}-${pos.col}`, room);
  }
  return map;
}

function buildReservationSnapshots(
  rows: ReservationResponse[],
  today: string,
): Map<number, ReservationSnapshot> {
  const byRoom = new Map<number, ReservationResponse[]>();
  for (const reservation of rows) {
    const roomReservations = byRoom.get(reservation.roomId);
    if (roomReservations) {
      roomReservations.push(reservation);
    } else {
      byRoom.set(reservation.roomId, [reservation]);
    }
  }

  const snapshots = new Map<number, ReservationSnapshot>();
  for (const [roomId, reservations] of byRoom) {
    const sorted = [...reservations].sort((a, b) => {
      if (a.checkInDate === b.checkInDate) {
        return a.id - b.id;
      }
      return a.checkInDate.localeCompare(b.checkInDate);
    });

    snapshots.set(roomId, {
      active:
        sorted.find(
          (reservation) => reservation.checkInDate <= today && today < reservation.checkOutDate,
        ) ?? null,
      upcoming: sorted.find((reservation) => today < reservation.checkInDate) ?? null,
      latest: sorted.at(-1) ?? null,
    });
  }

  return snapshots;
}

function countByStatus(rows: RoomResponse[]): Record<RoomStatus, number> {
  const init = Object.fromEntries(ROOM_STATUS_VALUES.map((status) => [status, 0])) as Record<
    RoomStatus,
    number
  >;
  for (const room of rows) {
    init[room.status] += 1;
  }
  return init;
}

function getPrimaryDeskAction(
  room: RoomResponse,
  snapshot: ReservationSnapshot | undefined,
): DeskAction {
  if (snapshot?.active) {
    return {
      label: 'Open active stay',
      to: `/reservations/${snapshot.active.id}`,
      hint: `Stay #${snapshot.active.id} is in house until ${snapshot.active.checkOutDate}.`,
    };
  }
  if (room.status === 'Booked' && snapshot?.upcoming) {
    return {
      label: 'Open booked stay',
      to: `/reservations/${snapshot.upcoming.id}`,
      hint: `Booking #${snapshot.upcoming.id} arrives on ${snapshot.upcoming.checkInDate}.`,
    };
  }
  if (room.status === 'Open') {
    return {
      label: 'Start check-in',
      to: `/reservations/new?roomId=${room.id}`,
      hint: 'Launch a new booking directly from the room board.',
    };
  }
  if (snapshot?.latest) {
    return {
      label: 'Open latest booking',
      to: `/reservations/${snapshot.latest.id}`,
      hint: `Review booking #${snapshot.latest.id} tied to this room.`,
    };
  }
  return {
    label: 'Open room card',
    to: `/rooms/${room.id}`,
    hint: 'Open the room maintenance card for this room.',
  };
}

function describeReservation(snapshot: ReservationSnapshot | undefined): string {
  if (snapshot?.active) {
    return `In house · out ${snapshot.active.checkOutDate}`;
  }
  if (snapshot?.upcoming) {
    return `Arrives ${snapshot.upcoming.checkInDate}`;
  }
  if (snapshot?.latest) {
    return `Booking #${snapshot.latest.id}`;
  }
  return 'No booking on file';
}

export function RoomDashboard(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useRoomsList(starHotel);
  const { list: reservationsList, reload: reloadReservations } = useReservationsList(starHotel);
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const today = useMemo(() => todayIsoDate(), []);

  const board = useMemo(() => {
    if (list.kind !== 'ok') {
      return new Map<string, RoomResponse>();
    }
    return buildBoard(list.rows);
  }, [list]);

  const reservationSnapshots = useMemo(() => {
    if (reservationsList.kind !== 'ok') {
      return new Map<number, ReservationSnapshot>();
    }
    return buildReservationSnapshots(reservationsList.rows, today);
  }, [reservationsList, today]);

  const statusCounts = useMemo(() => {
    if (list.kind !== 'ok') {
      return null;
    }
    return countByStatus(list.rows);
  }, [list]);

  const overflowRooms = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    return [...list.rows]
      .filter((room) => parseBoardCell(room.roomNumber) === null)
      .sort((a, b) => (a.roomNumber ?? '').localeCompare(b.roomNumber ?? ''));
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

  if (list.kind === 'loading' || reservationsList.kind === 'loading') {
    return (
      <p className="text-muted-foreground font-ui text-sm" role="status" aria-live="polite">
        Loading room board…
      </p>
    );
  }

  if (list.kind === 'err' || reservationsList.kind === 'err') {
    const message =
      list.kind === 'err'
        ? list.message
        : reservationsList.kind === 'err'
          ? reservationsList.message
          : 'Unable to load room board.';
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm" role="alert">
          {message}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void reload()}>
            Retry rooms
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void reloadReservations()}
          >
            Retry bookings
          </Button>
        </div>
      </div>
    );
  }

  const selectedSnapshot = selectedRoom ? reservationSnapshots.get(selectedRoom.id) : undefined;
  const selectedPrimaryAction = selectedRoom
    ? getPrimaryDeskAction(selectedRoom, selectedSnapshot)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 border-border/80 border-b pb-4">
        <div>
          <p className="text-muted-foreground font-ui text-xs tracking-wide uppercase">Summary</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROOM_STATUS_VALUES.map((status) => (
              <div
                key={status}
                className="border-border/60 flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
              >
                <span
                  className={`inline-block size-3 shrink-0 rounded-sm border ${ROOM_STATUS_DASHBOARD_CLASSES[status]}`}
                  aria-hidden
                />
                <span className="font-ui font-medium">{status}</span>
                <span className="text-muted-foreground font-mono tabular-nums">
                  {statusCounts?.[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4" aria-label="Room status by level">
          {LEVELS_DESC.map((level) => (
            <div key={level}>
              <p className="text-muted-foreground mb-1 font-ui text-xs font-semibold">
                Level {level}
              </p>
              <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
                {Array.from({ length: BOARD_COLUMNS }, (_, index) => {
                  const col = index + 1;
                  const key = `${level}-${col}`;
                  const room = board.get(key);
                  const label = room?.roomNumber ?? `${level}${String(col).padStart(2, '0')}`;
                  const selected = room ? selectedRoom?.id === room.id : false;
                  const snapshot = room ? reservationSnapshots.get(room.id) : undefined;
                  if (!room) {
                    return (
                      <div
                        key={key}
                        className="border-border/50 bg-muted/30 flex min-h-[4.25rem] flex-col justify-center rounded border border-dashed px-0.5 py-1 text-center text-[0.65rem] text-muted-foreground sm:text-xs"
                        title="Empty slot"
                      >
                        <span className="font-mono font-semibold tabular-nums">{label}</span>
                        <span className="mt-0.5">—</span>
                      </div>
                    );
                  }

                  const primaryAction = getPrimaryDeskAction(room, snapshot);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        void navigate(primaryAction.to);
                      }}
                      onMouseEnter={() => setSelectedRoomId(room.id)}
                      onFocus={() => setSelectedRoomId(room.id)}
                      className={`flex min-h-[4.25rem] flex-col justify-center rounded border px-1 py-1 text-center text-[0.65rem] leading-tight transition sm:text-xs ${ROOM_STATUS_DASHBOARD_CLASSES[room.status]} ${
                        selected ? 'ring-ring ring-2 ring-offset-2' : 'hover:brightness-95'
                      }`}
                      aria-pressed={selected}
                      title={`${room.roomNumber ?? room.id} · ${room.roomType} · ${room.status} · ${primaryAction.label}`}
                    >
                      <span className="font-mono font-semibold tabular-nums">{label}</span>
                      <span className="mt-0.5 line-clamp-1 opacity-90">{room.roomType}</span>
                      <span className="mt-0.5 line-clamp-2 text-[0.6rem] opacity-90 sm:text-[0.68rem]">
                        {describeReservation(snapshot)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {overflowRooms.length > 0 ? (
            <Card className="border-border/80 bg-card/70 py-4">
              <CardHeader className="px-4 pb-2">
                <CardTitle className="font-ui text-base">Additional rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                <p className="text-muted-foreground text-sm">
                  These rooms sit outside the fixed legacy board slots, so they stay visible here
                  instead of falling off the front desk surface.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {overflowRooms.map((room) => {
                    const snapshot = reservationSnapshots.get(room.id);
                    const primaryAction = getPrimaryDeskAction(room, snapshot);
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          void navigate(primaryAction.to);
                        }}
                        onMouseEnter={() => setSelectedRoomId(room.id)}
                        onFocus={() => setSelectedRoomId(room.id)}
                        className={`rounded-lg border p-3 text-left transition hover:brightness-95 ${ROOM_STATUS_DASHBOARD_CLASSES[room.status]}`}
                        title={`${room.roomNumber ?? room.id} · ${primaryAction.label}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm font-semibold tabular-nums">
                              {room.roomNumber ?? `#${room.id}`}
                            </p>
                            <p className="text-xs opacity-90">{room.roomType}</p>
                          </div>
                          <span className="text-[0.65rem] font-medium uppercase tracking-wide opacity-90">
                            {room.status}
                          </span>
                        </div>
                        <p className="mt-3 text-xs opacity-90">{describeReservation(snapshot)}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="font-ui text-base">Desk card</CardTitle>
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
                  <dt className="text-muted-foreground">Booking</dt>
                  <dd>{describeReservation(selectedSnapshot)}</dd>
                </dl>

                <div className="flex flex-col gap-2">
                  {selectedPrimaryAction ? (
                    <Button type="button" asChild>
                      <Link to={selectedPrimaryAction.to}>{selectedPrimaryAction.label}</Link>
                    </Button>
                  ) : null}
                  <Button type="button" variant="secondary" asChild>
                    <Link to={`/rooms/${selectedRoom.id}`}>Open room card</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/reservations/new?roomId=${selectedRoom.id}`}>Start check-in</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/reservations">Open reservation ledger</Link>
                  </Button>
                </div>

                {selectedPrimaryAction ? (
                  <p className="text-muted-foreground text-xs">{selectedPrimaryAction.hint}</p>
                ) : null}
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
