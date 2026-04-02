import * as argon2 from 'argon2'
import type { LoginBody } from '@shared/schemas/auth'
import { AuthInvalidCredentialsError } from './auth-errors'
import { createSessionToken, deleteSession, getSession, putSession, type SessionRecord } from './session-store'
import type { UserRepository } from './user-repository'

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async login(body: LoginBody): Promise<{ token: string; user: { id: number; username: string; role: string } }> {
    const row = this.users.getByUsername(body.username.trim())
    if (!row) {
      throw new AuthInvalidCredentialsError()
    }
    const ok = await verifyPassword(body.password, row.Password)
    if (!ok) {
      throw new AuthInvalidCredentialsError()
    }
    const token = createSessionToken()
    const user: SessionRecord = {
      userId: row.UserID,
      username: row.Username,
      role: row.Role,
    }
    putSession(token, user)
    return { token, user: { id: row.UserID, username: row.Username, role: row.Role } }
  }

  logout(token: string | undefined): void {
    if (token) {
      deleteSession(token)
    }
  }

  me(token: string | undefined): { id: number; username: string; role: string } {
    if (!token) {
      throw new AuthInvalidCredentialsError('Not authenticated')
    }
    const s = getSession(token)
    if (!s) {
      throw new AuthInvalidCredentialsError('Session expired')
    }
    return { id: s.userId, username: s.username, role: s.role }
  }
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const trimmed = stored.trim()
  if (trimmed.startsWith('$argon2')) {
    try {
      return await argon2.verify(trimmed, plain)
    } catch {
      return false
    }
  }
  return false
}
