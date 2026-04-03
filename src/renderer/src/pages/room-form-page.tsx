import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { ROOM_STATUS_VALUES } from '@shared/room-status';
import { roomCreateBodySchema, roomUpdateBodySchema } from '@shared/schemas/room';
import type { FormEvent, JSX } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type RoomFormPageProps = {
  readonly mode: 'create' | 'edit';
};

const STATUSES = ROOM_STATUS_VALUES;

export function RoomFormPage({ mode }: RoomFormPageProps): JSX.Element {
  const starHotel = useStarHotelApp();
  const navigate = useNavigate();
  const { roomId: idParam } = useParams<{ roomId: string }>();
  const formId = useId();
  const roomNumberId = `${formId}-room-number`;
  const priceId = `${formId}-price`;
  const typeId = `${formId}-type`;
  const statusId = `${formId}-status`;

  const editId = mode === 'edit' && idParam ? Number.parseInt(idParam, 10) : NaN;
  const editIdValid = mode === 'edit' && Number.isFinite(editId) && editId > 0;

  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<string>(STATUSES[0]);

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoom = useCallback(async () => {
    if (!editIdValid) {
      return;
    }
    setLoadState('loading');
    setLoadErr(null);
    try {
      const r = await starHotel.api.rooms.get(editId);
      setRoomNumber(r.roomNumber ?? '');
      setRoomType(r.roomType);
      setPrice(String(r.price));
      setStatus(r.status);
      setLoadState('ok');
    } catch (err) {
      setLoadState('err');
      setLoadErr(starHotel.formatEmbeddedApiUserMessage(err));
    }
  }, [editIdValid, editId, starHotel]);

  useEffect(() => {
    if (mode === 'edit') {
      void loadRoom();
    } else {
      setLoadState('ok');
    }
  }, [mode, loadRoom]);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitErr(null);
    setFieldErr(null);

    const priceNum = Number.parseFloat(price);
    if (mode === 'create') {
      const parsed = roomCreateBodySchema.safeParse({
        roomNumber: roomNumber.trim(),
        roomType: roomType.trim(),
        price: priceNum,
        status,
      });
      if (!parsed.success) {
        setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input');
        return;
      }
      setSubmitting(true);
      try {
        await starHotel.api.rooms.create(parsed.data);
        navigate('/rooms');
      } catch (err) {
        setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!editIdValid) {
      return;
    }
    const body: Record<string, unknown> = {};
    if (roomNumber.trim() !== '') {
      body.roomNumber = roomNumber.trim();
    }
    if (roomType.trim() !== '') {
      body.roomType = roomType.trim();
    }
    if (price.trim() !== '') {
      body.price = priceNum;
    }
    if (status !== '') {
      body.status = status;
    }
    const parsed = roomUpdateBodySchema.safeParse(body);
    if (!parsed.success) {
      setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setSubmitting(true);
    try {
      await starHotel.api.rooms.update(editId, parsed.data);
      navigate('/rooms');
    } catch (err) {
      setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === 'edit' && !editIdValid) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-destructive text-sm" role="alert">
          Invalid room id.
        </p>
        <Button type="button" variant="link" className="mt-2 px-0" asChild>
          <Link to="/rooms">Back to list</Link>
        </Button>
      </div>
    );
  }

  if (mode === 'edit' && (loadState === 'loading' || loadState === 'idle')) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading room…
        </p>
      </div>
    );
  }

  if (mode === 'edit' && loadState === 'err') {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <p className="text-destructive text-sm" role="alert">
          {loadErr}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadRoom()}>
            Retry
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/rooms">Back to list</Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = mode === 'create' ? 'New room' : `Edit room ${roomNumber.trim() || `#${editId}`}`;

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/rooms" aria-label="Back to rooms list">
            ← Rooms
          </Link>
        </Button>
      </div>

      <Card className="border-border/80 border-l-4 border-l-primary shadow-sm">
        <CardHeader>
          <CardTitle className="font-ui text-lg">{title}</CardTitle>
          <CardDescription id={`${formId}-hint`}>
            Room type, nightly rate, and operational status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={formId}
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-6"
            noValidate
            aria-describedby={`${formId}-hint`}
          >
            <div className="space-y-2">
              <Label htmlFor={roomNumberId}>Room number</Label>
              <Input
                id={roomNumberId}
                value={roomNumber}
                onChange={(ev) => setRoomNumber(ev.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={typeId}>Room type</Label>
              <Input
                id={typeId}
                value={roomType}
                onChange={(ev) => setRoomType(ev.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={priceId}>Nightly rate (USD)</Label>
              <Input
                id={priceId}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={statusId}>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id={statusId} className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {fieldErr ? (
              <p className="text-destructive text-sm" role="alert">
                {fieldErr}
              </p>
            ) : null}
            {submitErr ? (
              <p className="text-destructive text-sm" role="alert" aria-live="assertive">
                {submitErr}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : mode === 'create' ? 'Create room' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={submitting}>
                <Link to="/rooms">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
