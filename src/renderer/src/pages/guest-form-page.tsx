import type { FormEvent, JSX } from 'react'
import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app'
import { guestCreateBodySchema, guestUpdateBodySchema } from '@shared/schemas/guest'

type GuestFormPageProps = {
  readonly mode: 'create' | 'edit'
}

export function GuestFormPage({ mode }: GuestFormPageProps): JSX.Element {
  const starHotel = useStarHotelApp()
  const navigate = useNavigate()
  const { guestId: idParam } = useParams<{ guestId: string }>()
  const formId = useId()
  const nameId = `${formId}-name`
  const idNumId = `${formId}-idnum`
  const contactId = `${formId}-contact`

  const editId = mode === 'edit' && idParam ? Number.parseInt(idParam, 10) : NaN
  const editIdValid = mode === 'edit' && Number.isFinite(editId) && editId > 0

  const [name, setName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [contact, setContact] = useState('')

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [submitErr, setSubmitErr] = useState<string | null>(null)
  const [fieldErr, setFieldErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadGuest = useCallback(async () => {
    if (!editIdValid) {
      return
    }
    setLoadState('loading')
    setLoadErr(null)
    try {
      const g = await starHotel.api.guests.get(editId)
      setName(g.name)
      setIdNumber(g.idNumber ?? '')
      setContact(g.contact ?? '')
      setLoadState('ok')
    } catch (err) {
      setLoadState('err')
      setLoadErr(starHotel.formatEmbeddedApiUserMessage(err))
    }
  }, [editIdValid, editId, starHotel])

  useEffect(() => {
    if (mode === 'edit') {
      void loadGuest()
    } else {
      setLoadState('ok')
    }
  }, [mode, loadGuest])

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitErr(null)
    setFieldErr(null)

    if (mode === 'create') {
      const parsed = guestCreateBodySchema.safeParse({
        name: name.trim(),
        idNumber: idNumber.trim() === '' ? undefined : idNumber.trim(),
        contact: contact.trim() === '' ? undefined : contact.trim(),
      })
      if (!parsed.success) {
        setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input')
        return
      }
      setSubmitting(true)
      try {
        await starHotel.api.guests.create(parsed.data)
        navigate('/guests')
      } catch (err) {
        setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err))
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!editIdValid) {
      return
    }
    const body: Record<string, unknown> = {}
    if (name.trim() !== '') {
      body.name = name.trim()
    }
    body.idNumber = idNumber.trim() === '' ? null : idNumber.trim()
    body.contact = contact.trim() === '' ? null : contact.trim()

    const parsed = guestUpdateBodySchema.safeParse(body)
    if (!parsed.success) {
      setFieldErr(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setSubmitting(true)
    try {
      await starHotel.api.guests.update(editId, parsed.data)
      navigate('/guests')
    } catch (err) {
      setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err))
    } finally {
      setSubmitting(false)
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
    )
  }

  if (mode === 'edit' && (loadState === 'loading' || loadState === 'idle')) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading guest…
        </p>
      </div>
    )
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
    )
  }

  const title = mode === 'create' ? 'New guest' : `Edit guest #${editId}`

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/guests" aria-label="Back to guests list">
            ← Guests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-lg">{title}</CardTitle>
          <CardDescription id={`${formId}-hint`}>Name, optional ID reference, and contact.</CardDescription>
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
              <Label htmlFor={nameId}>Name</Label>
              <Input id={nameId} value={name} onChange={(ev) => setName(ev.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={idNumId}>ID / reference (optional)</Label>
              <Input id={idNumId} value={idNumber} onChange={(ev) => setIdNumber(ev.target.value)} autoComplete="off" />
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
                {submitting ? 'Saving…' : mode === 'create' ? 'Create guest' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={submitting}>
                <Link to="/guests">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
