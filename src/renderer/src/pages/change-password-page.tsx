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
import { changePasswordBodySchema } from '@shared/schemas/auth-password';
import type { FormEvent, JSX } from 'react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

export function ChangePasswordPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const formId = useId();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErr(null);
    setOk(false);
    const parsed = changePasswordBodySchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setPending(true);
    try {
      await starHotel.api.auth.changePassword(parsed.data);
      setOk(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (ex) {
      setErr(starHotel.formatEmbeddedApiUserMessage(ex));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <Button type="button" variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/">← Home</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-lg">Change password</CardTitle>
          <CardDescription>Security (legacy F8). Passwords are stored with Argon2.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id={formId} className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-cur`}>Current password</Label>
              <Input
                id={`${formId}-cur`}
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(ev) => setCurrentPassword(ev.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-new`}>New password</Label>
              <Input
                id={`${formId}-new`}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(ev) => setNewPassword(ev.target.value)}
                required
                minLength={8}
              />
            </div>
            {err ? (
              <p className="text-destructive text-sm" role="alert">
                {err}
              </p>
            ) : null}
            {ok ? (
              <p className="text-muted-foreground text-sm" role="status">
                Password updated.
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
