import type {
  UserAdminCreateBody,
  UserAdminResponse,
  UserAdminUpdateBody,
  UserModulesDetailResponse,
  UserModulesPutBody,
} from '@shared/schemas/user-admin';
import * as argon2 from 'argon2';
import { UserModuleRepository } from '../auth/user-module-repository';
import type { UserPublicRow, UserRepository } from '../auth/user-repository';
import {
  LastAdminMutationError,
  UserAdminNotFoundError,
  UsernameConflictError,
} from './user-admin-errors';

const ADMIN_ROLE = 'Admin';

function isAdminRole(role: string): boolean {
  return role.trim().toLowerCase() === ADMIN_ROLE.toLowerCase();
}

function rowToResponse(row: UserPublicRow): UserAdminResponse {
  return { id: row.UserID, username: row.Username, role: row.Role };
}

export class UserAdminService {
  constructor(
    private readonly users: UserRepository,
    private readonly modules: UserModuleRepository,
  ) {}

  list(): UserAdminResponse[] {
    return this.users.listPublic().map(rowToResponse);
  }

  async create(body: UserAdminCreateBody): Promise<UserAdminResponse> {
    const username = body.username.trim();
    if (this.users.getByUsername(username) !== undefined) {
      throw new UsernameConflictError(username);
    }
    const hash = await argon2.hash(body.password);
    const id = this.users.insert({ Username: username, Password: hash, Role: body.role.trim() });
    const row = this.users.getById(id);
    if (row === undefined) {
      throw new UserAdminNotFoundError(id);
    }
    return { id: row.UserID, username: row.Username, role: row.Role };
  }

  update(userId: number, body: UserAdminUpdateBody): UserAdminResponse {
    const existing = this.users.getById(userId);
    if (existing === undefined) {
      throw new UserAdminNotFoundError(userId);
    }
    const nextUsername = body.username?.trim() ?? existing.Username;
    const nextRole = body.role?.trim() ?? existing.Role;

    if (nextUsername.toLowerCase() !== existing.Username.toLowerCase()) {
      const clash = this.users.getByUsername(nextUsername);
      if (clash !== undefined && clash.UserID !== userId) {
        throw new UsernameConflictError(nextUsername);
      }
    }

    if (isAdminRole(existing.Role) && !isAdminRole(nextRole)) {
      if (this.users.countByRole(ADMIN_ROLE) <= 1) {
        throw new LastAdminMutationError();
      }
    }

    const ok = this.users.updatePublicFields(userId, { Username: nextUsername, Role: nextRole });
    if (!ok) {
      throw new UserAdminNotFoundError(userId);
    }
    const row = this.users.getById(userId);
    if (row === undefined) {
      throw new UserAdminNotFoundError(userId);
    }
    return { id: row.UserID, username: row.Username, role: row.Role };
  }

  delete(userId: number): void {
    const existing = this.users.getById(userId);
    if (existing === undefined) {
      throw new UserAdminNotFoundError(userId);
    }
    if (isAdminRole(existing.Role) && this.users.countByRole(ADMIN_ROLE) <= 1) {
      throw new LastAdminMutationError('Cannot delete the last Admin user');
    }
    const ok = this.users.deleteById(userId);
    if (!ok) {
      throw new UserAdminNotFoundError(userId);
    }
  }

  getModules(userId: number): UserModulesDetailResponse {
    const existing = this.users.getById(userId);
    if (existing === undefined) {
      throw new UserAdminNotFoundError(userId);
    }
    const explicit = this.modules.listExplicitKeys(userId);
    if (explicit.length === 0) {
      return { accessMode: 'default', moduleKeys: [...this.modules.resolveForUser(userId)] };
    }
    return { accessMode: 'custom', moduleKeys: explicit };
  }

  putModules(userId: number, body: UserModulesPutBody): UserModulesDetailResponse {
    const existing = this.users.getById(userId);
    if (existing === undefined) {
      throw new UserAdminNotFoundError(userId);
    }
    this.modules.replaceForUser(userId, body.moduleKeys);
    return this.getModules(userId);
  }
}
