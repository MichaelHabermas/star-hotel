import type { HttpMappableError } from '../http/http-mappable';

export class UserAdminNotFoundError extends Error implements HttpMappableError {
  readonly httpStatus = 404 as const;
  readonly errorCode = 'USER_NOT_FOUND' as const;

  constructor(readonly userId: number) {
    super('User not found');
    this.name = 'UserAdminNotFoundError';
  }
}

export class UsernameConflictError extends Error implements HttpMappableError {
  readonly httpStatus = 409 as const;
  readonly errorCode = 'USERNAME_CONFLICT' as const;

  constructor(readonly username: string) {
    super('Username already exists');
    this.name = 'UsernameConflictError';
  }
}

export class LastAdminMutationError extends Error implements HttpMappableError {
  readonly httpStatus = 409 as const;
  readonly errorCode = 'LAST_ADMIN' as const;

  constructor(message = 'Cannot remove or demote the last Admin user') {
    super(message);
    this.name = 'LastAdminMutationError';
  }
}
