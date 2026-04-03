import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
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
import type { JSX } from 'react';
import { Link } from 'react-router-dom';

/** F6 entry — quick links to per-user module access (frmModuleAccess). */
export function ModuleAccessListPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list } = useEmbeddedListLoad<UserAdminResponse>({
    load: () => starHotel.api.users.list(),
    formatError: (e) => starHotel.formatEmbeddedApiUserMessage(e),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
          Module access
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose a user to edit which F-key modules they may use.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-base">Users</CardTitle>
          <CardDescription>Maps to legacy toolbar modules (Esc / F2–F8).</CardDescription>
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
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" variant="secondary" asChild>
                        <Link to={`/admin/users/${u.id}/access`}>Edit access</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
