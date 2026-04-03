import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table';
import { useEmbeddedListLoad } from '@renderer/lib/use-embedded-list-load';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { UserAdminResponse } from '@shared/schemas/user-admin';
import type { FormEvent, JSX } from 'react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

export function UsersAdminPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const formId = useId();
  const { list, reload } = useEmbeddedListLoad<UserAdminResponse>({
    load: () => starHotel.api.users.list(),
    formatError: (e) => starHotel.formatEmbeddedApiUserMessage(e),
  });

  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FrontDesk');
  const [formErr, setFormErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    setFormErr(null);
    setPending(true);
    try {
      await starHotel.api.users.create({
        username: username.trim(),
        password,
        role: role.trim(),
      });
      setOpen(false);
      setUsername('');
      setPassword('');
      setRole('FrontDesk');
      await reload();
    } catch (ex) {
      setFormErr(starHotel.formatEmbeddedApiUserMessage(ex));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
            Users
          </h1>
          <p className="text-muted-foreground text-sm">Legacy frmUserMaintain — Admin only.</p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          New user
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-base">Directory</CardTitle>
          <CardDescription>Module access is edited per user (F6).</CardDescription>
        </CardHeader>
        <CardContent>
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : list.kind === 'err' ? (
            <p className="text-destructive text-sm">{list.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono tabular-nums">{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to={`/admin/users/${u.id}/access`}>Module access</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form id={formId} onSubmit={(e) => void onCreate(e)}>
            <DialogHeader>
              <DialogTitle>Create user</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor={`${formId}-u`}>Username</Label>
                <Input
                  id={`${formId}-u`}
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${formId}-p`}>Password</Label>
                <Input
                  id={`${formId}-p`}
                  type="password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${formId}-r`}>Role</Label>
                <Input
                  id={`${formId}-r`}
                  value={role}
                  onChange={(ev) => setRole(ev.target.value)}
                  placeholder="Admin, FrontDesk, …"
                  required
                />
              </div>
              {formErr ? (
                <p className="text-destructive text-sm" role="alert">
                  {formErr}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
