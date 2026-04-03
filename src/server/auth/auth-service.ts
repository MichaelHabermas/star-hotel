import type { HotelModuleKey } from '@shared/hotel-modules';
import type { LoginBody } from '@shared/schemas/auth';
import type { ChangePasswordBody } from '@shared/schemas/auth-password';
import * as argon2 from 'argon2';
import { AuthInvalidCredentialsError } from './auth-errors';
import type { SessionRecord, StarHotelSessionStore } from './session-store';
import type { UserModuleRepository } from './user-module-repository';
import type { UserRepository } from './user-repository';

export type AuthSessionUser = { id: number; username: string; role: string };

export type AuthMePayload = {
  user: AuthSessionUser;
  moduleKeys: readonly HotelModuleKey[];
};

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: StarHotelSessionStore,
    private readonly modules: UserModuleRepository,
  ) {}

  async login(
    body: LoginBody,
  ): Promise<{ token: string; user: AuthSessionUser; moduleKeys: readonly HotelModuleKey[] }> {
    const row = this.users.getByUsername(body.username.trim());
    if (!row) {
      throw new AuthInvalidCredentialsError();
    }
    const ok = await verifyPassword(body.password, row.Password);
    if (!ok) {
      throw new AuthInvalidCredentialsError();
    }
    const token = this.sessions.createSessionToken();
    const user: SessionRecord = {
      userId: row.UserID,
      username: row.Username,
      role: row.Role,
    };
    this.sessions.putSession(token, user);
    const moduleKeys = this.modules.resolveForUser(row.UserID);
    return {
      token,
      user: { id: row.UserID, username: row.Username, role: row.Role },
      moduleKeys,
    };
  }

  logout(token: string | undefined): void {
    if (token) {
      this.sessions.deleteSession(token);
    }
  }

  me(token: string | undefined): AuthMePayload {
    if (!token) {
      throw new AuthInvalidCredentialsError('Not authenticated');
    }
    const s = this.sessions.getSession(token);
    if (!s) {
      throw new AuthInvalidCredentialsError('Session expired');
    }
    const moduleKeys = this.modules.resolveForUser(s.userId);
    return {
      user: { id: s.userId, username: s.username, role: s.role },
      moduleKeys,
    };
  }

  async changePassword(userId: number, body: ChangePasswordBody): Promise<void> {
    const row = this.users.getById(userId);
    if (!row) {
      throw new AuthInvalidCredentialsError('Not authenticated');
    }
    const ok = await verifyPassword(body.currentPassword, row.Password);
    if (!ok) {
      throw new AuthInvalidCredentialsError('Current password is incorrect');
    }
    const hash = await argon2.hash(body.newPassword);
    const updated = this.users.updatePassword(userId, hash);
    if (!updated) {
      throw new AuthInvalidCredentialsError('Not authenticated');
    }
  }
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const trimmed = stored.trim();
  if (trimmed.startsWith('$argon2')) {
    try {
      return await argon2.verify(trimmed, plain);
    } catch {
      return false;
    }
  }
  return false;
}
