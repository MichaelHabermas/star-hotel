import { randomBytes } from 'node:crypto';

export type SessionRecord = {
  readonly userId: number;
  readonly username: string;
  readonly role: string;
};

const sessions = new Map<string, SessionRecord>();

export function createSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function putSession(token: string, record: SessionRecord): void {
  sessions.set(token, record);
}

export function getSession(token: string): SessionRecord | undefined {
  return sessions.get(token);
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
