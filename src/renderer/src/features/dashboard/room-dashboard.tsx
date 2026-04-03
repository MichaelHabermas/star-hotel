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

type LegacyBoardLevel = {
  readonly label: string;
  readonly rows: readonly (readonly number[])[];
};

type LegacyBoardPosition = {
  readonly slotId: number;
  readonly levelLabel: string;
  readonly rowIndex: number;
  readonly colIndex: number;
};

type StatusCommand = {
  readonly label: string;
  readonly nextStatus: RoomStatus;
};

const LEGACY_BOARD_LAYOUT: readonly LegacyBoardLevel[] = [
  { label: 'Level 4', rows: [[45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]] },
  { label: 'Level 3', rows: [[34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]] },
  {
    label: 'Level 2',
    rows: [
      [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    ],
  },
  { label: 'Level 1', rows: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]] },
] as const;

const LEGACY_BOARD_POSITIONS: readonly LegacyBoardPosition[] = (() => {
  const positions: LegacyBoardPosition[] = [];
  let rowIndex = 0;
  for (const level of LEGACY_BOARD_LAYOUT) {
    for (const row of level.rows) {
      row.forEach((slotId, colIndex) => {
        positions.push({ slotId, levelLabel: level.label, rowIndex, colIndex });
      });
      rowIndex += 1;
    }
  }
  return positions;
})();

const LEGACY_SLOT_IDS = new Set(LEGACY_BOARD_POSITIONS.map((position) => position.slotId));

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
      label: 'Open booking',
      to: `/reservations/${snapshot.active.id}`,
      hint: `Occupied stay #${snapshot.active.id} checks out ${snapshot.active.checkOutDate}.`,
    };
  }
  if (snapshot?.upcoming) {
    return {
      label: 'Open booking',
      to: `/reservations/${snapshot.upcoming.id}`,
      hint: `Booked stay #${snapshot.upcoming.id} arrives ${snapshot.upcoming.checkInDate}.`,
    };
  }
  if (snapshot?.latest && room.status !== 'Open') {
    return {
      label: 'Open booking',
      to: `/reservations/${snapshot.latest.id}`,
      hint: `Latest booking #${snapshot.latest.id} is tied to this room.`,
    };
  }
  return {
    label: 'New booking',
    to: `/reservations/new?roomId=${room.id}`,
    hint: 'Open the booking screen with this room already selected.',
  };
}

function describeReservation(snapshot: ReservationSnapshot | undefined): string {
  if (snapshot?.active) {
    return `Occupied until ${snapshot.active.checkOutDate}`;
  }
  if (snapshot?.upcoming) {
    return `Booked for ${snapshot.upcoming.checkInDate}`;
  }
  if (snapshot?.latest) {
    return `Booking #${snapshot.latest.id}`;
  }
  return 'No booking on file';
}

function getStatusCommands(room: RoomResponse): readonly StatusCommand[] {
  switch (room.status) {
    case 'Open':
      return [
        { label: 'Housekeeping', nextStatus: 'Housekeeping' },
        { label: 'Maintenance', nextStatus: 'Maintenance' },
      ];
    case 'Housekeeping':
      return [
        { label: 'Free', nextStatus: 'Open' },
        { label: 'Maintenance', nextStatus: 'Maintenance' },
      ];
    case 'Maintenance':
      return [{ label: 'Free', nextStatus: 'Open' }];
    default:
      return [];
  }
}

function findPosition(slotId: number): LegacyBoardPosition | undefined {
  return LEGACY_BOARD_POSITIONS.find((position) => position.slotId === slotId);
}

function findSlotByDirection(
  currentSlotId: number,
  direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end',
): number {
  const current = findPosition(currentSlotId);
  if (!current) {
    return currentSlotId;
  }

  if (direction === 'home' || direction === 'end') {
    const rowPositions = LEGACY_BOARD_POSITIONS.filter(
      (position) => position.rowIndex === current.rowIndex,
    ).sort((a, b) => a.colIndex - b.colIndex);
    return (direction === 'home' ? rowPositions[0] : rowPositions.at(-1))?.slotId ?? currentSlotId;
  }

  const candidates = LEGACY_BOARD_POSITIONS.filter((position) => {
    switch (direction) {
      case 'left':
        return position.rowIndex === current.rowIndex && position.colIndex < current.colIndex;
      case 'right':
        return position.rowIndex === current.rowIndex && position.colIndex > current.colIndex;
      case 'up':
        return position.colIndex === current.colIndex && position.rowIndex < current.rowIndex;
      case 'down':
        return position.colIndex === current.colIndex && position.rowIndex > current.rowIndex;
      default:
        return false;
    }
  });

  if (candidates.length === 0) {
    return currentSlotId;
  }

  const sorted = [...candidates].sort((a, b) => {
    switch (direction) {
      case 'left':
        return b.colIndex - a.colIndex;
      case 'right':
        return a.colIndex - b.colIndex;
      case 'up':
        return b.rowIndex - a.rowIndex;
      case 'down':
        return a.rowIndex - b.rowIndex;
      default:
        return 0;
    }
  });

  return sorted[0]?.slotId ?? currentSlotId;
}

export function RoomDashboard(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useRoomsList(starHotel);
  const { list: reservationsList, reload: reloadReservations } = useReservationsList(starHotel);
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [statusChangeState, setStatusChangeState] = useState<
    { kind: 'idle' } | { kind: 'loading'; label: string } | { kind: 'err'; message: string }
  >({ kind: 'idle' });
  const today = useMemo(() => todayIsoDate(), []);
  const roomButtonRefs = useRef(new Map<number, HTMLButtonElement>());

  const roomById = useMemo(() => {
    if (list.kind !== 'ok') {
      return new Map<number, RoomResponse>();
    }
    return new Map(list.rows.map((room) => [room.id, room]));
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

  const mappedRooms = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    return list.rows.filter((room) => LEGACY_SLOT_IDS.has(room.id));
  }, [list]);

  const overflowRooms = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    return [...list.rows]
      .filter((room) => !LEGACY_SLOT_IDS.has(room.id))
      .sort((a, b) => (a.roomNumber ?? '').localeCompare(b.roomNumber ?? ''));
  }, [list]);

  const selectedRoom = useMemo(() => {
    if (list.kind !== 'ok') {
      return null;
    }
    if (selectedRoomId !== null) {
      return list.rows.find((room) => room.id === selectedRoomId) ?? null;
    }
    return mappedRooms[0] ?? overflowRooms[0] ?? list.rows[0] ?? null;
  }, [list, mappedRooms, overflowRooms, selectedRoomId]);

  useEffect(() => {
    if (selectedRoom) {
      setSelectedRoomId(selectedRoom.id);
      return;
    }
    setSelectedRoomId(null);
  }, [selectedRoom]);

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

  function focusRoom(roomId: number): void {
    setSelectedRoomId(roomId);
    roomButtonRefs.current.get(roomId)?.focus();
  }

  function moveSelection(
    currentRoomId: number,
    direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end',
  ): void {
    const nextSlotId = findSlotByDirection(currentRoomId, direction);
    const nextRoom = roomById.get(nextSlotId);
    if (nextRoom) {
      focusRoom(nextRoom.id);
    }
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
        void navigate(primaryAction.to);
        break;
      default:
        break;
    }
  }

  async function changeRoomStatus(room: RoomResponse, nextStatus: RoomStatus): Promise<void> {
    setStatusChangeState({ kind: 'loading', label: nextStatus });
    try {
      await starHotel.api.rooms.update(room.id, { status: nextStatus });
      await reload();
      setSelectedRoomId(room.id);
      setStatusChangeState({ kind: 'idle' });
    } catch (error) {
      setStatusChangeState({
        kind: 'err',
        message: starHotel.formatEmbeddedApiUserMessage(error),
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 border-border/80 border-b pb-3">
        <p className="text-muted-foreground font-ui text-xs tracking-wide uppercase">Summary</p>
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

      {mappedRooms.length === 0 && overflowRooms.length > 0 ? (
        <div className="rounded-md border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Current room records do not match the legacy fixed board slots, so the usable rooms are
          listed below instead of showing an empty board.
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-3">
          {mappedRooms.length > 0 ? (
            <div className="space-y-3" aria-label="Room status by level" role="grid">
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground font-ui text-xs">
                  Fixed room board from the original app. Arrow keys move. Enter opens booking.
                </p>
                <p className="text-muted-foreground font-mono text-[0.7rem]">
                  {mappedRooms.length} mapped / {list.rows.length} total
                </p>
              </div>
              {LEGACY_BOARD_LAYOUT.map((level) => (
                <div key={level.label} className="space-y-1">
                  <p className="text-muted-foreground font-ui text-xs font-semibold">
                    {level.label}
                  </p>
                  {level.rows.map((row, rowIndex) => (
                    <div
                      key={`${level.label}-${rowIndex}`}
                      className="grid grid-cols-11 gap-1 sm:gap-1.5"
                      role="row"
                    >
                      {row.map((slotId) => {
                        const room = roomById.get(slotId);
                        if (!room) {
                          return (
                            <div
                              key={slotId}
                              className="border-border/35 bg-muted/10 flex min-h-[2.7rem] flex-col justify-center rounded border border-dashed px-1 py-0.5 text-center text-[0.65rem] text-muted-foreground/70 sm:text-xs"
                              title={`Legacy slot ${String(slotId).padStart(2, '0')}`}
                            >
                              <span className="font-mono tabular-nums">
                                {String(slotId).padStart(2, '0')}
                              </span>
                            </div>
                          );
                        }

                        const selected = selectedRoom?.id === room.id;
                        const snapshot = reservationSnapshots.get(room.id);
                        const primaryAction = getPrimaryDeskAction(room, snapshot);
                        const displayLabel = room.roomNumber ?? String(room.id).padStart(2, '0');
                        return (
                          <button
                            key={slotId}
                            ref={(node) => setRoomButtonRef(room.id, node)}
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              void navigate(primaryAction.to);
                            }}
                            onFocus={() => setSelectedRoomId(room.id)}
                            onMouseEnter={() => setSelectedRoomId(room.id)}
                            onKeyDown={(event) => handleBoardKeyDown(room, primaryAction, event)}
                            className={`flex min-h-[4.2rem] flex-col justify-center rounded border px-1 py-1 text-center text-[0.65rem] leading-tight transition sm:text-xs ${ROOM_STATUS_DASHBOARD_CLASSES[room.status]} ${
                              selected ? 'ring-ring ring-2 ring-offset-1' : 'hover:brightness-95'
                            }`}
                            aria-pressed={selected}
                            aria-current={selected ? 'true' : undefined}
                            title={`${displayLabel} · ${room.roomType} · ${room.status} · ${primaryAction.label}`}
                          >
                            <span className="font-mono font-semibold tabular-nums">
                              {displayLabel}
                            </span>
                            <span className="mt-0.5 line-clamp-2 text-[0.6rem] opacity-95 sm:text-[0.68rem]">
                              {room.roomType}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          {overflowRooms.length > 0 ? (
            <Card className="border-border/80 bg-card/70 py-3">
              <CardHeader className="px-3 pb-1">
                <CardTitle className="font-ui text-base">Additional rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3">
                <p className="text-muted-foreground text-xs">
                  Rooms outside the legacy fixed board. Select a row to open booking or room work.
                </p>
                <div className="overflow-hidden rounded-md border border-border/70">
                  <div className="bg-muted/40 grid grid-cols-[6rem_6rem_minmax(0,1fr)_7rem] gap-2 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Room</span>
                    <span>Status</span>
                    <span>Booking</span>
                    <span>Action</span>
                  </div>
                  {overflowRooms.map((room) => {
                    const snapshot = reservationSnapshots.get(room.id);
                    const primaryAction = getPrimaryDeskAction(room, snapshot);
                    const selected = selectedRoom?.id === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          void navigate(primaryAction.to);
                        }}
                        onFocus={() => setSelectedRoomId(room.id)}
                        onMouseEnter={() => setSelectedRoomId(room.id)}
                        className={`grid w-full grid-cols-[6rem_6rem_minmax(0,1fr)_7rem] gap-2 border-t border-border/60 px-3 py-2 text-left text-sm ${
                          selected ? 'bg-secondary/60' : 'bg-background hover:bg-muted/40'
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
            <CardTitle className="font-ui text-base">Room menu</CardTitle>
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
                    <span className="text-muted-foreground">Slot</span>
                    <span className="font-mono">
                      {LEGACY_SLOT_IDS.has(selectedRoom.id)
                        ? String(selectedRoom.id).padStart(2, '0')
                        : 'Overflow'}
                    </span>
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
                    <Link to={`/rooms/${selectedRoom.id}`}>Edit room</Link>
                  </Button>
                </div>

                {getStatusCommands(selectedRoom).length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Change status
                    </p>
                    <div className="grid gap-2">
                      {getStatusCommands(selectedRoom).map((command) => (
                        <Button
                          key={command.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={statusChangeState.kind === 'loading'}
                          onClick={() => void changeRoomStatus(selectedRoom, command.nextStatus)}
                        >
                          {command.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <p className="text-muted-foreground text-xs leading-snug">
                  {selectedPrimaryAction?.hint}
                </p>

                {statusChangeState.kind === 'loading' ? (
                  <p className="text-muted-foreground text-xs" role="status">
                    Updating room to {statusChangeState.label}…
                  </p>
                ) : null}
                {statusChangeState.kind === 'err' ? (
                  <p className="text-destructive text-xs" role="alert">
                    {statusChangeState.message}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No rooms available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
