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
import { useAuth } from '@renderer/lib/auth-context';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { Hotel } from 'lucide-react';
import type { FormEvent, JSX } from 'react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/** Matches seed default user (see `seed-default-user.ts` / README); dev-only prefill. */
const DEV_LOGIN_DEFAULTS = { username: 'admin', password: 'changeme' } as const;

function devInitialUsername(): string {
  return import.meta.env.DEV ? DEV_LOGIN_DEFAULTS.username : '';
}

function devInitialPassword(): string {
  return import.meta.env.DEV ? DEV_LOGIN_DEFAULTS.password : '';
}

export function LoginPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const formId = useId();
  const userId = `${formId}-user`;
  const passId = `${formId}-pass`;
  const [username, setUsername] = useState(() => devInitialUsername());
  const [password, setPassword] = useState(() => devInitialPassword());
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await starHotel.api.auth.login({ username: username.trim(), password });
      setToken(res.token, res.user);
      navigate('/', { replace: true });
    } catch (error: unknown) {
      setErr(starHotel.formatEmbeddedApiUserMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-2">
        <Hotel className="text-primary size-10" aria-hidden />
        <span className="font-display text-foreground text-xl font-semibold tracking-tight">
          Star Hotel
        </span>
      </div>
      <Card className="border-border w-full max-w-sm border-l-4 border-l-primary shadow-sm">
        <CardHeader>
          <CardTitle className="font-ui text-lg">Sign in</CardTitle>
          <CardDescription>
            Default dev user: <span className="font-mono">admin</span> /{' '}
            <span className="font-mono">changeme</span> (change after first run).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor={userId}>Username</Label>
              <Input
                id={userId}
                name="username"
                autoComplete="username"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={passId}>Password</Label>
              <Input
                id={passId}
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
              />
            </div>
            {err ? (
              <p className="text-destructive text-sm" role="alert">
                {err}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
