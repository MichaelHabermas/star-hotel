import { computeReservationTotal, countStayNights } from '@domain/reservation-pricing';
import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import {
  reservationCreateBodySchema,
  reservationUpdateBodySchema,
} from '@shared/schemas/reservation';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useGuestRoomCatalog } from './use-guest-room-catalog';

export type ReservationEditorOptions = {
  readonly mode: 'create' | 'edit';
  readonly editId: number;
  readonly editIdValid: boolean;
  readonly navigate: NavigateFunction;
  readonly initialGuestId?: string;
  readonly initialRoomId?: string;
  readonly initialCheckInDate?: string;
  readonly initialCheckOutDate?: string;
};

export function useReservationEditor(app: StarHotelApp, opts: ReservationEditorOptions) {
  const {
    mode,
    editId,
    editIdValid,
    navigate,
    initialGuestId = '',
    initialRoomId = '',
    initialCheckInDate = '',
    initialCheckOutDate = '',
  } = opts;
  const catalog = useGuestRoomCatalog(app);
  const { rooms } = catalog;

  const [guestId, setGuestId] = useState<string>(initialGuestId);
  const [roomId, setRoomId] = useState<string>(initialRoomId);
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const loadReservation = useCallback(async () => {
    if (!editIdValid) {
      return;
    }
    setLoadState('loading');
    setLoadErr(null);
    try {
      const res = await app.api.reservations.get(editId);
      setGuestId(String(res.guestId));
      setRoomId(String(res.roomId));
      setCheckInDate(res.checkInDate);
      setCheckOutDate(res.checkOutDate);
      setTotalAmount(res.totalAmount);
      setLoadState('ok');
    } catch (err) {
      setLoadState('err');
      setLoadErr(app.formatEmbeddedApiUserMessage(err));
    }
  }, [editIdValid, editId, app]);

  useEffect(() => {
    if (mode === 'edit') {
      void loadReservation();
    } else {
      setLoadState('ok');
      setLoadErr(null);
    }
  }, [mode, loadReservation]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitErr(null);
      setFieldErr(null);

      if (mode === 'create') {
        const parsed = reservationCreateBodySchema.safeParse({
          roomId,
          guestId,
          checkInDate,
          checkOutDate,
        });
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          setFieldErr(first?.message ?? 'Invalid input');
          return;
        }
        setSubmitting(true);
        try {
          await app.api.reservations.create(parsed.data);
          navigate('/reservations');
        } catch (err) {
          setSubmitErr(app.formatEmbeddedApiUserMessage(err));
        } finally {
          setSubmitting(false);
        }
        return;
      }

      if (!editIdValid) {
        return;
      }

      const body: Record<string, unknown> = {};
      if (roomId !== '') {
        body.roomId = roomId;
      }
      if (guestId !== '') {
        body.guestId = guestId;
      }
      if (checkInDate !== '') {
        body.checkInDate = checkInDate;
      }
      if (checkOutDate !== '') {
        body.checkOutDate = checkOutDate;
      }

      const parsed = reservationUpdateBodySchema.safeParse(body);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        setFieldErr(first?.message ?? 'Invalid input');
        return;
      }

      setSubmitting(true);
      try {
        const updated = await app.api.reservations.update(editId, parsed.data);
        setTotalAmount(updated.totalAmount);
        navigate('/reservations');
      } catch (err) {
        setSubmitErr(app.formatEmbeddedApiUserMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [mode, roomId, guestId, checkInDate, checkOutDate, editIdValid, editId, app, navigate],
  );

  const confirmDelete = useCallback(async () => {
    if (!editIdValid) {
      return;
    }
    setDeleting(true);
    setDeleteErr(null);
    try {
      await app.api.reservations.delete(editId);
      setDeleteOpen(false);
      navigate('/reservations');
    } catch (err) {
      setDeleteErr(app.formatEmbeddedApiUserMessage(err));
    } finally {
      setDeleting(false);
    }
  }, [editIdValid, editId, app, navigate]);

  const createPreview = useMemo(() => {
    if (mode !== 'create') {
      return {
        nights: null as number | null,
        total: null as number | null,
        hint: null as string | null,
      };
    }
    if (roomId === '' || checkInDate === '' || checkOutDate === '') {
      return { nights: null, total: null, hint: null };
    }
    const rid = Number.parseInt(roomId, 10);
    const room = rooms.find((r) => r.id === rid);
    if (!room) {
      return { nights: null, total: null, hint: null };
    }
    try {
      const nights = countStayNights(checkInDate, checkOutDate);
      if (nights === 0) {
        return {
          nights: 0,
          total: 0,
          hint: 'Same check-in and check-out: 0 nights (total $0.00 until you extend the stay).',
        };
      }
      const total = computeReservationTotal(nights, room.price);
      return { nights, total, hint: null };
    } catch {
      return {
        nights: null,
        total: null,
        hint: 'Enter valid check-in and check-out dates (check-out after check-in).',
      };
    }
  }, [mode, roomId, checkInDate, checkOutDate, rooms]);

  return {
    catalog,
    guestId,
    setGuestId,
    roomId,
    setRoomId,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    totalAmount,
    loadState,
    loadErr,
    loadReservation,
    submitErr,
    fieldErr,
    submitting,
    onSubmit,
    deleteOpen,
    setDeleteOpen,
    deleting,
    deleteErr,
    setDeleteErr,
    confirmDelete,
    createPreview,
  };
}
