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
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { guestCreateBodySchema, guestUpdateBodySchema } from '@shared/schemas/guest';
import type { FormEvent, JSX } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type GuestFormPageProps = {
  readonly mode: 'create' | 'edit';
};

export function GuestFormPage({ mode }: GuestFormPageProps): JSX.Element {
  const starHotel = useStarHotelApp();
  const navigate = useNavigate();
  const { guestId: idParam } = useParams<{ guestId: string }>();
  const formId = useId();
  const nameId = `${formId}-name`;
  const idNumId = `${formId}-idnum`;
  const contactId = `${formId}-contact`;

  const editId = mode === 'edit' && idParam ? Number.parseInt(idParam, 10) : NaN;
  const editIdValid = mode === 'edit' && Number.isFinite(editId) && editId > 0;

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [contact, setContact] = useState('');

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGuest = useCallback(async () => {
    if (!editIdValid) {
      return;
    }
    setLoadState('loading');
    setLoadErr(null);
    try {
      const g = await starHotel.api.guests.get(editId);
      setName(g.name);
      setIdNumber(g.idNumber ?? '');
      setContact(g.contact ?? '');
      setLoadState('ok');
    } catch (err) {
      setLoadState('err');
      setLoadErr(starHotel.formatEmbeddedApiUserMessage(err));
    }
  }, [editIdValid, editId, starHotel]);

  useEffect(() => {
    if (mode === 'edit') {
      void loadGuest();
    } else {
      setLoadState('ok');
    }
  }, [mode, loadGuest]);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitErr(null);
    setFieldErr(null);

    if (mode === 'create') {
      const parsed = guestCreateBodySchema.safeParse({
        name: name.trim(),
        idNumber: idNumber.trim() === '' ? undefined : idNumber.trim(),
        contact: contact.trim() === '' ? undefined : contact.trim(),
      });
      if (!parsed.success) {
        setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input');
        return;
      }
      setSubmitting(true);
      try {
        await starHotel.api.guests.create(parsed.data);
        navigate('/guests');
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
    if (name.trim() !== '') {
      body.name = name.trim();
    }
    body.idNumber = idNumber.trim() === '' ? null : idNumber.trim();
    body.contact = contact.trim() === '' ? null : contact.trim();

    const parsed = guestUpdateBodySchema.safeParse(body);
    if (!parsed.success) {
      setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setSubmitting(true);
    try {
      await starHotel.api.guests.update(editId, parsed.data);
      navigate('/guests');
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
          Invalid guest id.
        </p>
        <Button type="button" variant="link" className="mt-2 px-0" asChild>
          <Link to="/guests">Back to list</Link>
        </Button>
      </div>
    );
  }

  if (mode === 'edit' && (loadState === 'loading' || loadState === 'idle')) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading guest…
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
          <Button type="button" variant="outline" onClick={() => void loadGuest()}>
            Retry
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/guests">Back to list</Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = mode === 'create' ? 'Guest card' : `Edit guest #${editId}`;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/guests" aria-label="Back to guests list">
            ← Guests
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-4 border-border/80 border-l-4 border-l-primary py-4 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-lg">{title}</CardTitle>
            <CardDescription id={`${formId}-hint`}>
              Maintain guest identity, reference, and contact from one guest card.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guest
              </p>
              <p className="mt-2 font-medium">{name.trim() || 'New guest'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ID / Ref
              </p>
              <p className="mt-2 font-medium">{idNumber.trim() || '—'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact
              </p>
              <p className="mt-2 font-medium">{contact.trim() || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Desk guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Keep guest identity and contact ready for reservation lookup.
            </p>
            <p className="text-muted-foreground">
              Save the guest card before returning to booking or desk lookup.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 border-l-4 border-l-primary shadow-sm">
        <CardHeader>
          <CardTitle className="font-ui text-lg">Guest fields</CardTitle>
          <CardDescription>Name, ID/reference, and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={formId}
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-6"
            noValidate
            aria-describedby={`${formId}-hint`}
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4">
                <div className="space-y-1">
                  <h2 className="font-ui text-base font-semibold">Guest identity</h2>
                  <p className="text-muted-foreground text-sm">
                    Use the same naming and reference style staff expects from the old guest card.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Name</Label>
                  <Input
                    id={nameId}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={idNumId}>ID / reference (optional)</Label>
                  <Input
                    id={idNumId}
                    value={idNumber}
                    onChange={(ev) => setIdNumber(ev.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4">
                <div className="space-y-1">
                  <h2 className="font-ui text-base font-semibold">Contact</h2>
                  <p className="text-muted-foreground text-sm">
                    Keep reachable contact details available for desk lookup and reservation handoff.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={contactId}>Contact (optional)</Label>
                  <Input
                    id={contactId}
                    type="text"
                    value={contact}
                    onChange={(ev) => setContact(ev.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
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

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div />
              <div className="space-y-2 rounded-xl border border-border/70 bg-muted/10 p-4">
                <p className="font-ui text-sm font-semibold">Actions</p>
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving…' : mode === 'create' ? 'Save guest card' : 'Save changes'}
                  </Button>
                  <Button type="button" variant="outline" asChild disabled={submitting}>
                    <Link to="/guests">Cancel</Link>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
