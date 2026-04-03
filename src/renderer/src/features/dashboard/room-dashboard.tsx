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
import type { JSX, KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type BoardRoomPosition = {
  readonly room: RoomResponse;
  readonly level: number;
  readonly col: number;
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

function buildBoardPositions(rows: RoomResponse[]): BoardRoomPosition[] {
  return rows
    .map((room) => {
      const pos = parseBoardCell(room.roomNumber);
      return pos ? { room, level: pos.level, col: pos.col } : null;
    })
    .filter((value): value is BoardRoomPosition => value !== null)
    .sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.col - b.col;
    });
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

function describeBoardCell(room: RoomResponse): string {
  const pos = parseBoardCell(room.roomNumber);
  if (!pos) {
    return 'Off board';
  }
  return `${pos.level}${String(pos.col).padStart(2, '0')}`;
}

function findRoomByDirection(
  currentRoomId: number,
  positions: BoardRoomPosition[],
  direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end',
): RoomResponse | null {
  const current = positions.find((position) => position.room.id === currentRoomId);
  if (!current) {
    return positions[0]?.room ?? null;
  }

  if (direction === 'home' || direction === 'end') {
    const rowPositions = positions
      .filter((position) => position.level === current.level)
      .sort((a, b) => a.col - b.col);
    return (direction === 'home' ? rowPositions[0] : rowPositions.at(-1))?.room ?? current.room;
  }

  const candidates = positions.filter((position) => {
    switch (direction) {
      case 'left':
        return position.level === current.level && position.col < current.col;
      case 'right':
        return position.level === current.level && position.col > current.col;
      case 'up':
        return position.col === current.col && position.level > current.level;
      case 'down':
        return position.col === current.col && position.level < current.level;
      default:
        return false;
    }
  });

  if (candidates.length === 0) {
    return current.room;
  }

  const sorted = [...candidates].sort((a, b) => {
    switch (direction) {
      case 'left':
        return b.col - a.col;
      case 'right':
        return a.col - b.col;
      case 'up':
        return a.level - b.level;
      case 'down':
        return b.level - a.level;
      default:
        return 0;
    }
  });

  return sorted[0]?.room ?? current.room;
}

export function RoomDashboard(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useRoomsList(starHotel);
  const { list: reservationsList, reload: reloadReservations } = useReservationsList(starHotel);
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const today = useMemo(() => todayIsoDate(), []);
  const roomButtonRefs = useRef(new Map<number, HTMLButtonElement>());

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

  const boardPositions = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    return buildBoardPositions(list.rows);
  }, [list]);

  const overflowRooms = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    return [...list.rows]
      .filter((room) => parseBoardCell(room.roomNumber) === null)
      .sort((a, b) => (a.roomNumber ?? '').localeCompare(b.roomNumber ?? ''));
  }, [list]);

  const mappedRoomCount = boardPositions.length;

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

  function setRoomButtonRef(roomId: number, node: HTMLButtonElement | null): void {
    if (node) {
      roomButtonRefs.current.set(roomId, node);
      return;
    }
    roomButtonRefs.current.delete(roomId);
  }

  function moveSelection(
    roomId: number,
    direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end',
  ): void {
    const nextRoom = findRoomByDirection(roomId, boardPositions, direction);
    if (!nextRoom) {
      return;
    }
    setSelectedRoomId(nextRoom.id);
    roomButtonRefs.current.get(nextRoom.id)?.focus();
  }

  function handleBoardKeyDown(
    room: RoomResponse,
    primaryAction: DeskAction,
    event: KeyboardEvent<HTMLButtonElement>,
  ): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveSelection(room.id, 'left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveSelection(room.id, 'right');
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveSelection(room.id, 'up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveSelection(room.id, 'down');
        break;
      case 'Home':
        event.preventDefault();
        moveSelection(room.id, 'home');
        break;
      case 'End':
        event.preventDefault();
        moveSelection(room.id, 'end');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setSelectedRoomId(room.id);
        void navigate(primaryAction.to);
        break;
      default:
        break;
    }
  }

  return (
    <div className="space-y-4">
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

      {mappedRoomCount === 0 && overflowRooms.length > 0 ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Current room numbers do not populate the legacy room grid, so the usable rooms are listed
          below in the room ledger.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-3" aria-label="Room status by level" role="grid">
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground font-ui text-xs">
              Arrow keys move around the board. Press Enter to open the active room.
            </p>
            <p className="text-muted-foreground font-mono text-[0.7rem]">
              {mappedRoomCount} mapped / {list.rows.length} total
            </p>
          </div>
          {LEVELS_DESC.map((level) => (
            <div key={level}>
              <p className="text-muted-foreground mb-1 font-ui text-xs font-semibold">
                Level {level}
              </p>
              <div className="grid grid-cols-11 gap-1 sm:gap-1.5" role="row">
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
                        className="border-border/40 bg-muted/10 flex min-h-[2.6rem] flex-col justify-center rounded border border-dashed px-0.5 py-0.5 text-center text-[0.65rem] text-muted-foreground/80 sm:text-xs"
                        title="Empty legacy board slot"
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
                      ref={(node) => setRoomButtonRef(room.id, node)}
                      type="button"
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        void navigate(primaryAction.to);
                      }}
                      onMouseEnter={() => setSelectedRoomId(room.id)}
                      onFocus={() => setSelectedRoomId(room.id)}
                      onKeyDown={(event) => handleBoardKeyDown(room, primaryAction, event)}
                      className={`flex min-h-[2.8rem] flex-col justify-center rounded border px-1 py-0.5 text-center text-[0.65rem] leading-tight transition sm:text-xs ${ROOM_STATUS_DASHBOARD_CLASSES[room.status]} ${
                        selected ? 'ring-ring ring-2 ring-offset-1' : 'hover:brightness-95'
                      }`}
                      aria-pressed={selected}
                      aria-current={selected ? 'true' : undefined}
                      title={`${room.roomNumber ?? room.id} · ${room.roomType} · ${room.status} · ${primaryAction.label}`}
                    >
                      <span className="font-mono font-semibold tabular-nums">{label}</span>
                      <span className="mt-0.5 line-clamp-1 text-[0.6rem] opacity-90 sm:text-[0.68rem]">
                        {room.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {overflowRooms.length > 0 ? (
            <Card className="border-border/80 bg-card/70 py-3">
              <CardHeader className="px-3 pb-1">
                <CardTitle className="font-ui text-base">Additional rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3">
                <p className="text-muted-foreground text-xs">
                  Rooms outside the fixed legacy grid. Select a row to open its live desk action.
                </p>
                <div className="overflow-hidden rounded-md border border-border/70">
                  <div className="bg-muted/40 grid grid-cols-[6rem_7rem_minmax(0,1fr)_8rem] gap-2 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Room</span>
                    <span>Status</span>
                    <span>Booking</span>
                    <span>Action</span>
                  </div>
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
                        className={`grid w-full grid-cols-[6rem_7rem_minmax(0,1fr)_8rem] gap-2 border-t border-border/60 px-3 py-2 text-left text-sm transition ${
                          selectedRoom?.id === room.id
                            ? 'bg-secondary/60'
                            : 'bg-background hover:bg-muted/40'
                        }`}
                        title={`${room.roomNumber ?? room.id} · ${primaryAction.label}`}
                      >
                        <span className="font-mono font-semibold tabular-nums">
                          {room.roomNumber ?? `#${room.id}`}
                        </span>
                        <span>{room.status}</span>
                        <span className="truncate text-muted-foreground">
                          {describeReservation(snapshot)}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {primaryAction.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="gap-2 self-start py-3">
          <CardHeader className="px-3 pb-0">
            <CardTitle className="font-ui text-base">Desk card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-3">
            {selectedRoom ? (
              <>
                <div className="space-y-0.5">
                  <p className="font-ui text-lg font-semibold">
                    Room {selectedRoom.roomNumber ?? selectedRoom.id}
                  </p>
                  <p className="text-muted-foreground text-sm">{selectedRoom.roomType}</p>
                </div>

                <div className="grid gap-2 rounded-md border border-border/70 bg-muted/20 p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">{selectedRoom.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-mono">${selectedRoom.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Board</span>
                    <span className="font-mono">{describeBoardCell(selectedRoom)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground">Booking</span>
                    <span className="max-w-[10rem] text-right">
                      {describeReservation(selectedSnapshot)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  {selectedPrimaryAction ? (
                    <Button type="button" asChild>
                      <Link to={selectedPrimaryAction.to}>{selectedPrimaryAction.label}</Link>
                    </Button>
                  ) : null}
                  <Button type="button" variant="secondary" asChild>
                    <Link to={`/rooms/${selectedRoom.id}`}>Open room card</Link>
                  </Button>
                </div>

                {selectedPrimaryAction ? (
                  <p className="text-muted-foreground text-xs leading-snug">
                    {selectedPrimaryAction.hint}
                  </p>
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
