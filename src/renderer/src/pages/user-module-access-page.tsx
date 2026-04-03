import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { Label } from '@renderer/components/ui/label';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { HOTEL_MODULE_KEYS, HOTEL_MODULE_LABELS, type HotelModuleKey } from '@shared/hotel-modules';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export function UserModuleAccessPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { userId: idParam } = useParams<{ userId: string }>();
  const userId = Number.parseInt(idParam ?? '', 10);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<'default' | 'custom'>('default');
  const [selected, setSelected] = useState<Set<HotelModuleKey>>(new Set(HOTEL_MODULE_KEYS));
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(userId) || userId <= 0) {
      setErr('Invalid user id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const d = await starHotel.api.users.getModules(userId);
      setAccessMode(d.accessMode);
      setSelected(new Set(d.moduleKeys));
    } catch (e) {
      setErr(starHotel.formatEmbeddedApiUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [starHotel, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(k: HotelModuleKey): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  }

  async function onSave(): Promise<void> {
    setPending(true);
    setErr(null);
    try {
      const keys = HOTEL_MODULE_KEYS.filter((k) => selected.has(k));
      const d = await starHotel.api.users.putModules(userId, { moduleKeys: keys });
      setAccessMode(d.accessMode);
      setSelected(new Set(d.moduleKeys));
    } catch (e) {
      setErr(starHotel.formatEmbeddedApiUserMessage(e));
    } finally {
      setPending(false);
    }
  }

  if (!Number.isFinite(userId) || userId <= 0) {
    return (
      <div className="p-6">
        <p className="text-destructive text-sm">Invalid user</p>
        <Button type="button" variant="link" asChild>
          <Link to="/admin/module-access">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
      <Button type="button" variant="ghost" size="sm" asChild>
        <Link to="/admin/module-access">← Module access</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-lg">User #{userId}</CardTitle>
          <CardDescription>
            Mode: {accessMode === 'default' ? 'default (all modules)' : 'custom list'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : err ? (
            <p className="text-destructive text-sm">{err}</p>
          ) : (
            <ul className="space-y-3">
              {HOTEL_MODULE_KEYS.map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <input
                    id={`mod-${k}`}
                    type="checkbox"
                    className="border-input size-4 rounded"
                    checked={selected.has(k)}
                    onChange={() => {
                      toggle(k);
                    }}
                  />
                  <Label htmlFor={`mod-${k}`} className="font-ui text-sm font-normal">
                    {HOTEL_MODULE_LABELS[k]}
                  </Label>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void onSave()} disabled={pending || loading}>
              {pending ? 'Saving…' : 'Save access'}
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
