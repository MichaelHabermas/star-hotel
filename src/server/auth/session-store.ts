import { randomBytes } from 'node:crypto';

export type SessionRecord = {
  readonly userId: number;
  readonly username: string;
  readonly role: string;
};

/** In-memory session backing for embedded API auth (inject for tests / future Redis, etc.). */
export type StarHotelSessionStore = {
  createSessionToken(): string;
  getSession(token: string): SessionRecord | undefined;
  putSession(token: string, record: SessionRecord): void;
  deleteSession(token: string): void;
};

export function createInMemorySessionStore(): StarHotelSessionStore {
  const sessions = new Map<string, SessionRecord>();
  return {
    createSessionToken() {
      return randomBytes(32).toString('hex');
    },
    getSession(token: string) {
      return sessions.get(token);
    },
    putSession(token: string, record: SessionRecord) {
      sessions.set(token, record);
    },
    deleteSession(token: string) {
      sessions.delete(token);
    },
  };
}
